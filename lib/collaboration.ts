import { PrismaClient, ContentType, CollaborationStatus } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export { ContentType, CollaborationStatus }

const OWNER_FIELD: Record<ContentType, string> = {
  FORM: 'userId',
  PROJECT: 'authorId',
  EVENT: 'organizerId',
  OPPORTUNITY: 'posterId',
  SERVICE: 'providerId',
  RESOURCE: 'userId',
  MARKETPLACE: 'sellerId',
  NEWS: 'authorId',
  CLUB: 'createdById',
}

const CONTENT_TITLE_FIELD: Record<ContentType, string> = {
  FORM: 'title',
  PROJECT: 'title',
  EVENT: 'title',
  OPPORTUNITY: 'title',
  SERVICE: 'title',
  RESOURCE: 'title',
  MARKETPLACE: 'title',
  NEWS: 'title',
  CLUB: 'name',
}

// Returns the Prisma delegate for the given content type
function delegateFor(contentType: ContentType): any {
  switch (contentType) {
    case 'FORM': return prisma.universalForm
    case 'PROJECT': return prisma.project
    case 'EVENT': return prisma.event
    case 'OPPORTUNITY': return prisma.opportunity
    case 'SERVICE': return prisma.service
    case 'RESOURCE': return prisma.resource
    case 'MARKETPLACE': return prisma.marketplaceListing
    case 'NEWS': return prisma.newsArticle
    case 'CLUB': return prisma.club
  }
}

export async function getContentOwnerId(
  contentType: ContentType,
  contentId: string,
): Promise<string | null> {
  const field = OWNER_FIELD[contentType]
  const row = await delegateFor(contentType).findUnique({
    where: { id: contentId },
    select: { [field]: true },
  })
  return row ? (row as any)[field] : null
}

export async function getContentTitle(
  contentType: ContentType,
  contentId: string,
): Promise<string> {
  const field = CONTENT_TITLE_FIELD[contentType]
  const row = await delegateFor(contentType).findUnique({
    where: { id: contentId },
    select: { [field]: true },
  })
  return row ? String((row as any)[field] ?? 'Untitled') : 'Untitled'
}

export async function isOwner(
  userId: string,
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  const ownerId = await getContentOwnerId(contentType, contentId)
  return ownerId === userId
}

export async function isAcceptedCollaborator(
  userId: string,
  userEmail: string,
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  const row = await prisma.contentCollaborator.findFirst({
    where: {
      contentType,
      contentId,
      status: 'ACCEPTED',
      OR: [
        { collaboratorUserId: userId },
        { collaboratorEmail: userEmail.toLowerCase() },
      ],
    },
    select: { id: true },
  })
  return !!row
}

export async function canEdit(
  userId: string,
  userEmail: string,
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  if (await isOwner(userId, contentType, contentId)) return true
  return isAcceptedCollaborator(userId, userEmail, contentType, contentId)
}

export async function canDelete(
  userId: string,
  contentType: ContentType,
  contentId: string,
): Promise<boolean> {
  return isOwner(userId, contentType, contentId)
}

export async function listCollaborators(
  contentType: ContentType,
  contentId: string,
) {
  return prisma.contentCollaborator.findMany({
    where: { contentType, contentId, status: { not: 'REVOKED' } },
    include: {
      collaborator: { select: { id: true, username: true, fullName: true, email: true, avatar: true } },
      invitedBy: { select: { id: true, username: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createOrRefreshInvite(params: {
  contentType: ContentType
  contentId: string
  invitedByUserId: string
  collaboratorEmail: string
  message?: string
}) {
  const email = params.collaboratorEmail.toLowerCase().trim()
  // Look up existing invite for same (contentType, contentId, email)
  const existing = await prisma.contentCollaborator.findUnique({
    where: {
      contentType_contentId_collaboratorEmail: {
        contentType: params.contentType,
        contentId: params.contentId,
        collaboratorEmail: email,
      },
    },
  })

  // Try to link to existing platform user with that email
  const user = await prisma.user.findUnique({ where: { email } })

  const token = generateInvitationToken()

  if (existing) {
    // Re-issue token if revoked or declined; keep ACCEPTED as-is
    if (existing.status === 'ACCEPTED') {
      return { invite: existing, reissued: false }
    }
    const updated = await prisma.contentCollaborator.update({
      where: { id: existing.id },
      data: {
        status: 'PENDING',
        invitationToken: token,
        invitedByUserId: params.invitedByUserId,
        collaboratorUserId: user?.id ?? null,
        message: params.message ?? existing.message,
        createdAt: new Date(),
        revokedAt: null,
      },
    })
    return { invite: updated, reissued: true }
  }

  const created = await prisma.contentCollaborator.create({
    data: {
      contentType: params.contentType,
      contentId: params.contentId,
      invitedByUserId: params.invitedByUserId,
      collaboratorEmail: email,
      collaboratorUserId: user?.id ?? null,
      status: 'PENDING',
      invitationToken: token,
      message: params.message,
    },
  })
  return { invite: created, reissued: false }
}

export async function acceptInvite(token: string, acceptingUser: { id: string; email: string }) {
  const invite = await prisma.contentCollaborator.findUnique({ where: { invitationToken: token } })
  if (!invite) return { ok: false as const, error: 'Invitation not found' }
  if (invite.status === 'ACCEPTED') return { ok: true as const, invite }
  if (invite.status === 'REVOKED') return { ok: false as const, error: 'This invitation has been revoked' }

  // Verify the accepting user's email matches the invited email
  if (invite.collaboratorEmail.toLowerCase() !== acceptingUser.email.toLowerCase()) {
    return { ok: false as const, error: 'This invitation was sent to a different email address' }
  }

  const updated = await prisma.contentCollaborator.update({
    where: { id: invite.id },
    data: {
      status: 'ACCEPTED',
      collaboratorUserId: acceptingUser.id,
      acceptedAt: new Date(),
    },
  })
  return { ok: true as const, invite: updated }
}

export async function revokeInvite(inviteId: string, requestingUserId: string) {
  const invite = await prisma.contentCollaborator.findUnique({ where: { id: inviteId } })
  if (!invite) return { ok: false as const, error: 'Invitation not found' }
  const ownerId = await getContentOwnerId(invite.contentType, invite.contentId)
  if (ownerId !== requestingUserId) {
    return { ok: false as const, error: 'Only the owner can revoke invitations' }
  }
  const updated = await prisma.contentCollaborator.update({
    where: { id: inviteId },
    data: { status: 'REVOKED', revokedAt: new Date() },
  })
  return { ok: true as const, invite: updated }
}

export const CONTENT_URL_PATH: Record<ContentType, (id: string) => string> = {
  FORM: (id) => `/forms/${id}/edit`,
  PROJECT: (id) => `/projects/${id}/edit`,
  EVENT: (id) => `/events/${id}/edit`,
  OPPORTUNITY: (id) => `/opportunities/${id}`,
  SERVICE: (id) => `/services/${id}`,
  RESOURCE: (id) => `/resources/${id}`,
  MARKETPLACE: (id) => `/marketplace/${id}/edit`,
  NEWS: (id) => `/news/${id}`,
  CLUB: (id) => `/clubs/${id}`,
}

export const CONTENT_LABEL: Record<ContentType, string> = {
  FORM: 'form',
  PROJECT: 'project',
  EVENT: 'event',
  OPPORTUNITY: 'opportunity',
  SERVICE: 'service',
  RESOURCE: 'resource',
  MARKETPLACE: 'marketplace listing',
  NEWS: 'news article',
  CLUB: 'club',
}
