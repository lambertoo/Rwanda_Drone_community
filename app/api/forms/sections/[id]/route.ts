import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const sectionId = params.id
    const body = await request.json()
    const { title, description, order, conditional, isActive } = body

    // Check if section exists and belongs to user's form
    const existingSection = await prisma.formSection.findFirst({
      where: { 
        id: sectionId,
        form: { userId: user.id }
      }
    })

    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found or access denied' }, { status: 404 })
    }

    const section = await prisma.formSection.update({
      where: { id: sectionId },
      data: {
        title: title || existingSection.title,
        description: description !== undefined ? description : existingSection.description,
        order: order !== undefined ? order : existingSection.order,
        conditional: conditional !== undefined ? conditional : existingSection.conditional,
        isActive: isActive !== undefined ? isActive : existingSection.isActive,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const sectionId = params.id

    // Check if section exists and belongs to user's form
    const existingSection = await prisma.formSection.findFirst({
      where: { 
        id: sectionId,
        form: { userId: user.id }
      }
    })

    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found or access denied' }, { status: 404 })
    }

    await prisma.formSection.delete({
      where: { id: sectionId }
    })

    return NextResponse.json({ message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}
