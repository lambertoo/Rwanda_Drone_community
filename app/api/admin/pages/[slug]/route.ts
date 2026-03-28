import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { slug } = await params

  try {
    const { title, content } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    await prisma.systemSetting.upsert({
      where: { key: `page_${slug}` },
      update: { value: JSON.stringify({ title: title.trim(), content: (content || '').trim() }) },
      create: { key: `page_${slug}`, value: JSON.stringify({ title: title.trim(), content: (content || '').trim() }) },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { slug } = await params

  // Prevent deleting core pages
  if (['privacy', 'terms'].includes(slug)) {
    return NextResponse.json({ error: 'Cannot delete core legal pages' }, { status: 400 })
  }

  try {
    await prisma.systemSetting.delete({ where: { key: `page_${slug}` } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
