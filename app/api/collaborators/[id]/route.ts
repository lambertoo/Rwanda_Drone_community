import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { revokeInvite } from '@/lib/collaboration'

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId } = auth.user

  const { id } = await context.params
  const result = await revokeInvite(id, userId)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 403 })
  return NextResponse.json({ ok: true, invite: result.invite })
}
