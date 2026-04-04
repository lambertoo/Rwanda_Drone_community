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

    const [forms, posts, projects, events, courses, enrollments, mentorProfile, resources] = await Promise.all([
      prisma.universalForm.findMany({
        where: { userId },
        select: {
          id: true, title: true, slug: true, isActive: true, isPublic: true,
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
        where: { authorId: userId },
        select: {
          id: true, title: true, description: true, status: true,
          thumbnail: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.findMany({
        where: { organizerId: userId },
        select: {
          id: true, title: true, description: true, startDate: true, endDate: true,
          location: true, isPublic: true, createdAt: true,
          _count: { select: { rsvps: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      // Courses created by user
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
      // Courses user is enrolled in
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
      // Mentorship profile
      prisma.mentorProfile.findUnique({
        where: { userId },
        select: {
          id: true, specialties: true, bio: true, isAccepting: true, maxMentees: true,
          _count: { select: { receivedRequests: true } },
        },
      }),
      // Resources uploaded by user
      prisma.resource.findMany({
        where: { userId },
        select: {
          id: true, title: true, fileUrl: true, fileType: true, fileSize: true,
          isRegulation: true, isApproved: true, downloads: true, views: true,
          uploadedAt: true, updatedAt: true,
          category: { select: { name: true } },
        },
        orderBy: { uploadedAt: 'desc' },
      }),
    ])

    return NextResponse.json({ forms, posts, projects, events, courses, enrollments, mentorProfile, resources })
  } catch (error: any) {
    console.error('Error fetching my content:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch content' }, { status: 500 })
  }
}
