import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

const ALLOWED_SLUGS = ['privacy', 'terms']

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { slug } = await params

  if (!ALLOWED_SLUGS.includes(slug)) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  try {
    const { title, content } = await request.json()

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    await prisma.systemSetting.upsert({
      where:  { key: `page_${slug}` },
      update: { value: JSON.stringify({ title: title.trim(), content: content.trim() }) },
      create: { key: `page_${slug}`, value: JSON.stringify({ title: title.trim(), content: content.trim() }) },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
