import { NextRequest, NextResponse } from 'next/server'
import { ContentType } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { canEdit, canDelete } from '@/lib/collaboration'

const VALID_TYPES: ContentType[] = [
  'FORM', 'PROJECT', 'EVENT', 'OPPORTUNITY', 'SERVICE',
  'RESOURCE', 'MARKETPLACE', 'NEWS', 'CLUB',
]

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId, email } = auth.user

  const contentType = String(req.nextUrl.searchParams.get('contentType') || '').toUpperCase() as ContentType
  const contentId = req.nextUrl.searchParams.get('contentId') || ''

  if (!VALID_TYPES.includes(contentType) || !contentId) {
    return NextResponse.json({ canEdit: false, canDelete: false, role: 'none' }, { status: 400 })
  }

  const [edit, del] = await Promise.all([
    canEdit(userId, email, contentType, contentId),
    canDelete(userId, contentType, contentId),
  ])

  const role = del ? 'owner' : edit ? 'collaborator' : 'none'
  return NextResponse.json({ canEdit: edit, canDelete: del, role })
}
