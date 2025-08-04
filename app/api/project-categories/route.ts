import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.projectCategory.findMany({
      orderBy: { name: 'asc' }
    })

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      color: category.color,
    }))

    return NextResponse.json({
      categories: transformedCategories
    })
  } catch (error) {
    console.error('Error fetching project categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
} 