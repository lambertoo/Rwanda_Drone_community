import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const employmentTypes = await prisma.employmentType.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            opportunities: true
          }
        }
      }
    })

    return NextResponse.json(employmentTypes)
  } catch (error) {
    console.error("Error fetching employment types:", error)
    return NextResponse.json(
      { error: "Failed to fetch employment types" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, icon, color, order } = body

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: "Name, description, and category are required" },
        { status: 400 }
      )
    }

    const employmentType = await prisma.employmentType.create({
      data: {
        name,
        description,
        category,
        icon: icon || "💼",
        color: color || "#3B82F6",
        order: order || 0
      }
    })

    return NextResponse.json(employmentType, { status: 201 })
  } catch (error) {
    console.error("Error creating employment type:", error)
    return NextResponse.json(
      { error: "Failed to create employment type" },
      { status: 500 }
    )
  }
}
