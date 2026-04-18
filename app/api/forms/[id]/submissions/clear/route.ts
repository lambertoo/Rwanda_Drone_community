import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'
import { canDelete } from '@/lib/collaboration'

/**
 * POST /api/forms/[id]/submissions/clear
 *
 * Wipes every submission on a form. Body must include { confirm: "<form.title>" }
 * as an extra safety check to prevent accidental clicks. Only the form owner
 * (not a collaborator) can clear — mirrors the DELETE permission model.
 */
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: formId } = await context.params

  const token = req.cookies.get('accessToken')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const confirm = String(body?.confirm ?? '')

  const form = await prisma.universalForm.findUnique({
    where: { id: formId },
    select: { id: true, title: true, userId: true, _count: { select: { entries: true } } },
  })
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  // Ownership check (not canEdit — this is a destructive action, collaborators can't do it).
  const allowed = await canDelete(payload.userId, 'FORM', formId)
  if (!allowed) {
    return NextResponse.json({ error: 'Only the form owner can clear submissions' }, { status: 403 })
  }

  // Require the caller to retype the form title, exactly. Trim + case-insensitive
  // compare so small typing mistakes are forgiven.
  if (!confirm || confirm.trim().toLowerCase() !== (form.title || '').trim().toLowerCase()) {
    return NextResponse.json({
      error: 'Confirmation text does not match the form title',
      expected: form.title,
    }, { status: 400 })
  }

  // Delete FormValue rows first via entries cascade (Prisma schema has onDelete: Cascade
  // on the entry relation). A single deleteMany on entries is enough.
  const result = await prisma.formEntry.deleteMany({ where: { formId } })

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    previousCount: form._count.entries,
  })
}
