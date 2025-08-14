import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET - Fetch all opportunity categories
export async function GET() {
  try {
    const categories = await prisma.opportunityCategory.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        _count: {
          select: {
            opportunities: true
          }
        }
      }
    })

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      opportunityCount: category._count.opportunities,
      createdAt: category.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    })
  } catch (error) {
    console.error("Error fetching opportunity categories:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST - Create new opportunity category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon } = body

    // Validate required fields
    if (!name || !description || !color || !icon) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if category name already exists
    const existingCategory = await prisma.opportunityCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } }
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category name already exists" },
        { status: 400 }
      )
    }

    // Create new category
    const newCategory = await prisma.opportunityCategory.create({
      data: {
        name,
        description,
        color,
        icon,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: newCategory
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating opportunity category:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    )
  }
} 