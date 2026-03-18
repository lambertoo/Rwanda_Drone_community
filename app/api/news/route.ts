import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const articles = await prisma.newsArticle.findMany({
      where: {
        isPublished: true,
        ...(category && category !== 'all' ? { category } : {}),
        ...(featured ? { isFeatured: true } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(limit, 50),
      skip: offset,
    })

    const total = await prisma.newsArticle.count({
      where: {
        isPublished: true,
        ...(category && category !== 'all' ? { category } : {}),
        ...(featured ? { isFeatured: true } : {}),
      },
    })

    return NextResponse.json({ articles, total })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news articles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { title, summary, content, thumbnail, category, tags, isPublished, isFeatured } = body

    if (!title || !summary || !content) {
      return NextResponse.json({ error: 'Title, summary, and content are required' }, { status: 400 })
    }

    // Generate unique slug from title + timestamp
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)
    const slug = `${baseSlug}-${Date.now()}`

    const article = await prisma.newsArticle.create({
      data: {
        authorId: user.id,
        title,
        slug,
        summary,
        content,
        thumbnail: thumbnail || null,
        category: category || 'community',
        tags: tags || [],
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        publishedAt: isPublished ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
