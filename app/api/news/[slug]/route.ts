import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.newsArticle.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            role: true,
            bio: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (!article.isPublished) {
      // Only admins can view unpublished articles
      const user = await getCurrentUser()
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
      }
    }

    // Increment view count
    await prisma.newsArticle.update({
      where: { slug: params.slug },
      data: { viewsCount: { increment: 1 } },
    })

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const article = await prisma.newsArticle.findUnique({ where: { slug: params.slug } })
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

    const body = await request.json()
    const { title, summary, content, thumbnail, category, tags, isPublished, isFeatured } = body

    const updated = await prisma.newsArticle.update({
      where: { slug: params.slug },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(thumbnail !== undefined ? { thumbnail } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(isPublished !== undefined
          ? {
              isPublished,
              publishedAt: isPublished && !article.publishedAt ? new Date() : article.publishedAt,
            }
          : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    })

    return NextResponse.json({ article: updated })
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const article = await prisma.newsArticle.findUnique({ where: { slug: params.slug } })
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })

    await prisma.newsArticle.delete({ where: { slug: params.slug } })

    return NextResponse.json({ success: true, message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
