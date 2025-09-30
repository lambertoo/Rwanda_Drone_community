import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const pendingItems: any = {};

    if (type === 'all' || type === 'forum') {
      pendingItems.forumPosts = await prisma.forumPost.findMany({
        where: { 
          isApproved: { not: true }
        },
        include: {
          author: {
            select: { id: true, username: true, fullName: true, avatar: true }
          },
          category: {
            select: { name: true, color: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    if (type === 'all' || type === 'project') {
      pendingItems.projects = await prisma.project.findMany({
        where: { 
          isApproved: { not: true }
        },
        include: {
          author: {
            select: { id: true, username: true, fullName: true, avatar: true }
          },
          category: {
            select: { name: true, color: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    if (type === 'all' || type === 'event') {
      pendingItems.events = await prisma.event.findMany({
        where: { 
          isApproved: { not: true }
        },
        include: {
          organizer: {
            select: { id: true, username: true, fullName: true, avatar: true }
          },
          category: {
            select: { name: true, color: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    if (type === 'all' || type === 'resource') {
      pendingItems.resources = await prisma.resource.findMany({
        where: { 
          isApproved: { not: true }
        },
        include: {
          uploadedBy: {
            select: { id: true, username: true, fullName: true, avatar: true }
          }
        },
        orderBy: { uploadedAt: 'desc' },
        take: 10
      });
    }

    if (type === 'all' || type === 'opportunity') {
      pendingItems.opportunities = await prisma.opportunity.findMany({
        where: { 
          isApproved: { not: true }
        },
        include: {
          poster: {
            select: { id: true, username: true, fullName: true, avatar: true }
          },
          category: {
            select: { name: true, color: true }
          },
          employmentType: {
            select: { name: true, category: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    if (type === 'all' || type === 'service') {
      pendingItems.services = await prisma.service.findMany({
        where: { 
          isApproved: { not: true }
        },
        include: {
          provider: {
            select: { id: true, username: true, fullName: true, avatar: true }
          },
          category: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    }

    // Count total pending items
    const counts = {
      forum: await prisma.forumPost.count({ 
        where: { 
          isApproved: { not: true }
        }
      }),
      project: await prisma.project.count({ 
        where: { 
          isApproved: { not: true }
        }
      }),
      event: await prisma.event.count({ 
        where: { 
          isApproved: { not: true }
        }
      }),
      resource: await prisma.resource.count({ 
        where: { 
          isApproved: { not: true }
        }
      }),
      opportunity: await prisma.opportunity.count({ 
        where: { 
          isApproved: { not: true }
        }
      }),
      service: await prisma.service.count({ 
        where: { 
          isApproved: { not: true }
        }
      }),
    };

    return NextResponse.json({ 
      success: true, 
      data: pendingItems,
      counts
    });

  } catch (error) {
    console.error('Pending items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}






