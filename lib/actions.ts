"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"

// Forum Actions
export async function createForumPostAction(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const tags = JSON.parse((formData.get("tags") as string) || "[]")

    if (!title || !content || !category) {
      throw new Error("Missing required fields")
    }

    const post = await db.createForumPost({
      title,
      content,
      category,
      tags,
      authorId: "current-user-id", // In real app, get from session
    })

    revalidatePath("/forum")
    revalidatePath(`/forum/${category}`)
    redirect(`/forum/${category}/${post.id}`)
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
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const status = formData.get("status") as string
    const location = formData.get("location") as string
    const duration = formData.get("duration") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const funding = formData.get("funding") as string
    const overview = formData.get("overview") as string
    const methodology = formData.get("methodology") as string
    const results = formData.get("results") as string

    const technologies = JSON.parse((formData.get("technologies") as string) || "[]")
    const objectives = JSON.parse((formData.get("objectives") as string) || "[]")
    const challenges = JSON.parse((formData.get("challenges") as string) || "[]")
    const outcomes = JSON.parse((formData.get("outcomes") as string) || "[]")
    const teamMembers = JSON.parse((formData.get("teamMembers") as string) || "[]")
    const gallery = JSON.parse((formData.get("gallery") as string) || "[]")

    if (!title || !description || !category || !status) {
      throw new Error("Missing required fields")
    }

    const project = await db.createProject({
      title,
      description,
      category,
      status,
      location,
      duration,
      startDate,
      endDate,
      funding,
      overview,
      methodology,
      results,
      technologies,
      objectives,
      challenges,
      outcomes,
      teamMembers,
      gallery,
      authorId: "current-user-id", // In real app, get from session
    })

    revalidatePath("/projects")
    redirect(`/projects/${project.id}`)
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

// Event Actions
export async function createEventAction(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const fullDescription = formData.get("fullDescription") as string
    const category = formData.get("category") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const capacity = formData.get("capacity") as string
    const price = formData.get("price") as string
    const currency = formData.get("currency") as string
    const registrationDeadline = formData.get("registrationDeadline") as string
    const isPublic = formData.get("isPublic") === "true"
    const allowRegistration = formData.get("allowRegistration") === "true"

    const requirements = JSON.parse((formData.get("requirements") as string) || "[]")
    const tags = JSON.parse((formData.get("tags") as string) || "[]")
    const speakers = JSON.parse((formData.get("speakers") as string) || "[]")
    const agenda = JSON.parse((formData.get("agenda") as string) || "[]")
    const gallery = JSON.parse((formData.get("gallery") as string) || "[]")

    if (!title || !description || !category || !startDate || !startTime || !location) {
      throw new Error("Missing required fields")
    }

    // Create the event object
    const eventData = {
      title,
      description,
      fullDescription: fullDescription || description,
      category,
      startDate: new Date(`${startDate}T${startTime}`),
      endDate: endDate
        ? new Date(`${endDate}T${endTime || startTime}`)
        : new Date(`${startDate}T${endTime || startTime}`),
      location,
      venue: venue || location,
      capacity: capacity ? Number.parseInt(capacity) : undefined,
      price: price ? Number.parseFloat(price) : 0,
      currency: currency || "RWF",
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
      requirements,
      tags,
      speakers,
      agenda,
      gallery,
      isPublic,
      allowRegistration,
      organizerId: "current-user-id", // In real app, get from session
      createdAt: new Date(),
      updatedAt: new Date(),
      viewsCount: 0,
      registeredCount: 0,
      isPublished: true,
      isFeatured: false,
    }

    const event = await db.createEvent(eventData)

    revalidatePath("/events")
    redirect(`/events/${event.id}`)
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

// Search Actions
export async function searchAction(formData: FormData) {
  try {
    const query = formData.get("query") as string
    const type = (formData.get("type") as string) || "all"

    if (!query) {
      return { results: [] }
    }

    const results = await db.search(query, type)
    return { results }
  } catch (error) {
    console.error("Error searching:", error)
    return { results: [] }
  }
}

// User Actions
export async function updateUserProfileAction(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const bio = formData.get("bio") as string
    const location = formData.get("location") as string
    const website = formData.get("website") as string

    if (!name || !email) {
      throw new Error("Name and email are required")
    }

    await db.updateUser("current-user-id", {
      name,
      email,
      bio,
      location,
      website,
    })

    revalidatePath("/profile")
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

// Event Registration Actions
export async function registerForEventAction(formData: FormData) {
  try {
    const eventId = formData.get("eventId") as string
    const userId = "current-user-id" // In real app, get from session

    if (!eventId) {
      throw new Error("Event ID is required")
    }

    await db.registerForEvent(eventId, userId)

    revalidatePath(`/events/${eventId}`)
    return { success: true, message: "Successfully registered for event!" }
  } catch (error) {
    console.error("Error registering for event:", error)
    return { success: false, message: "Failed to register for event" }
  }
}

export async function unregisterFromEventAction(formData: FormData) {
  try {
    const eventId = formData.get("eventId") as string
    const userId = "current-user-id" // In real app, get from session

    if (!eventId) {
      throw new Error("Event ID is required")
    }

    await db.unregisterFromEvent(eventId, userId)

    revalidatePath(`/events/${eventId}`)
    return { success: true, message: "Successfully unregistered from event!" }
  } catch (error) {
    console.error("Error unregistering from event:", error)
    return { success: false, message: "Failed to unregister from event" }
  }
}
