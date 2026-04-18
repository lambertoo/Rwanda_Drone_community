import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'
import { canEdit } from '@/lib/collaboration'

const VALID_STATUSES = ['approved', 'rejected', 'revision_requested', 'pending_review', 'submitted']

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: formId } = await context.params
  const token = req.cookies.get('accessToken')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const { entryIds, status, comment } = body
  if (!Array.isArray(entryIds) || entryIds.length === 0) {
    return NextResponse.json({ error: 'entryIds must be a non-empty array' }, { status: 400 })
  }
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const form = await prisma.universalForm.findUnique({ where: { id: formId }, select: { id: true } })
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  const allowed = await canEdit(payload.userId, payload.email, 'FORM', formId)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const result = await prisma.formEntry.updateMany({
    where: { id: { in: entryIds }, formId },
    data: {
      status,
      reviewerId: payload.userId,
      reviewComment: comment || null,
      reviewedAt: new Date(),
    },
  })
  return NextResponse.json({ ok: true, count: result.count })
}
