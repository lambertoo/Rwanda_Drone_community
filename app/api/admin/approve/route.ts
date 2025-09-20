import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;

    const { type, id, action } = await request.json();

    if (!type || !id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;
    const now = new Date();

    switch (type) {
      case 'forum':
        result = await prisma.forumPost.update({
          where: { id },
          data: {
            isApproved: action === 'approve',
            approvedAt: action === 'approve' ? now : null,
            approvedBy: action === 'approve' ? user.id : null,
          },
        });
        break;

      case 'project':
        result = await prisma.project.update({
          where: { id },
          data: {
            isApproved: action === 'approve',
            approvedAt: action === 'approve' ? now : null,
            approvedBy: action === 'approve' ? user.id : null,
          },
        });
        break;

      case 'event':
        result = await prisma.event.update({
          where: { id },
          data: {
            isApproved: action === 'approve',
            approvedAt: action === 'approve' ? now : null,
            approvedBy: action === 'approve' ? user.id : null,
          },
        });
        break;

      case 'resource':
        result = await prisma.resource.update({
          where: { id },
          data: {
            isApproved: action === 'approve',
            approvedAt: action === 'approve' ? now : null,
            approvedBy: action === 'approve' ? user.id : null,
          },
        });
        break;

      case 'opportunity':
        result = await prisma.opportunity.update({
          where: { id },
          data: {
            isApproved: action === 'approve',
            approvedAt: action === 'approve' ? now : null,
            approvedBy: action === 'approve' ? user.id : null,
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: result 
    });

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
