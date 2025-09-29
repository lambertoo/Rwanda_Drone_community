import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Fetch counts individually to avoid Promise.all issues
    const pendingForumPosts = await prisma.forumPost.count({ where: { isApproved: false } })
    const pendingProjects = await prisma.project.count({ where: { isApproved: false } })
    const pendingEvents = await prisma.event.count({ where: { isApproved: false } })
    const pendingResources = await prisma.resource.count({ where: { isApproved: false } })
    const pendingOpportunities = await prisma.opportunity.count({ where: { isApproved: false } })
    const pendingServices = await prisma.service.count({ where: { isApproved: false } })
    
    const publishedForumPosts = await prisma.forumPost.count({ where: { isApproved: true } })
    const publishedProjects = await prisma.project.count({ where: { isApproved: true } })
    const publishedEvents = await prisma.event.count({ where: { isApproved: true } })
    const publishedResources = await prisma.resource.count({ where: { isApproved: true } })
    const publishedOpportunities = await prisma.opportunity.count({ where: { isApproved: true } })
    const publishedServices = await prisma.service.count({ where: { isApproved: true } })
    
    const totalUsers = await prisma.user.count()
    
    const forumCategories = await prisma.forumCategory.count()
    const projectCategories = await prisma.projectCategory.count()
    const eventCategories = await prisma.eventCategory.count()
    const opportunityCategories = await prisma.opportunityCategory.count()
    
    // Get category counts using raw SQL for problematic models
    const resourceCategoriesResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM resource_categories
    ` as [{ count: bigint }]
    const resourceCategories = Number(resourceCategoriesResult[0].count)
    
    const serviceCategoriesResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM service_categories
    ` as [{ count: bigint }]
    const serviceCategories = Number(serviceCategoriesResult[0].count)

    const pendingTotal = pendingForumPosts + pendingProjects + pendingEvents + pendingResources + pendingOpportunities + pendingServices
    const publishedTotal = publishedForumPosts + publishedProjects + publishedEvents + publishedResources + publishedOpportunities + publishedServices

    return NextResponse.json({
      success: true,
      counts: {
        // Pending content
        pendingContent: pendingTotal,
        pendingForum: pendingForumPosts,
        pendingProjects: pendingProjects,
        pendingEvents: pendingEvents,
        pendingResources: pendingResources,
        pendingOpportunities: pendingOpportunities,
        pendingServices: pendingServices,
        
        // Published content
        publishedContent: publishedTotal,
        publishedForum: publishedForumPosts,
        publishedProjects: publishedProjects,
        publishedEvents: publishedEvents,
        publishedResources: publishedResources,
        publishedOpportunities: publishedOpportunities,
        publishedServices: publishedServices,
        
        // Users
        totalUsers: totalUsers,
        
        // Categories
        forumCategories: forumCategories,
        projectCategories: projectCategories,
        eventCategories: eventCategories,
        resourceCategories: resourceCategories,
        serviceCategories: serviceCategories,
        opportunityCategories: opportunityCategories
      }
    })

  } catch (error) {
    console.error('Dashboard counts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
