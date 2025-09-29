import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params
    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
    }

    const category = await prisma.resourceCategory.update({
      where: { id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Resource category updated successfully',
      category 
    })

  } catch (error) {
    console.error('Update resource category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = params

    // Check if category has resources
    const categoryWithResources = await prisma.resourceCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            resources: true
          }
        }
      }
    })

    if (!categoryWithResources) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (categoryWithResources._count.resources > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with existing resources' 
      }, { status: 400 })
    }

    await prisma.resourceCategory.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Resource category deleted successfully' 
    })

  } catch (error) {
    console.error('Delete resource category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
