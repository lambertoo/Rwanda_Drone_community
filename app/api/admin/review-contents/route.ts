import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Fetch all approved content that can be unpublished
    const [forumPosts, projects, events, resources, opportunities, services] = await Promise.all([
      prisma.forumPost.findMany({
        where: { isApproved: true },
        include: {
          author: {
            select: {
              fullName: true,
              username: true
            }
          },
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.project.findMany({
        where: { isApproved: true },
        include: {
          author: {
            select: {
              fullName: true,
              username: true
            }
          },
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.event.findMany({
        where: { isApproved: true },
        include: {
          organizer: {
            select: {
              fullName: true,
              username: true
            }
          },
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.resource.findMany({
        where: { isApproved: true },
        include: {
          uploadedBy: {
            select: {
              fullName: true,
              username: true
            }
          }
        },
        orderBy: { uploadedAt: 'desc' },
        take: 50
      }),
      prisma.opportunity.findMany({
        where: { isApproved: true },
        include: {
          poster: {
            select: {
              fullName: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.service.findMany({
        where: { isApproved: true },
        include: {
          provider: {
            select: {
              fullName: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ])

    // Return data in the same format as the approvals API
    return NextResponse.json({
      success: true,
      data: {
        forumPosts: forumPosts.map(post => ({
          ...post,
          author: {
            fullName: post.author.fullName,
            username: post.author.username
          }
        })),
        projects: projects.map(project => ({
          ...project,
          author: {
            fullName: project.author.fullName,
            username: project.author.username
          }
        })),
        events: events.map(event => ({
          ...event,
          author: {
            fullName: event.organizer.fullName,
            username: event.organizer.username
          }
        })),
        resources: resources.map(resource => ({
          ...resource,
          author: {
            fullName: resource.uploadedBy.fullName,
            username: resource.uploadedBy.username
          }
        })),
        opportunities: opportunities.map(opportunity => ({
          ...opportunity,
          author: {
            fullName: opportunity.poster.fullName,
            username: opportunity.poster.username
          }
        })),
        services: services.map(service => ({
          ...service,
          author: {
            fullName: service.provider.fullName,
            username: service.provider.username
          }
        }))
      },
      counts: {
        forum: forumPosts.length,
        project: projects.length,
        event: events.length,
        resource: resources.length,
        opportunity: opportunities.length,
        service: services.length
      }
    })

  } catch (error) {
    console.error('Review contents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
