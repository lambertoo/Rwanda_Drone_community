import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"
import { canCreateProjects } from "@/lib/auth"

export async function GET() {
  try {
    // Fetch projects from database
    const projects = await prisma.project.findMany({
      include: {
        author: true,
        category: true,
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

      // Parse technologies from JSON string
      let technologies = []
      if (project.technologies) {
        try {
          if (typeof project.technologies === 'string') {
            // Handle both JSON strings and regular strings
            if (project.technologies.startsWith('[') && project.technologies.endsWith(']')) {
              technologies = JSON.parse(project.technologies)
            } else {
              // If it's not a JSON array, treat it as a single technology
              technologies = [project.technologies]
            }
          } else if (Array.isArray(project.technologies)) {
            technologies = project.technologies
          } else {
            technologies = []
          }
        } catch (error) {
          console.error('Error parsing technologies for project:', project.id, error)
          technologies = []
        }
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category?.name || 'Uncategorized',
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
        technologies: technologies,
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

export async function POST(request: Request) {
  try {
    // Step 1: Authentication Validation
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to create a project. Please sign in and try again." },
        { status: 401 }
      )
    }

    // Check if user can create projects
    if (!canCreateProjects(user)) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to create projects" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Step 2: Input Validation
    const title = body.title?.trim()
    const description = body.description?.trim()
    const fullDescription = body.fullDescription?.trim()
    const categoryId = body.category
    const status = body.status
    const location = body.location?.trim()
    const duration = body.duration?.trim()
    const startDate = body.startDate?.trim()
    const endDate = body.endDate?.trim()
    const funding = body.funding?.trim()
    const technologies = body.technologies
    const objectives = body.objectives
    const challenges = body.challenges
    const outcomes = body.outcomes
    const teamMembers = body.teamMembers
    const gallery = body.gallery

    // Validate title
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Project title is required. Please enter a descriptive title for your project." },
        { status: 400 }
      )
    }

    if (title.length < 5) {
      return NextResponse.json(
        { success: false, error: "Project title must be at least 5 characters long. Please make it more descriptive." },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { success: false, error: "Project title is too long. Please keep it under 200 characters." },
        { status: 400 }
      )
    }

    // Validate description
    if (!description) {
      return NextResponse.json(
        { success: false, error: "Project description is required. Please write a description of your project." },
        { status: 400 }
      )
    }

    if (description.length < 20) {
      return NextResponse.json(
        { success: false, error: "Project description must be at least 20 characters long. Please provide more details." },
        { status: 400 }
      )
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Project description is too long. Please keep it under 1,000 characters." },
        { status: 400 }
      )
    }

    // Validate category
    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Please select a category for your project." },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.projectCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Selected category does not exist. Please choose a valid category." },
        { status: 400 }
      )
    }

    // Step 3: Parse JSON fields
    let parsedTechnologies = []
    let parsedObjectives = []
    let parsedChallenges = []
    let parsedOutcomes = []
    let parsedTeamMembers = []
    let parsedGallery = []

    if (technologies) {
      try {
        const parsed = typeof technologies === 'string' ? JSON.parse(technologies) : technologies
        if (Array.isArray(parsed)) {
          parsedTechnologies = parsed
        }
      } catch (error) {
        parsedTechnologies = []
      }
    }

    if (objectives) {
      try {
        const parsed = typeof objectives === 'string' ? JSON.parse(objectives) : objectives
        if (Array.isArray(parsed)) {
          parsedObjectives = parsed
        }
      } catch (error) {
        parsedObjectives = []
      }
    }

    if (challenges) {
      try {
        const parsed = typeof challenges === 'string' ? JSON.parse(challenges) : challenges
        if (Array.isArray(parsed)) {
          parsedChallenges = parsed
        }
      } catch (error) {
        parsedChallenges = []
      }
    }

    if (outcomes) {
      try {
        const parsed = typeof outcomes === 'string' ? JSON.parse(outcomes) : outcomes
        if (Array.isArray(parsed)) {
          parsedOutcomes = parsed
        }
      } catch (error) {
        parsedOutcomes = []
      }
    }

    if (teamMembers) {
      try {
        const parsed = typeof teamMembers === 'string' ? JSON.parse(teamMembers) : teamMembers
        if (Array.isArray(parsed)) {
          parsedTeamMembers = parsed
        }
      } catch (error) {
        parsedTeamMembers = []
      }
    }

    if (gallery) {
      try {
        const parsed = typeof gallery === 'string' ? JSON.parse(gallery) : gallery
        if (Array.isArray(parsed)) {
          parsedGallery = parsed
        }
      } catch (error) {
        parsedGallery = []
      }
    }

    // Step 4: Map status values to enum
    const mappedStatus = status === "in-progress" ? "in_progress" : 
                        status === "on-hold" ? "on_hold" : 
                        status as any

    // Step 5: Create Project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        fullDescription: fullDescription || null,
        categoryId,
        status: mappedStatus,
        authorId: user.id,
        location: location || null,
        duration: duration || null,
        startDate: startDate || null,
        endDate: endDate || null,
        funding: funding || null,
        technologies: parsedTechnologies,
        objectives: parsedObjectives,
        challenges: parsedChallenges,
        outcomes: parsedOutcomes,
        teamMembers: parsedTeamMembers,
        gallery: parsedGallery,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            isVerified: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    })

    // Step 6: Update user's project count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        projectsCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      project,
      message: "Project created successfully!",
      redirectUrl: `/projects/${project.id}`
    })

  } catch (error) {
    console.error("Error creating project:", error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { success: false, error: "A project with this title already exists. Please choose a different title." },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: "Invalid category selected. Please choose a valid category." },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while creating your project. Please try again. If the problem persists, contact support." },
      { status: 500 }
    )
  }
}
