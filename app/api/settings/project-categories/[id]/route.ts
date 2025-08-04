import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description, color } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    // Generate new slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists (excluding current category)
    const existingCategory = await prisma.projectCategory.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.projectCategory.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        color: color || '#10b981'
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating project category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category has projects
    const categoryWithProjects = await prisma.projectCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!categoryWithProjects) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (categoryWithProjects._count.projects > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing projects' },
        { status: 400 }
      )
    }

    await prisma.projectCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting project category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 