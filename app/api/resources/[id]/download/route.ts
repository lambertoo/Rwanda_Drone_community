import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Increment download count
    await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    })

    return NextResponse.json({ message: "Download tracked successfully" })
  } catch (error) {
    console.error("Error tracking download:", error)
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    )
  }
} 