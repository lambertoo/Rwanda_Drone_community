import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-utils"
import { prisma } from "@/lib/prisma"
import { processFileUrl } from "@/lib/file-upload"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (category && category !== "all") {
      where.category = category.toUpperCase()
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
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
        },
        orderBy: {
          uploadedAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.resource.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookies (accessToken) or Authorization header fallback
    const token = request.cookies.get("accessToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "") || undefined
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, fileUrl, fileType, fileSize, category, isRegulation, fileUpload } = body

    // Validate required fields
    if (!title || !fileUrl || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check regulation resource permissions
    if (isRegulation) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { role: true }
      })

      if (!user || !["admin", "regulator"].includes(user.role)) {
        return NextResponse.json(
          { error: "Only admins and regulators can upload regulation resources" },
          { status: 403 }
        )
      }
    }

    // Process file information
    let finalFileType = fileType
    let finalFileSize = fileSize

    // If no file type specified, try to detect from URL
    if (!finalFileType) {
      const urlParts = fileUrl.split('.')
      const extension = urlParts[urlParts.length - 1]?.toLowerCase()
      if (extension) {
        const typeMap: { [key: string]: string } = {
          'pdf': 'PDF',
          'doc': 'Word',
          'docx': 'Word',
          'xls': 'Excel',
          'xlsx': 'Excel',
          'ppt': 'PowerPoint',
          'pptx': 'PowerPoint',
          'mp4': 'Video',
          'avi': 'Video',
          'mov': 'Video',
          'wmv': 'Video',
          'mp3': 'Audio',
          'wav': 'Audio',
          'jpg': 'Image',
          'jpeg': 'Image',
          'png': 'Image',
          'gif': 'Image',
          'txt': 'Text',
          'zip': 'Archive',
          'rar': 'Archive'
        }
        finalFileType = typeMap[extension] || 'Other'
      }
    }

    // If no file size specified and it's a URL, try to get it
    if (!finalFileSize && fileUrl.startsWith('http')) {
      try {
        const fileInfo = await processFileUrl(fileUrl)
        if (fileInfo.fileSize !== 'Unknown') {
          finalFileSize = fileInfo.fileSize
        }
        if (!finalFileType) {
          finalFileType = fileInfo.fileType
        }
      } catch (error) {
        console.warn("Could not determine file size from URL:", error)
        finalFileSize = "Unknown"
      }
    }

    // Create the resource
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        // fileUrl can be a fully qualified external URL or a local uploaded path like /uploads/resource/.../files/...
        fileUrl,
        fileType: finalFileType || "Other",
        fileSize: finalFileSize || "Unknown",
        fileUpload,
        category: category.toUpperCase(),
        isRegulation: isRegulation || false,
        userId: decoded.userId
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

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    )
  }
} 