"use server"

import { db, initializeDatabase } from "./db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Initialize database on first load
initializeDatabase()

// Authentication actions
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    return { error: "Login failed. Please try again." }
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const fullName = formData.get("fullName") as string
  const password = formData.get("password") as string

  if (!email || !username || !fullName || !password) {
    return { error: "All fields are required" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, fullName, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    return { error: "Registration failed. Please try again." }
  }
}

// Forum actions
export async function createForumPostAction(formData: FormData) {
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const categoryId = formData.get("categoryId") as string
  const tags = formData.get("tags") as string

  if (!title || !content || !categoryId) {
    return { error: "Title, content, and category are required" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/forum/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        categoryId,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    revalidatePath("/forum")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create post. Please try again." }
  }
}

export async function createCommentAction(formData: FormData) {
  const content = formData.get("content") as string
  const postId = formData.get("postId") as string
  const parentId = (formData.get("parentId") as string) || undefined

  if (!content || !postId) {
    return { error: "Content and post are required" }
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/forum/posts/${postId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    revalidatePath(`/forum/*/*`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to create comment. Please try again." }
  }
}

// Project actions
export async function createProjectAction(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const fullDescription = formData.get("fullDescription") as string
  const category = formData.get("category") as string
  const status = formData.get("status") as string

  if (!title || !description || !category) {
    return { error: "Title, description, and category are required" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, fullDescription, category, status }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create project. Please try again." }
  }
}

// Event actions
export async function createEventAction(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const location = formData.get("location") as string
  const venue = formData.get("venue") as string

  if (!title || !description || !startDate || !location) {
    return { error: "Title, description, start date, and location are required" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, startDate, endDate, location, venue }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error }
    }

    revalidatePath("/events")
    return { success: true }
  } catch (error) {
    return { error: "Failed to create event. Please try again." }
  }
}

// Search action
export async function searchAction(formData: FormData) {
  const query = formData.get("query") as string
  const type = formData.get("type") as string

  if (!query) {
    return { error: "Search query is required" }
  }

  try {
    const results = {
      posts: [],
      projects: [],
      events: [],
    }

    if (!type || type === "posts") {
      const posts = await db.forumPosts.findAll()
      results.posts = posts
        .filter(
          (post) =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 10)
    }

    if (!type || type === "projects") {
      const projects = await db.projects.findAll()
      results.projects = projects
        .filter(
          (project) =>
            project.title.toLowerCase().includes(query.toLowerCase()) ||
            project.description.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 10)
    }

    if (!type || type === "events") {
      const events = await db.events.findAll()
      results.events = events
        .filter(
          (event) =>
            event.title.toLowerCase().includes(query.toLowerCase()) ||
            event.description.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 10)
    }

    return { results }
  } catch (error) {
    return { error: "Search failed. Please try again." }
  }
}
