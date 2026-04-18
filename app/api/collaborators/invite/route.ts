import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, ContentType } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import {
  getContentOwnerId,
  getContentTitle,
  createOrRefreshInvite,
  CONTENT_LABEL,
} from '@/lib/collaboration'
import { sendEmail } from '@/lib/email'
import { collaborationInviteEmail } from '@/lib/email-templates'
import { createNotification } from '@/lib/notifications'
import { CONTENT_URL_PATH } from '@/lib/collaboration'

const prisma = new PrismaClient()

const VALID_TYPES: ContentType[] = [
  'FORM', 'PROJECT', 'EVENT', 'OPPORTUNITY', 'SERVICE',
  'RESOURCE', 'MARKETPLACE', 'NEWS', 'CLUB',
]

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const contentType = String(body.contentType || '').toUpperCase() as ContentType
  const contentId = String(body.contentId || '')
  const email = String(body.email || '').toLowerCase().trim()
  const message = body.message ? String(body.message).slice(0, 500) : undefined

  if (!VALID_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 })
  }
  if (!contentId || !email) {
    return NextResponse.json({ error: 'contentId and email are required' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Only the owner can invite
  const ownerId = await getContentOwnerId(contentType, contentId)
  if (!ownerId) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }
  if (ownerId !== userId) {
    return NextResponse.json({ error: 'Only the owner can invite collaborators' }, { status: 403 })
  }

  // Owner cannot invite themselves
  const inviter = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true, username: true },
  })
  if (inviter && inviter.email.toLowerCase() === email) {
    return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 })
  }

  const { invite } = await createOrRefreshInvite({
    contentType,
    contentId,
    invitedByUserId: userId,
    collaboratorEmail: email,
    message,
  })

  if (invite.status === 'ACCEPTED') {
    return NextResponse.json({
      ok: true,
      invite,
      alreadyAccepted: true,
      message: 'This person is already a collaborator',
    })
  }

  // Resolve content title + URL once for both email and in-app notification.
  const contentTitle = await getContentTitle(contentType, contentId)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://uav.rw'
  const acceptUrl = `${appUrl}/collaborate/accept?token=${invite.invitationToken}`

  // Fire-and-forget email
  try {
    const template = collaborationInviteEmail({
      inviterName: inviter?.fullName || inviter?.username || 'A colleague',
      contentLabel: CONTENT_LABEL[contentType],
      contentTitle,
      acceptUrl,
      personalMessage: message,
    })
    await sendEmail({ to: email, subject: template.subject, html: template.html })
  } catch (err) {
    console.error('[collaborate/invite] email failed', err)
  }

  // In-app notification if the invitee already has an account, so they see it
  // the moment they log in regardless of whether they opened the email.
  if (invite.collaboratorUserId) {
    await createNotification({
      userId: invite.collaboratorUserId,
      type: 'collaboration_invite',
      title: `Invitation to collaborate`,
      body: `${inviter?.fullName || inviter?.username || 'Someone'} invited you to collaborate on "${contentTitle}".`,
      link: `/collaborate/accept?token=${invite.invitationToken}`,
      data: { contentType, contentId, inviteId: invite.id },
    })
  }

  return NextResponse.json({ ok: true, invite })
}
