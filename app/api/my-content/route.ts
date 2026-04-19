import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const userId = payload.userId

    // Accepted collaborations grouped by content type so each list can add
    // "I'm a collaborator on these" entries on top of what I own.
    const accepted = await prisma.contentCollaborator.findMany({
      where: { collaboratorUserId: userId, status: 'ACCEPTED' },
      select: { contentType: true, contentId: true },
    })
    const collabIds: Record<string, string[]> = {}
    for (const row of accepted) {
      const key = row.contentType as string
      if (!collabIds[key]) collabIds[key] = []
      collabIds[key].push(row.contentId)
    }
    const orWith = (ownField: string, ownValue: string, type: string) => {
      const ids = collabIds[type] || []
      const branches: any[] = [{ [ownField]: ownValue }]
      if (ids.length > 0) branches.push({ id: { in: ids } })
      return { OR: branches }
    }

    const [forms, posts, projects, events, courses, enrollments, mentorProfile, resources, opportunities, services, newsArticles, marketplaceListings, clubs] = await Promise.all([
      prisma.universalForm.findMany({
        where: orWith('userId', userId, 'FORM'),
        select: {
          id: true, userId: true, title: true, slug: true, isActive: true, isPublic: true,
          createdAt: true, updatedAt: true,
          _count: { select: { entries: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.forumPost.findMany({
        where: { authorId: userId },
        select: {
          id: true, title: true, content: true, isApproved: true,
          createdAt: true, updatedAt: true, viewsCount: true, repliesCount: true, likesCount: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.findMany({
        where: orWith('authorId', userId, 'PROJECT'),
        select: {
          id: true, authorId: true, title: true, description: true, status: true,
          thumbnail: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.findMany({
        where: orWith('organizerId', userId, 'EVENT'),
        select: {
          id: true, organizerId: true, title: true, description: true, startDate: true, endDate: true,
          location: true, isPublic: true, createdAt: true,
          _count: { select: { rsvps: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      prisma.course.findMany({
        where: { instructorId: userId },
        select: {
          id: true, title: true, slug: true, category: true, level: true,
          isPublished: true, enrollmentCount: true, price: true,
          createdAt: true, updatedAt: true,
          _count: { select: { lessons: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.enrollment.findMany({
        where: { userId },
        select: {
          id: true, createdAt: true, completedAt: true,
          course: {
            select: {
              id: true, title: true, slug: true, category: true, level: true,
              thumbnail: true, instructorId: true,
              instructor: { select: { fullName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mentorProfile.findUnique({
        where: { userId },
        select: {
          id: true, specialties: true, bio: true, isAccepting: true, maxMentees: true,
          _count: { select: { receivedRequests: true } },
        },
      }),
      prisma.resource.findMany({
        where: orWith('userId', userId, 'RESOURCE'),
        select: {
          id: true, userId: true, title: true, fileUrl: true, fileType: true, fileSize: true,
          isRegulation: true, isApproved: true, downloads: true, views: true,
          uploadedAt: true, updatedAt: true,
          category: { select: { name: true } },
        },
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.opportunity.findMany({
        where: orWith('posterId', userId, 'OPPORTUNITY'),
        select: {
          id: true, posterId: true, title: true, description: true, company: true,
          isApproved: true, createdAt: true, updatedAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.findMany({
        where: orWith('providerId', userId, 'SERVICE'),
        select: {
          id: true, providerId: true, title: true, description: true,
          createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsArticle.findMany({
        where: orWith('authorId', userId, 'NEWS'),
        select: {
          id: true, authorId: true, title: true, slug: true, summary: true,
          isPublished: true, isFeatured: true, thumbnail: true, publishedAt: true,
          createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.marketplaceListing.findMany({
        where: orWith('sellerId', userId, 'MARKETPLACE'),
        select: {
          id: true, sellerId: true, title: true, description: true, price: true, currency: true,
          status: true, images: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.club.findMany({
        where: orWith('createdById', userId, 'CLUB'),
        select: {
          id: true, createdById: true, name: true, description: true, type: true,
          isApproved: true, isActive: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Tag each collaborator-sourced row with _role so the UI can label them.
    const tagRole = <T extends { id: string }>(rows: T[], ownField: keyof T) =>
      rows.map(r => ({ ...r, _role: (r as any)[ownField] === userId ? 'owner' : 'collaborator' }))

    return NextResponse.json({
      forms: tagRole(forms, 'userId'),
      posts,
      projects: tagRole(projects, 'authorId'),
      events: tagRole(events, 'organizerId'),
      courses,
      enrollments,
      mentorProfile,
      resources: tagRole(resources, 'userId'),
      opportunities: tagRole(opportunities, 'posterId'),
      services: tagRole(services, 'providerId'),
      newsArticles: tagRole(newsArticles, 'authorId'),
      marketplaceListings: tagRole(marketplaceListings, 'sellerId'),
      clubs: tagRole(clubs, 'createdById'),
    })
  } catch (error: any) {
    console.error('Error fetching my content:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch content' }, { status: 500 })
  }
}
