import { NextRequest, NextResponse } from 'next/server'
import { ContentType } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { listCollaborators, getContentOwnerId } from '@/lib/collaboration'

const VALID_TYPES: ContentType[] = [
  'FORM', 'PROJECT', 'EVENT', 'OPPORTUNITY', 'SERVICE',
  'RESOURCE', 'MARKETPLACE', 'NEWS', 'CLUB',
]

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  const contentType = String(req.nextUrl.searchParams.get('contentType') || '').toUpperCase() as ContentType
  const contentId = req.nextUrl.searchParams.get('contentId') || ''

  if (!VALID_TYPES.includes(contentType) || !contentId) {
    return NextResponse.json({ error: 'Missing or invalid contentType/contentId' }, { status: 400 })
  }

  // Only the owner can view the full collaborator list
  const ownerId = await getContentOwnerId(contentType, contentId)
  if (!ownerId) return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  if (ownerId !== userId) {
    return NextResponse.json({ error: 'Only the owner can view collaborators' }, { status: 403 })
  }

  const collaborators = await listCollaborators(contentType, contentId)
  return NextResponse.json({ collaborators })
}
