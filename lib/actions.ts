"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"
import { canCreateProjects, canCreateServices, canPostOpportunities, canCreateEvents, canEditOwnContent, canDeleteAnyContent, getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { organizeMultipleFiles, UploadedFile } from "@/lib/file-utils"
import { rename, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// File utility functions
async function moveFilesFromTemp(projectId: string, resources: any[], gallery: any[]) {
  try {
    const baseDir = process.cwd()
    
    // Move resources
    for (const resource of resources) {
      if (resource.url && resource.url.includes('/uploads/projects/temp/')) {
        const oldPath = path.join(baseDir, 'public', resource.url)
        const newPath = path.join(baseDir, 'public', 'uploads', 'projects', projectId, 'resources', path.basename(resource.url))
        
        // Create directory if it doesn't exist
        const newDir = path.dirname(newPath)
        if (!existsSync(newDir)) {
          await mkdir(newDir, { recursive: true })
        }
        
        // Move file
        if (existsSync(oldPath)) {
          await rename(oldPath, newPath)
          // Update URL in resource object
          resource.url = `/uploads/projects/${projectId}/resources/${path.basename(resource.url)}`
        }
      }
    }
    
    // Move gallery images
    for (const image of gallery) {
      if (image.url && image.url.includes('/uploads/projects/temp/')) {
        const oldPath = path.join(baseDir, 'public', image.url)
        const newPath = path.join(baseDir, 'public', 'uploads', 'projects', projectId, 'images', path.basename(image.url))
        
        // Create directory if it doesn't exist
        const newDir = path.dirname(newPath)
        if (!existsSync(newDir)) {
          await mkdir(newDir, { recursive: true })
        }
        
        // Move file
        if (existsSync(oldPath)) {
          await rename(oldPath, newPath)
          // Update URL in image object
          image.url = `/uploads/projects/${projectId}/images/${path.basename(image.url)}`
        }
      }
    }
    
    return { resources, gallery }
  } catch (error) {
    console.error('Error moving files:', error)
    // Return original arrays if moving fails
    return { resources, gallery }
  }
}

// Forum Post Actions
export async function createForumPostAction(formData: FormData) {
  try {
    // Step 1: Authentication Validation
    const user = await getAuthenticatedUser()

    if (!user) {
      return { 
        success: false, 
        error: "You must be logged in to create a forum post. Please sign in and try again." 
      }
    }

    // Step 1.5: Verification Check
    if (!user.isVerified) {
      return { 
        success: false, 
        error: "Your account must be verified to create forum posts. Please contact an administrator to verify your account." 
      }
    }

    // Step 1.6: Active Account Check
    if (!user.isActive) {
      return { 
        success: false, 
        error: "Your account is blocked. You cannot create forum posts. Please contact an administrator." 
      }
    }

    // Step 2: Input Validation
    const title = (formData.get("title") as string)?.trim()
    const content = (formData.get("content") as string)?.trim()
    const categoryId = formData.get("categoryId") as string
    const tags = formData.get("tags") as string

    // Validate title
    if (!title) {
      return { 
        success: false, 
        error: "Post title is required. Please enter a descriptive title for your post." 
      }
    }

    if (title.length < 10) {
      return { 
        success: false, 
        error: "Post title must be at least 10 characters long. Please make it more descriptive." 
      }
    }

    if (title.length > 200) {
      return { 
        success: false, 
        error: "Post title is too long. Please keep it under 200 characters." 
      }
    }

    // Validate content
    if (!content) {
      return { 
        success: false, 
        error: "Post content is required. Please write the content of your post." 
      }
    }

    if (content.length < 20) {
      return { 
        success: false, 
        error: "Post content must be at least 20 characters long. Please provide more details." 
      }
    }

    if (content.length > 10000) {
      return { 
        success: false, 
        error: "Post content is too long. Please keep it under 10,000 characters." 
      }
    }

    // Validate category
    if (!categoryId) {
      return { 
        success: false, 
        error: "Please select a category for your post." 
      }
    }

    // Verify category exists
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return { 
        success: false, 
        error: "Selected category does not exist. Please choose a valid category." 
      }
    }

    // Step 3: Tags Processing
    let parsedTags = []
    if (tags) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(tags)
        if (Array.isArray(parsed)) {
          parsedTags = parsed
        } else {
          // If it's not an array, treat as comma-separated string
          parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        }
      } catch (error) {
        // If JSON parsing fails, treat as comma-separated string
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      }
    }

    // Validate tags
    if (parsedTags.length > 5) {
      return { 
        success: false, 
        error: "You can only add up to 5 tags. Please remove some tags and try again." 
      }
    }

    // Validate individual tag length
    for (const tag of parsedTags) {
      if (tag.length > 20) {
        return { 
          success: false, 
          error: `Tag "${tag}" is too long. Tags must be 20 characters or less.` 
        }
      }
    }

    // Step 4: Create Post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        categoryId,
        authorId: user.id,
        tags: parsedTags,
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
            slug: true,
          }
        },
      },
    })

    // Step 5: Update Category Statistics
    await prisma.forumCategory.update({
      where: { id: categoryId },
      data: {
        postCount: {
          increment: 1,
        },
        lastPostAt: new Date(),
      },
    })

    // Step 6: Revalidate and Return Success
    revalidatePath("/forum")
    revalidatePath(`/forum/${category.slug}`)
    
    return { 
      success: true, 
      post,
      message: "Forum post created successfully!",
      redirectUrl: `/forum/${category.slug}/${post.id}`
    }

  } catch (error) {
    console.error("Error creating forum post:", error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return { 
          success: false, 
          error: "A post with this title already exists. Please choose a different title." 
        }
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return { 
          success: false, 
          error: "Invalid category selected. Please choose a valid category." 
        }
      }
    }
    
    return { 
      success: false, 
      error: "An unexpected error occurred while creating your post. Please try again. If the problem persists, contact support." 
    }
  }
}

export async function createForumCommentAction(formData: FormData) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new Error("Your account must be verified to create forum comments. Please contact an administrator to verify your account.")
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new Error("Your account is blocked. You cannot create forum comments. Please contact an administrator.")
    }

    const content = formData.get("content") as string
    const postId = formData.get("postId") as string
    const parentId = formData.get("parentId") as string | null

    if (!content || !postId) {
      throw new Error("Missing required fields")
    }

    const comment = await prisma.forumComment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId: user.id,
      },
    })

    // Update post's reply count
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        repliesCount: {
          increment: 1,
        },
        lastReplyAt: new Date(),
      },
    })

    revalidatePath(`/forum/*/*/${postId}`)
    return { success: true, comment }
  } catch (error) {
    console.error("Error creating comment:", error)
    throw new Error("Failed to create comment. Please try again.")
  }
}

// Project Actions
export async function createProjectAction(formData: FormData) {
  try {
    // Step 1: Authentication Validation
    const user = await getAuthenticatedUser()

    if (!user) {
      return { 
        success: false, 
        error: "You must be logged in to create a project. Please sign in and try again." 
      }
    }

    // Check if user can create projects
    if (!canCreateProjects(user)) {
      return { 
        success: false, 
        error: "You don't have permission to create projects" 
      }
    }

    // Check if user is verified
    if (!user.isVerified) {
      return { 
        success: false, 
        error: "Your account must be verified to create projects. Please contact an administrator to verify your account." 
      }
    }

    // Check if user account is active
    if (!user.isActive) {
      return { 
        success: false, 
        error: "Your account is blocked. You cannot create projects. Please contact an administrator." 
      }
    }

    // Step 2: Input Validation
    const title = (formData.get("title") as string)?.trim()
    const description = (formData.get("description") as string)?.trim()
    const fullDescription = (formData.get("fullDescription") as string)?.trim()
    const categoryId = formData.get("category") as string
    const status = formData.get("status") as string
    const location = (formData.get("location") as string)?.trim()
    const duration = (formData.get("duration") as string)?.trim()
    const startDate = (formData.get("startDate") as string)?.trim()
    const endDate = (formData.get("endDate") as string)?.trim()
    const funding = (formData.get("funding") as string)?.trim()
    const methodology = (formData.get("methodology") as string)?.trim()
    const results = (formData.get("results") as string)?.trim()
    const technologies = formData.get("technologies") as string
    const objectives = formData.get("objectives") as string
    const challenges = formData.get("challenges") as string
    const outcomes = formData.get("outcomes") as string
    const teamMembers = formData.get("teamMembers") as string
    const gallery = formData.get("gallery") as string
    const thumbnail = formData.get("thumbnail") as string | null

    // Validate title
    if (!title) {
      return { 
        success: false, 
        error: "Project title is required. Please enter a descriptive title for your project." 
      }
    }

    if (title.length < 5) {
      return { 
        success: false, 
        error: "Project title must be at least 5 characters long. Please make it more descriptive." 
      }
    }

    if (title.length > 200) {
      return { 
        success: false, 
        error: "Project title is too long. Please keep it under 200 characters." 
      }
    }

    // Validate description
    if (!description) {
      return { 
        success: false, 
        error: "Project description is required. Please write a description of your project." 
      }
    }

    if (description.length < 10) {
      return { 
        success: false, 
        error: "Project description must be at least 10 characters long. Please provide more details." 
      }
    }

    if (description.length > 1000) {
      return { 
        success: false, 
        error: "Project description is too long. Please keep it under 1,000 characters." 
      }
    }

    // Validate category
    if (!categoryId) {
      return { 
        success: false, 
        error: "Please select a category for your project." 
      }
    }

    // Verify category exists
    const category = await prisma.projectCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return { 
        success: false, 
        error: "Selected category does not exist. Please choose a valid category." 
      }
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
        const parsed = JSON.parse(technologies)
        if (Array.isArray(parsed)) {
          parsedTechnologies = parsed
        }
      } catch (error) {
        // If JSON parsing fails, treat as empty array
        parsedTechnologies = []
      }
    }

    if (objectives) {
      try {
        const parsed = JSON.parse(objectives)
        if (Array.isArray(parsed)) {
          parsedObjectives = parsed
        }
      } catch (error) {
        parsedObjectives = []
      }
    }

    if (challenges) {
      try {
        const parsed = JSON.parse(challenges)
        if (Array.isArray(parsed)) {
          parsedChallenges = parsed
        }
      } catch (error) {
        parsedChallenges = []
      }
    }

    if (outcomes) {
      try {
        const parsed = JSON.parse(outcomes)
        if (Array.isArray(parsed)) {
          parsedOutcomes = parsed
        }
      } catch (error) {
        parsedOutcomes = []
      }
    }

    if (teamMembers) {
      try {
        const parsed = JSON.parse(teamMembers)
        if (Array.isArray(parsed)) {
          parsedTeamMembers = parsed
        }
      } catch (error) {
        parsedTeamMembers = []
      }
    }

    if (gallery) {
      try {
        const parsed = JSON.parse(gallery)
        if (Array.isArray(parsed)) {
          parsedGallery = parsed
        }
      } catch (error) {
        parsedGallery = []
      }
    }

    // Parse resources
    let parsedResources: any[] = []
    const resources = formData.get("resources") as string
    if (resources) {
      try {
        const parsed = JSON.parse(resources)
        if (Array.isArray(parsed)) {
          parsedResources = parsed
        }
      } catch (error) {
        parsedResources = []
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
        methodology: methodology || null,
        results: results || null,
        technologies: parsedTechnologies,
        objectives: parsedObjectives,
        challenges: parsedChallenges,
        outcomes: parsedOutcomes,
        teamMembers: parsedTeamMembers,
        gallery: parsedGallery,
        resources: parsedResources,
        thumbnail: thumbnail || null,
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

    // Move files from temp to project-specific folders
    const { resources: updatedResources, gallery: updatedGallery } = await moveFilesFromTemp(project.id, parsedResources, parsedGallery)
    
    // Update project with correct file URLs
    await prisma.project.update({
      where: { id: project.id },
      data: {
        resources: updatedResources,
        gallery: updatedGallery,
      },
    })

    // Step 7: Revalidate and Return Success
    revalidatePath("/projects")
    
    return { 
      success: true, 
      project,
      message: "Project created successfully!",
      redirectUrl: `/projects/${project.id}`
    }

  } catch (error) {
    console.error("Error creating project:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    })
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return { 
          success: false, 
          error: "A project with this title already exists. Please choose a different title." 
        }
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return { 
          success: false, 
          error: "Invalid category selected. Please choose a valid category." 
        }
      }
    }
    
    return { 
      success: false, 
      error: "An unexpected error occurred while creating your project. Please try again. If the problem persists, contact support." 
    }
  }
}

export async function updateProjectAction(projectId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    // If no session, try to get user from form data (fallback for demo)
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role,
            isVerified: dbUser.isVerified
          }
        }
      }
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the project to check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { authorId: true }
    })

    if (!existingProject) {
      throw new Error("Project not found")
    }

    // Check if user can edit this project
    if (!canEditOwnContent(user, existingProject.authorId)) {
      throw new Error("You don't have permission to edit this project")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const fullDescription = formData.get("overview") as string
    const category = formData.get("category") as string
    const status = formData.get("status") as string
    const location = formData.get("location") as string
    const duration = formData.get("duration") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const funding = formData.get("funding") as string

    if (!title || !description) {
      throw new Error("Missing required fields")
    }

    // Helper to parse JSON fields, handling null/empty strings
    const parseJsonField = (field: FormDataEntryValue | null) => {
      if (!field || typeof field !== 'string' || field.trim() === '') {
        return null
      }
      try {
        return JSON.parse(field)
      } catch (e) {
        console.error(`Error parsing JSON field: ${field}`, e)
        return null
      }
    }

    // Parse JSON fields
    const technologies = parseJsonField(formData.get("technologies"))
    const objectives = parseJsonField(formData.get("objectives"))
    const challenges = parseJsonField(formData.get("challenges"))
    const outcomes = parseJsonField(formData.get("outcomes"))
    const teamMembers = parseJsonField(formData.get("teamMembers"))
    const gallery = parseJsonField(formData.get("gallery"))
    const resources = parseJsonField(formData.get("resources"))

    // Handle category properly - it should be a relation, not a string
    const categoryData = category && category !== "undefined" ? { connect: { id: category } } : { disconnect: true }

    // Map status values to enum
    const mappedStatus = status === "in-progress" ? "in_progress" : 
                        status === "on-hold" ? "on_hold" : 
                        status as any

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        fullDescription: fullDescription || null,
        category: categoryData,
        status: mappedStatus,
        location: location || null,
        duration: duration || null,
        startDate: startDate || null,
        endDate: endDate || null,
        funding: funding || null,
        technologies,
        objectives,
        challenges,
        outcomes,
        teamMembers,
        gallery,
        resources,
      },
    })

    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    return { success: true, project }
  } catch (error) {
    console.error("Error updating project:", error)
    throw new Error("Failed to update project. Please try again.")
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the project to check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { authorId: true }
    })

    if (!existingProject) {
      throw new Error("Project not found")
    }

    // Check if user can delete this project
    if (!canDeleteAnyContent(user) && !canEditOwnContent(user, existingProject.authorId)) {
      throw new Error("You don't have permission to delete this project")
    }

    await prisma.project.delete({
      where: { id: projectId },
    })

    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    throw new Error("Failed to delete project. Please try again.")
  }
}

// Event Actions
export async function createEventAction(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    // If no session, try to get user from form data (fallback for demo)
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role,
            isVerified: dbUser.isVerified
          }
        }
      }
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if user can create events
    if (!canCreateEvents(user)) {
      throw new Error("You don't have permission to create events")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const fullDescription = formData.get("fullDescription") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const capacity = parseInt(formData.get("capacity") as string) || null
    const price = parseFloat(formData.get("price") as string) || 0
    const currency = formData.get("currency") as string || "USD"
    const registrationDeadline = formData.get("registrationDeadline") as string
    const requirements = formData.get("requirements") as string
    const tags = formData.get("tags") as string
    const speakers = formData.get("speakers") as string
    const agenda = formData.get("agenda") as string
    const gallery = formData.get("gallery") as string

    if (!title || !description || !category || !startDate || !endDate || !location) {
      throw new Error("Missing required fields")
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        fullDescription: fullDescription || null,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        venue: venue || null,
        capacity,
        price,
        currency,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        requirements: requirements || null,
        tags: tags || null,
        speakers: speakers || null,
        agenda: agenda || null,
        gallery: gallery || null,
        organizerId: user.id,
      },
    })

    // Update user's event count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        eventsCount: {
          increment: 1,
        },
      },
    })

    revalidatePath("/events")
    return { success: true, event }
  } catch (error) {
    console.error("Error creating event:", error)
    throw new Error("Failed to create event. Please try again.")
  }
}

export async function updateEventAction(eventId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    // If no session, try to get user from form data (fallback for demo)
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role,
            isVerified: dbUser.isVerified
          }
        }
      }
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the event to check ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    })

    if (!existingEvent) {
      throw new Error("Event not found")
    }

    // Check if user can edit this event
    if (!canEditOwnContent(user, existingEvent.organizerId)) {
      throw new Error("You don't have permission to edit this event")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const fullDescription = formData.get("fullDescription") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const capacity = parseInt(formData.get("capacity") as string) || null
    const price = parseFloat(formData.get("price") as string) || 0
    const currency = formData.get("currency") as string || "USD"
    const registrationDeadline = formData.get("registrationDeadline") as string
    const requirements = formData.get("requirements") as string
    const tags = formData.get("tags") as string
    const speakers = formData.get("speakers") as string
    const agenda = formData.get("agenda") as string
    const gallery = formData.get("gallery") as string

    if (!title || !description || !category || !startDate || !endDate || !location) {
      throw new Error("Missing required fields")
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        fullDescription: fullDescription || null,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        venue: venue || null,
        capacity,
        price,
        currency,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        requirements: requirements || null,
        tags: tags || null,
        speakers: speakers || null,
        agenda: agenda || null,
        gallery: gallery || null,
      },
    })

    revalidatePath("/events")
    revalidatePath(`/events/${eventId}`)
    return { success: true, event }
  } catch (error) {
    console.error("Error updating event:", error)
    throw new Error("Failed to update event. Please try again.")
  }
}

export async function deleteEventAction(eventId: string) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the event to check ownership
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    })

    if (!existingEvent) {
      throw new Error("Event not found")
    }

    // Check if user can delete this event
    if (!canDeleteAnyContent(user) && !canEditOwnContent(user, existingEvent.organizerId)) {
      throw new Error("You don't have permission to delete this event")
    }

    await prisma.event.delete({
      where: { id: eventId },
    })

    revalidatePath("/events")
    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    throw new Error("Failed to delete event. Please try again.")
  }
}

// Service Actions
export async function createServiceAction(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    // If no session, try to get user from form data (fallback for demo)
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role,
            isVerified: dbUser.isVerified
          }
        }
      }
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if user can create services
    if (!canCreateServices(user)) {
      throw new Error("You don't have permission to create services")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const region = formData.get("region") as string
    const contact = formData.get("contact") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const website = formData.get("website") as string
    const services = formData.get("services") as string

    if (!title || !description || !category || !region || !contact) {
      throw new Error("Missing required fields")
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        region: region as any,
        contact,
        phone: phone || null,
        email: email || null,
        website: website || null,
        services: services || null,
        providerId: user.id,
      },
    })

    // Update user's service count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        servicesCount: {
          increment: 1,
        },
      },
    })

    revalidatePath("/services")
    return { success: true, service }
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service. Please try again.")
  }
}

export async function updateServiceAction(serviceId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    // If no session, try to get user from form data (fallback for demo)
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role,
            isVerified: dbUser.isVerified
          }
        }
      }
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the service to check ownership
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { providerId: true }
    })

    if (!existingService) {
      throw new Error("Service not found")
    }

    // Check if user can edit this service
    if (!canEditOwnContent(user, existingService.providerId)) {
      throw new Error("You don't have permission to edit this service")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const region = formData.get("region") as string
    const contact = formData.get("contact") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const website = formData.get("website") as string
    const services = formData.get("services") as string

    if (!title || !description || !category || !region || !contact) {
      throw new Error("Missing required fields")
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title,
        description,
        category,
        region: region as any,
        contact,
        phone: phone || null,
        email: email || null,
        website: website || null,
        services: services || null,
      },
    })

    revalidatePath("/services")
    revalidatePath(`/services/${serviceId}`)
    return { success: true, service }
  } catch (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service. Please try again.")
  }
}

export async function deleteServiceAction(serviceId: string) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the service to check ownership
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { providerId: true }
    })

    if (!existingService) {
      throw new Error("Service not found")
    }

    // Check if user can delete this service
    if (!canDeleteAnyContent(user) && !canEditOwnContent(user, existingService.providerId)) {
      throw new Error("You don't have permission to delete this service")
    }

    await prisma.service.delete({
      where: { id: serviceId },
    })

    revalidatePath("/services")
    return { success: true }
  } catch (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service. Please try again.")
  }
}

// Opportunity Actions
export async function createOpportunityAction(formData: FormData) {
  try {
    // Get user from form data (since we're using localStorage for demo)
    const userId = formData.get("userId") as string
    if (!userId) {
      throw new Error("User ID is required")
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!dbUser) {
      throw new Error("User not found")
    }

    const user = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      fullName: dbUser.fullName,
      role: dbUser.role,
      isVerified: dbUser.isVerified
    }

    // Check if user can post opportunities
    if (!canPostOpportunities(user)) {
      throw new Error(`You don't have permission to post opportunities. Your role (${user.role}) is not authorized.`)
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const company = formData.get("company") as string
    const opportunityType = formData.get("opportunityType") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const salary = formData.get("salary") as string
    const requirements = formData.get("requirements") as string
    const isUrgent = formData.get("isUrgent") === "true"
    const isRemote = formData.get("isRemote") === "true"
    const tabCategory = formData.get("tabCategory") as string
    const allowApplication = formData.get("allowApplication") === "true"
    const applicationDeadline = formData.get("applicationDeadline") as string

    if (!title || !description || !company || !opportunityType || !category || !location) {
      throw new Error("Missing required fields")
    }

    console.log("Creating opportunity with data:", {
      title,
      company,
      opportunityType,
      category,
      location,
      tabCategory,
      userId: user.id,
      userRole: user.role
    })

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        company,
        opportunityType,
        employmentTypeId: formData.get("employmentTypeId") as string || null,
        categoryId: formData.get("categoryId") as string || null,
        location,
        salary: salary || null,
        requirements: requirements || null,
        isUrgent,
        isRemote,
        allowApplication: allowApplication || true,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        posterId: user.id,
        tabCategory: tabCategory || "job",
      },
    })

    // Update user's opportunity count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        opportunitiesCount: {
          increment: 1,
        },
      },
    })

    revalidatePath("/opportunities")
    return { success: true, opportunity }
  } catch (error) {
    console.error("Error creating opportunity:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create opportunity. Please try again.")
  }
}

export async function updateOpportunityAction(opportunityId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    // If no session, try to get user from form data (fallback for demo)
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email,
            fullName: dbUser.fullName,
            role: dbUser.role,
            isVerified: dbUser.isVerified
          }
        }
      }
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the opportunity to check ownership
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { posterId: true }
    })

    if (!existingOpportunity) {
      throw new Error("Opportunity not found")
    }

    // Check if user can edit this opportunity
    if (!canEditOwnContent(user, existingOpportunity.posterId)) {
      throw new Error("You don't have permission to edit this opportunity")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const company = formData.get("company") as string
    const opportunityType = formData.get("opportunityType") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const salary = formData.get("salary") as string
    const requirements = formData.get("requirements") as string
    const isUrgent = formData.get("isUrgent") === "true"
    const isRemote = formData.get("isRemote") === "true"

    if (!title || !description || !company || !opportunityType || !category || !location) {
      throw new Error("Missing required fields")
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        title,
        description,
        company,
        opportunityType,
        category,
        location,
        salary: salary || null,
        requirements: requirements || null,
        isUrgent,
        isRemote,
      },
    })

    revalidatePath("/opportunities")
    revalidatePath(`/opportunities/${opportunityId}`)
    return { success: true, opportunity }
  } catch (error) {
    console.error("Error updating opportunity:", error)
    throw new Error("Failed to update opportunity. Please try again.")
  }
}

export async function deleteOpportunityAction(opportunityId: string) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value

    let user = null

    if (sessionId) {
      user = getSession(sessionId)
    }

    if (!user) {
      throw new Error("Authentication required")
    }

    // Get the opportunity to check ownership
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { posterId: true }
    })

    if (!existingOpportunity) {
      throw new Error("Opportunity not found")
    }

    // Check if user can delete this opportunity
    if (!canDeleteAnyContent(user) && !canEditOwnContent(user, existingOpportunity.posterId)) {
      throw new Error("You don't have permission to delete this opportunity")
    }

    await prisma.opportunity.delete({
      where: { id: opportunityId },
    })

    revalidatePath("/opportunities")
    return { success: true }
  } catch (error) {
    console.error("Error deleting opportunity:", error)
    throw new Error("Failed to delete opportunity. Please try again.")
  }
}

