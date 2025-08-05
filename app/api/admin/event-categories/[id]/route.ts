import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT - Update an event category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, slug, icon, color } = body

    // Validate required fields
    if (!name || !description || !slug) {
      return NextResponse.json(
        { error: 'Name, description, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists for other categories
    const existingCategory = await prisma.eventCategory.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.eventCategory.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        icon: icon || "🎯",
        color: color || "#3B82F6"
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating event category:', error)
    return NextResponse.json(
      { error: 'Failed to update event category' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an event category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category has events
    const categoryWithEvents = await prisma.eventCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            events: true
          }
        }
      }
    })

    if (!categoryWithEvents) {
      return NextResponse.json(
        { error: 'Event category not found' },
        { status: 404 }
      )
    }

    if (categoryWithEvents._count.events > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing events' },
        { status: 400 }
      )
    }

    await prisma.eventCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Event category deleted successfully' })
  } catch (error) {
    console.error('Error deleting event category:', error)
    return NextResponse.json(
      { error: 'Failed to delete event category' },
      { status: 500 }
    )
  }
} 