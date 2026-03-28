import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

// GET — list all custom pages
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { startsWith: 'page_' } },
      orderBy: { key: 'asc' },
    })

    const pages = settings.map((s) => {
      const slug = s.key.replace('page_', '')
      const data = JSON.parse(s.value)
      return { slug, title: data.title, content: data.content, updatedAt: s.updatedAt }
    })

    return NextResponse.json({ pages })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
  }
}

// POST — create a new page
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { title, slug: rawSlug } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const slug = (rawSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50)

    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // Check if already exists
    const existing = await prisma.systemSetting.findUnique({ where: { key: `page_${slug}` } })
    if (existing) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 })
    }

    await prisma.systemSetting.create({
      data: {
        key: `page_${slug}`,
        value: JSON.stringify({ title: title.trim(), content: '' }),
      },
    })

    return NextResponse.json({ success: true, slug })
  } catch {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
