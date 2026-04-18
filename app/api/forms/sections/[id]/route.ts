import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verify authentication
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const sectionId = id
    const rawBody = await request.json()
    // Sanitise via the shared helper by wrapping in a pseudo-form shape
    const { sanitizeFormStructure } = await import('@/lib/form-sanitize')
    const sanitised = sanitizeFormStructure({ sections: [{ ...rawBody, fields: [] }] }).sections[0]
    const { title, description, order, actions, isActive } = { ...rawBody, ...sanitised }

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
        actions: actions !== undefined ? actions : (existingSection as any).actions,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verify authentication
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const sectionId = id

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
