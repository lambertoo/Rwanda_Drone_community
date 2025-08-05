import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, slug, color } = body

    // Validate required fields
    if (!name || !description || !slug) {
      return NextResponse.json(
        { error: 'Name, description, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists (excluding current category)
    const existingCategory = await prisma.forumCategory.findFirst({
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

    const category = await prisma.forumCategory.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        color: color || "#3B82F6"
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating forum category:', error)
    return NextResponse.json(
      { error: 'Failed to update forum category' },
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

    // Check if category has posts
    const categoryWithPosts = await prisma.forumCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })

    if (!categoryWithPosts) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (categoryWithPosts._count.posts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing posts' },
        { status: 400 }
      )
    }

    await prisma.forumCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting forum category:', error)
    return NextResponse.json(
      { error: 'Failed to delete forum category' },
      { status: 500 }
    )
  }
} 