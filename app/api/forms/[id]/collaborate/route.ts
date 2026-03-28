import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'
import crypto from 'crypto'

/**
 * POST /api/forms/[id]/collaborate — Generate collaboration links
 * Each section gets a unique token that allows someone to fill just that section.
 * All section submissions are linked via a shared collaborationId.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('accessToken')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const formId = id

    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      include: { sections: { orderBy: { order: 'asc' } } },
    })

    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    if (form.userId !== payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Generate a collaboration session ID and per-section tokens
    const collaborationId = crypto.randomBytes(12).toString('hex')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    const links = form.sections.map((section, index) => ({
      sectionId: section.id,
      sectionTitle: section.title,
      sectionIndex: index,
      url: `${baseUrl}/forms/public/${formId}?collab=${collaborationId}&section=${index}`,
    }))

    return NextResponse.json({
      collaborationId,
      links,
      message: 'Share each link with a different contributor. Their responses will be combined.',
    })
  } catch (error) {
    console.error('Error generating collab links:', error)
    return NextResponse.json({ error: 'Failed to generate links' }, { status: 500 })
  }
}
