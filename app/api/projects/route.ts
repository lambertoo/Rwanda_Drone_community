import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch projects from database
    const projects = await prisma.project.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform projects to match expected format
    const transformedProjects = projects.map(project => {
      // Convert status to display format
      const getStatusDisplay = (status: string) => {
        switch (status) {
          case 'in_progress':
            return 'In Progress'
          case 'on_hold':
            return 'On Hold'
          case 'planning':
            return 'Planning'
          case 'completed':
            return 'Completed'
          case 'cancelled':
            return 'Cancelled'
          default:
            return status
        }
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status, // Keep original for filtering
        statusDisplay: getStatusDisplay(project.status), // Add display version
        location: project.location || 'Not specified',
        duration: project.duration || 'Not specified',
        startDate: project.startDate || 'Not specified',
        endDate: project.endDate || 'Not specified',
        lead: {
          name: project.author.fullName,
          role: 'Project Lead',
          organization: project.author.organization || 'Not specified',
          avatar: project.author.avatar || '/placeholder-user.jpg',
        },
        stats: {
          views: project.viewsCount,
          likes: project.likesCount,
          comments: 0, // Comments not implemented yet
        },
        technologies: project.technologies || [],
        featured: project.isFeatured,
      }
    })

    return NextResponse.json({
      projects: transformedProjects,
      total: transformedProjects.length
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
