"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"
import { getSession } from "./auth"
import { cookies } from "next/headers"

// Forum Actions
export async function createForumPostAction(formData: FormData) {
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
        // Fetch user from database
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const categoryId = formData.get("categoryId") as string
    const tagsString = formData.get("tags") as string
    const tags = tagsString ? tagsString.split(",").filter(tag => tag.trim()) : []

    if (!title || !content || !categoryId) {
      throw new Error("Missing required fields")
    }

    // Verify category exists
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId }
    })
    if (!category) {
      throw new Error("Invalid category")
    }

    // Create the post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        categoryId,
        authorId: user.id,
        tags: JSON.stringify(tags),
        viewsCount: 0,
        repliesCount: 0,
        isPinned: false,
        isLocked: false,
      },
      include: {
        category: true,
      }
    })

    // Update user's post count
    await prisma.user.update({
      where: { id: user.id },
      data: { postsCount: { increment: 1 } }
    })

    // Update category's post count
    await prisma.forumCategory.update({
      where: { id: categoryId },
      data: { 
        postCount: { increment: 1 },
        lastPostAt: new Date()
      }
    })

    revalidatePath("/forum")
    revalidatePath(`/forum/${category.slug}`)
    redirect(`/forum/${category.slug}/${post.id}`)
  } catch (error) {
    console.error("Error creating forum post:", error)
    throw error
  }
}

export async function createForumCommentAction(formData: FormData) {
  try {
    const content = formData.get("content") as string
    const postId = formData.get("postId") as string
    const parentId = formData.get("parentId") as string | null

    if (!content || !postId) {
      throw new Error("Missing required fields")
    }

    await db.createForumComment({
      content,
      postId,
      parentId,
      authorId: "current-user-id", // In real app, get from session
    })

    revalidatePath(`/forum/*/*/${postId}`)
  } catch (error) {
    console.error("Error creating comment:", error)
    throw error
  }
}

// Project Actions
export async function createProjectAction(formData: FormData) {
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
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const status = formData.get("status") as string
    const location = formData.get("location") as string
    const duration = formData.get("duration") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const funding = formData.get("funding") as string
    const fullDescription = formData.get("fullDescription") as string

    const technologies = JSON.parse((formData.get("technologies") as string) || "[]")
    const objectives = JSON.parse((formData.get("objectives") as string) || "[]")
    const challenges = JSON.parse((formData.get("challenges") as string) || "[]")
    const outcomes = JSON.parse((formData.get("outcomes") as string) || "[]")
    const teamMembers = JSON.parse((formData.get("teamMembers") as string) || "[]")
    const gallery = JSON.parse((formData.get("gallery") as string) || "[]")

    if (!title || !description || !category || !status) {
      throw new Error("Missing required fields")
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        fullDescription: fullDescription || description,
        category,
        status: status === "in-progress" ? "in_progress" : status === "on-hold" ? "on_hold" : status === "cancelled" ? "cancelled" : status as any,
        location,
        duration,
        startDate,
        endDate,
        funding,
        technologies: JSON.stringify(technologies),
        objectives: JSON.stringify(objectives),
        challenges: JSON.stringify(challenges),
        outcomes: JSON.stringify(outcomes),
        teamMembers: JSON.stringify(teamMembers),
        gallery: JSON.stringify(gallery),
        authorId: user.id,
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
      }
    })

    // Update user's project count
    await prisma.user.update({
      where: { id: user.id },
      data: { projectsCount: { increment: 1 } }
    })

    revalidatePath("/projects")
    redirect(`/projects/${project.id}`)
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
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
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      throw new Error("Project not found")
    }

    if (existingProject.authorId !== user.id && user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const status = formData.get("status") as string
    const location = formData.get("location") as string
    const duration = formData.get("duration") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const funding = formData.get("funding") as string
    const fullDescription = formData.get("fullDescription") as string

    const technologies = JSON.parse((formData.get("technologies") as string) || "[]")
    const objectives = JSON.parse((formData.get("objectives") as string) || "[]")
    const challenges = JSON.parse((formData.get("challenges") as string) || "[]")
    const outcomes = JSON.parse((formData.get("outcomes") as string) || "[]")
    const teamMembers = JSON.parse((formData.get("teamMembers") as string) || "[]")
    const gallery = JSON.parse((formData.get("gallery") as string) || "[]")

    if (!title || !description || !category || !status) {
      throw new Error("Missing required fields")
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        fullDescription: fullDescription || description,
        category,
        status: status === "in-progress" ? "in_progress" : status === "on-hold" ? "on_hold" : status === "cancelled" ? "cancelled" : status as any,
        location,
        duration,
        startDate,
        endDate,
        funding,
        technologies: JSON.stringify(technologies),
        objectives: JSON.stringify(objectives),
        challenges: JSON.stringify(challenges),
        outcomes: JSON.stringify(outcomes),
        teamMembers: JSON.stringify(teamMembers),
        gallery: JSON.stringify(gallery),
        updatedAt: new Date(),
      }
    })

    revalidatePath("/projects")
    revalidatePath(`/projects/${projectId}`)
    redirect(`/projects/${projectId}`)
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
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

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      throw new Error("Project not found")
    }

    if (existingProject.authorId !== user.id && user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId }
    })

    // Update user's project count
    await prisma.user.update({
      where: { id: existingProject.authorId },
      data: { projectsCount: { decrement: 1 } }
    })

    revalidatePath("/projects")
    redirect("/projects")
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
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
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const fullDescription = formData.get("fullDescription") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const price = formData.get("price") as string
    const currency = formData.get("currency") as string

    const speakers = JSON.parse((formData.get("speakers") as string) || "[]")
    const agenda = JSON.parse((formData.get("agenda") as string) || "[]")
    const requirements = JSON.parse((formData.get("requirements") as string) || "[]")
    const gallery = JSON.parse((formData.get("gallery") as string) || "[]")

    if (!title || !description || !startDate || !location) {
      throw new Error("Title, description, start date, and location are required")
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        fullDescription: fullDescription || description,
        category: category || "General",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location,
        venue: venue || location,
        price: price ? parseFloat(price) : 0,
        currency: currency || "RWF",
        speakers: JSON.stringify(speakers),
        agenda: JSON.stringify(agenda),
        requirements: JSON.stringify(requirements),
        gallery: JSON.stringify(gallery),
        isPublished: true,
        isFeatured: false,
        organizerId: user.id,
      }
    })

    // Update user's events count
    await prisma.user.update({
      where: { id: user.id },
      data: { eventsCount: { increment: 1 } }
    })

    revalidatePath("/events")
    redirect(`/events/${event.id}`)
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
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
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if event exists and user owns it
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      throw new Error("Event not found")
    }

    if (existingEvent.organizerId !== user.id && user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const fullDescription = formData.get("fullDescription") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const price = formData.get("price") as string
    const currency = formData.get("currency") as string

    const speakers = JSON.parse((formData.get("speakers") as string) || "[]")
    const agenda = JSON.parse((formData.get("agenda") as string) || "[]")
    const requirements = JSON.parse((formData.get("requirements") as string) || "[]")
    const gallery = JSON.parse((formData.get("gallery") as string) || "[]")

    if (!title || !description || !startDate || !location) {
      throw new Error("Title, description, start date, and location are required")
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        fullDescription: fullDescription || description,
        category,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location,
        venue,
        price: price ? parseFloat(price) : 0,
        currency,
        speakers: JSON.stringify(speakers),
        agenda: JSON.stringify(agenda),
        requirements: JSON.stringify(requirements),
        gallery: JSON.stringify(gallery),
        updatedAt: new Date(),
      }
    })

    revalidatePath("/events")
    revalidatePath(`/events/${eventId}`)
    redirect(`/events/${eventId}`)
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
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

    // Check if event exists and user owns it
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!existingEvent) {
      throw new Error("Event not found")
    }

    if (existingEvent.organizerId !== user.id && user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId }
    })

    // Update user's events count
    await prisma.user.update({
      where: { id: existingEvent.organizerId },
      data: { eventsCount: { decrement: 1 } }
    })

    revalidatePath("/events")
    redirect("/events")
  } catch (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

export async function createServiceAction(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    
    let user = null
    
    if (sessionId) {
      user = getSession(sessionId)
    }
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const region = formData.get("region") as string
    const contact = formData.get("contact") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const website = formData.get("website") as string
    const services = JSON.parse((formData.get("services") as string) || "[]")

    if (!title || !description || !category || !region || !contact) {
      throw new Error("Title, description, category, region, and contact are required")
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        region: region as any,
        contact,
        phone,
        email,
        website,
        services: JSON.stringify(services),
        providerId: user.id,
      }
    })

    revalidatePath("/services")
    redirect(`/services/${service.id}`)
  } catch (error) {
    console.error("Error creating service:", error)
    throw error
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
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      throw new Error("Service not found")
    }

    if (existingService.providerId !== user.id && user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const region = formData.get("region") as string
    const contact = formData.get("contact") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const website = formData.get("website") as string
    const services = JSON.parse((formData.get("services") as string) || "[]")

    if (!title || !description || !category || !region || !contact) {
      throw new Error("Title, description, category, region, and contact are required")
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title,
        description,
        category,
        region: region as any,
        contact,
        phone,
        email,
        website,
        services: JSON.stringify(services),
        updatedAt: new Date(),
      }
    })

    revalidatePath("/services")
    revalidatePath(`/services/${serviceId}`)
    redirect(`/services/${serviceId}`)
  } catch (error) {
    console.error("Error updating service:", error)
    throw error
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

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      throw new Error("Service not found")
    }

    if (existingService.providerId !== user.id && user.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId }
    })

    revalidatePath("/services")
    redirect("/services")
  } catch (error) {
    console.error("Error deleting service:", error)
    throw error
  }
}

export async function createJobAction(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    
    let user = null
    
    if (sessionId) {
      user = getSession(sessionId)
    }
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const company = formData.get("company") as string
    const jobType = formData.get("jobType") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const salary = formData.get("salary") as string
    const isUrgent = formData.get("isUrgent") === "true"
    const isRemote = formData.get("isRemote") === "true"

    const requirements = JSON.parse((formData.get("requirements") as string) || "[]")

    if (!title || !description || !company || !jobType || !category || !location) {
      throw new Error("Title, description, company, job type, category, and location are required")
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        company,
        jobType,
        category,
        location,
        salary: salary || null,
        requirements: JSON.stringify(requirements),
        isUrgent,
        isRemote,
        posterId: user.id,
      }
    })

    // Update user's jobs count
    await prisma.user.update({
      where: { id: user.id },
      data: { jobsCount: { increment: 1 } }
    })

    revalidatePath("/jobs")
    redirect(`/jobs/${job.id}`)
  } catch (error) {
    console.error("Error creating job:", error)
    throw error
  }
}

export async function updateJobAction(jobId: string, formData: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    
    let user = null
    
    if (sessionId) {
      user = getSession(sessionId)
    }
    
    if (!user) {
      const userId = formData.get("userId") as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            avatar: dbUser.avatar || "",
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            organization: dbUser.organization,
            pilotLicense: dbUser.pilotLicense,
            experience: dbUser.experience,
            specializations: dbUser.specializations,
            certifications: dbUser.certifications,
          }
        }
      }
    }
    
    if (!user) {
      throw new Error("Authentication required")
    }

    // Check if user owns the job or is admin
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { posterId: true }
    })

    if (!existingJob) {
      throw new Error("Job not found")
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (existingJob.posterId !== user.id && dbUser?.role !== 'admin') {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const company = formData.get("company") as string
    const jobType = formData.get("jobType") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const salary = formData.get("salary") as string
    const isUrgent = formData.get("isUrgent") === "true"
    const isRemote = formData.get("isRemote") === "true"
    const isActive = formData.get("isActive") === "true"

    const requirements = JSON.parse((formData.get("requirements") as string) || "[]")

    if (!title || !description || !company || !jobType || !category || !location) {
      throw new Error("Title, description, company, job type, category, and location are required")
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        company,
        jobType,
        category,
        location,
        salary: salary || null,
        requirements: JSON.stringify(requirements),
        isUrgent,
        isRemote,
        isActive,
      }
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)
    redirect(`/jobs/${jobId}`)
  } catch (error) {
    console.error("Error updating job:", error)
    throw error
  }
}

export async function deleteJobAction(jobId: string) {
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

    // Check if user owns the job or is admin
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      select: { posterId: true }
    })

    if (!existingJob) {
      throw new Error("Job not found")
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (existingJob.posterId !== user.id && dbUser?.role !== 'admin') {
      throw new Error("Unauthorized")
    }

    // Delete the job
    await prisma.job.delete({
      where: { id: jobId }
    })

    // Decrement user's jobs count
    await prisma.user.update({
      where: { id: existingJob.posterId },
      data: { jobsCount: { decrement: 1 } }
    })

    revalidatePath("/jobs")
    redirect("/jobs")
  } catch (error) {
    console.error("Error deleting job:", error)
    throw error
  }
}
