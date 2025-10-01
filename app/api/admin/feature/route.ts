import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { type, id, featured } = await request.json();

    if (!type || !id || typeof featured !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'project':
        result = await prisma.project.update({
          where: { id },
          data: { isFeatured: featured },
        });
        break;

      case 'event':
        result = await prisma.event.update({
          where: { id },
          data: { isFeatured: featured },
        });
        break;

      case 'service':
        result = await prisma.service.update({
          where: { id },
          data: { isFeatured: featured },
        });
        break;

      case 'opportunity':
        result = await prisma.opportunity.update({
          where: { id },
          data: { isFeatured: featured },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const action = featured ? 'featured' : 'unfeatured';
    
    return NextResponse.json({ 
      success: true, 
      message: `${type} ${action} successfully`,
      data: result 
    });

  } catch (error) {
    console.error('Feature toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

