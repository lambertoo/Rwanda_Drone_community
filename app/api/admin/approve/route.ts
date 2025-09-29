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

    console.log('=== ADMIN APPROVE DEBUG ===');
    console.log('Type received:', type);
    console.log('ID received:', id);
    console.log('Action received:', action);

    if (!type || !id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject', 'unapprove'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;
    const now = new Date();

    // Determine the approval status and metadata based on action
    const isApproved = action === 'approve';
    const approvedAt = action === 'approve' ? now : null;
    const approvedBy = action === 'approve' ? user.userId : null;

    switch (type) {
      case 'forum':
        result = await prisma.forumPost.update({
          where: { id },
          data: {
            isApproved,
            approvedAt,
            approvedBy,
          },
        });
        break;

      case 'project':
        result = await prisma.project.update({
          where: { id },
          data: {
            isApproved,
            approvedAt,
            approvedBy,
          },
        });
        break;

      case 'event':
        result = await prisma.event.update({
          where: { id },
          data: {
            isApproved,
            approvedAt,
            approvedBy,
          },
        });
        break;

      case 'resource':
        result = await prisma.resource.update({
          where: { id },
          data: {
            isApproved,
            approvedAt,
            approvedBy,
          },
        });
        break;

      case 'opportunity':
        result = await prisma.opportunity.update({
          where: { id },
          data: {
            isApproved,
            approvedAt,
            approvedBy,
          },
        });
        break;

      case 'service':
        result = await prisma.service.update({
          where: { id },
          data: {
            isApproved,
            approvedAt,
            approvedBy,
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const actionMessage = action === 'approve' ? 'approved' : action === 'unapprove' ? 'unapproved' : 'rejected';
    
    return NextResponse.json({ 
      success: true, 
      message: `${type} ${actionMessage} successfully`,
      data: result 
    });

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}






