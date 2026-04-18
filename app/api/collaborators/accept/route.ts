import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { acceptInvite, CONTENT_URL_PATH } from '@/lib/collaboration'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { body = {} }
  const token = String(body.token || '').trim()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const result = await acceptInvite(token, user)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  const redirectUrl = CONTENT_URL_PATH[result.invite.contentType](result.invite.contentId)
  return NextResponse.json({ ok: true, invite: result.invite, redirectUrl })
}

// Allow GET with token to return the invite details (for the accept page)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const invite = await prisma.contentCollaborator.findUnique({
    where: { invitationToken: token },
    include: {
      invitedBy: { select: { fullName: true, username: true, email: true } },
    },
  })
  if (!invite) return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })

  // Try to fetch the content title without exposing more than needed
  let contentTitle = 'Untitled'
  try {
    const { getContentTitle } = await import('@/lib/collaboration')
    contentTitle = await getContentTitle(invite.contentType, invite.contentId)
  } catch {}

  return NextResponse.json({
    invite: {
      id: invite.id,
      contentType: invite.contentType,
      contentId: invite.contentId,
      collaboratorEmail: invite.collaboratorEmail,
      status: invite.status,
      message: invite.message,
      createdAt: invite.createdAt,
      invitedBy: invite.invitedBy,
    },
    contentTitle,
  })
}
