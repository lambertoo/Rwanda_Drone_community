import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch single opportunity category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.opportunityCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            opportunities: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      )
    }

    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      opportunityCount: category._count.opportunities,
      createdAt: category.createdAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      category: formattedCategory
    })

  } catch (error) {
    console.error("Error fetching opportunity category:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT - Update opportunity category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, color, icon, isActive } = body

    // Validate required fields
    if (!name || !description || !color || !icon) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.opportunityCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      )
    }

    // Check if name conflicts with other categories
    const nameConflict = await prisma.opportunityCategory.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: id }
      }
    })

    if (nameConflict) {
      return NextResponse.json(
        { success: false, message: "Category name already exists" },
        { status: 400 }
      )
    }

    // Update category
    const updatedCategory = await prisma.opportunityCategory.update({
      where: { id },
      data: {
        name,
        description,
        color,
        icon,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive
      }
    })

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    })

  } catch (error) {
    console.error("Error updating opportunity category:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE - Delete opportunity category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category exists
    const existingCategory = await prisma.opportunityCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            opportunities: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      )
    }

    // Check if category has opportunities
    if (existingCategory._count.opportunities > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Cannot delete category with existing opportunities. Please reassign or delete the opportunities first." 
        },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.opportunityCategory.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting opportunity category:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete category" },
      { status: 500 }
    )
  }
} 