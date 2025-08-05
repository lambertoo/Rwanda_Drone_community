import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch all event categories
export async function GET() {
  try {
    const categories = await prisma.eventCategory.findMany({
      include: {
        _count: {
          select: {
            events: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching event categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event categories' },
      { status: 500 }
    )
  }
}

// POST - Create a new event category
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
    const existingCategory = await prisma.eventCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.eventCategory.create({
      data: {
        name,
        description,
        slug,
        icon: icon || "🎯",
        color: color || "#3B82F6"
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating event category:', error)
    return NextResponse.json(
      { error: 'Failed to create event category' },
      { status: 500 }
    )
  }
} 