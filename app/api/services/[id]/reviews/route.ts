import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reviews = await prisma.review.findMany({
      where: { serviceId: id, isApproved: true },
      include: { reviewer: { select: { id: true, username: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    })
    const stats = await prisma.review.aggregate({
      where: { serviceId: id, isApproved: true },
      _avg: { rating: true },
      _count: true
    })
    return NextResponse.json({ reviews, stats: { average: stats._avg.rating, count: stats._count } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { rating, title, body: reviewBody } = body
    if (!rating || !reviewBody) return NextResponse.json({ error: 'Rating and review body are required' }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })

    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (service.providerId === user.id) return NextResponse.json({ error: 'Cannot review your own service' }, { status: 400 })

    const existing = await prisma.review.findUnique({
      where: { reviewerId_serviceId: { reviewerId: user.id, serviceId: id } }
    })
    if (existing) return NextResponse.json({ error: 'You have already reviewed this service' }, { status: 400 })

    const review = await prisma.review.create({
      data: { reviewerId: user.id, serviceId: id, rating: parseInt(rating), title, body: reviewBody },
      include: { reviewer: { select: { id: true, username: true, fullName: true, avatar: true } } }
    })

    // Recompute service rating from all approved reviews
    const allReviews = await prisma.review.findMany({
      where: { serviceId: id, isApproved: true },
      select: { rating: true }
    })
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0
    await prisma.service.update({
      where: { id },
      data: { rating: avgRating, reviewCount: allReviews.length }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
