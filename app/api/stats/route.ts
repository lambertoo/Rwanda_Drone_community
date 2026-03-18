import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5-minute cache

export async function GET() {
  try {
    const [
      totalUsers,
      totalProjects,
      totalEvents,
      totalForumPosts,
      totalServices,
      totalOpportunities,
      totalResources,
      totalCourses,
      totalEnrollments,
      totalFlightLogs,
      totalDrones,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.event.count(),
      prisma.forumPost.count(),
      prisma.service.count({ where: { status: 'approved' } }),
      prisma.opportunity.count({ where: { status: 'published' } }),
      prisma.resource.count({ where: { status: 'approved' } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.flightLog.count(),
      prisma.drone.count(),
    ])

    // Role breakdown
    const roleBreakdown = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      orderBy: { _count: { role: 'desc' } },
    })

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const recentProjects = await prisma.project.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const recentPosts = await prisma.forumPost.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })

    // Top forum categories by post count
    const topCategories = await prisma.forumCategory.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: 'desc' } },
      take: 5,
    })

    return NextResponse.json({
      totals: {
        users: totalUsers,
        projects: totalProjects,
        events: totalEvents,
        forumPosts: totalForumPosts,
        services: totalServices,
        opportunities: totalOpportunities,
        resources: totalResources,
        courses: totalCourses,
        enrollments: totalEnrollments,
        flightLogs: totalFlightLogs,
        drones: totalDrones,
      },
      roles: roleBreakdown.map(r => ({ role: r.role || 'unknown', count: r._count.role })),
      last30Days: {
        users: recentUsers,
        projects: recentProjects,
        forumPosts: recentPosts,
      },
      topForumCategories: topCategories.map(c => ({
        name: c.name,
        slug: c.slug,
        postCount: c._count.posts,
      })),
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
