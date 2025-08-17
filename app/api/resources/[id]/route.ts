import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-utils"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            role: true
          }
        }
      }
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Increment view count
    await prisma.resource.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check if user owns the resource or is admin/regulator
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { userId: true, isRegulation: true }
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    const canEdit = 
      resource.userId === decoded.userId || 
      user?.role === "admin" || 
      (user?.role === "regulator" && resource.isRegulation)

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        fileSize: body.fileSize,
        category: body.category?.toUpperCase(),
        isRegulation: body.isRegulation
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(updatedResource)
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = params

    // Check if user owns the resource or is admin
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    const canDelete = resource.userId === decoded.userId || user?.role === "admin"

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.resource.delete({ where: { id } })

    return NextResponse.json({ message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    )
  }
} 