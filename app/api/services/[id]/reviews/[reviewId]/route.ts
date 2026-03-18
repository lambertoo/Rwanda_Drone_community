import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { reviewer: { select: { id: true, username: true, fullName: true, avatar: true } } }
    })
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    return NextResponse.json({ review })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id: serviceId, reviewId } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { service: { select: { providerId: true } } }
    })
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    const body = await request.json()

    // Provider responding to a review
    if (review.service.providerId === user.id) {
      const { response } = body
      if (!response) return NextResponse.json({ error: 'Response text is required' }, { status: 400 })
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { response, responseAt: new Date() },
        include: { reviewer: { select: { id: true, username: true, fullName: true, avatar: true } } }
      })
      return NextResponse.json({ review: updated })
    }

    // Reviewer editing their own review
    if (review.reviewerId === user.id) {
      const { title, body: reviewBody } = body
      if (!reviewBody) return NextResponse.json({ error: 'Review body is required' }, { status: 400 })
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { title, body: reviewBody },
        include: { reviewer: { select: { id: true, username: true, fullName: true, avatar: true } } }
      })
      return NextResponse.json({ review: updated })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id: serviceId, reviewId } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

    if (review.reviewerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.review.delete({ where: { id: reviewId } })

    // Recompute service rating
    const allReviews = await prisma.review.findMany({
      where: { serviceId, isApproved: true },
      select: { rating: true }
    })
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0
    await prisma.service.update({
      where: { id: serviceId },
      data: { rating: avgRating, reviewCount: allReviews.length }
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
