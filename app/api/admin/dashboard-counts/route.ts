import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Fetch all counts in parallel
    const [
      pendingForum,
      pendingProject,
      pendingEvent,
      pendingResource,
      pendingOpportunity,
      pendingService,
      totalUsers,
      publishedForum,
      publishedProject,
      publishedEvent,
      publishedResource,
      publishedOpportunity,
      publishedService,
      forumCategories,
      projectCategories,
      eventCategories,
      resourceCategories,
      serviceCategories,
      opportunityCategories
    ] = await Promise.all([
      // Pending counts
      prisma.forumPost.count({ where: { isApproved: { not: true } } }),
      prisma.project.count({ where: { isApproved: { not: true } } }),
      prisma.event.count({ where: { isApproved: { not: true } } }),
      prisma.resource.count({ where: { isApproved: { not: true } } }),
      prisma.opportunity.count({ where: { isApproved: { not: true } } }),
      prisma.service.count({ where: { isApproved: { not: true } } }),
      
      // Total users
      prisma.user.count(),
      
      // Published counts
      prisma.forumPost.count({ where: { isApproved: true } }),
      prisma.project.count({ where: { isApproved: true } }),
      prisma.event.count({ where: { isApproved: true } }),
      prisma.resource.count({ where: { isApproved: true } }),
      prisma.opportunity.count({ where: { isApproved: true } }),
      prisma.service.count({ where: { isApproved: true } }),
      
      // Category counts
      prisma.forumCategory.count(),
      prisma.projectCategory.count(),
      prisma.eventCategory.count(),
      prisma.resourceCategory.count(),
      prisma.serviceCategory.count(),
      prisma.opportunityCategory.count()
    ])

    const pendingTotal = pendingForum + pendingProject + pendingEvent + pendingResource + pendingOpportunity + pendingService
    const publishedTotal = publishedForum + publishedProject + publishedEvent + publishedResource + publishedOpportunity + publishedService

    return NextResponse.json({
      success: true,
      counts: {
        pendingContent: pendingTotal,
        totalUsers,
        publishedContent: publishedTotal,
        forumCategories,
        projectCategories,
        eventCategories,
        resourceCategories,
        serviceCategories,
        opportunityCategories
      }
    })

  } catch (error) {
    console.error('Dashboard counts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}