import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.projectCategory.findMany({
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching project categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, slug, icon, color } = body

    // Validate required fields
    if (!name || !description || !slug) {
      return NextResponse.json(
        { error: 'Name, description, and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCategory = await prisma.projectCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.projectCategory.create({
      data: {
        name,
        description,
        slug,
        icon: icon || "🚁",
        color: color || "#3B82F6"
      },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error creating project category:', error)
    return NextResponse.json(
      { error: 'Failed to create project category' },
      { status: 500 }
    )
  }
} 