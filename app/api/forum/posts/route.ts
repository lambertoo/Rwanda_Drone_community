import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined

    let posts
    if (categoryId) {
      posts = await db.forumPosts.findByCategory(categoryId, limit, offset)
    } else {
      posts = await db.forumPosts.findAll(limit, offset)
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { title, content, categoryId, tags } = await request.json()

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
    }

    const category = await db.forumCategories.findById(categoryId)
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const userRecord = await db.users.findById(user.id)
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const post = await db.forumPosts.create({
      title,
      content,
      excerpt: content.substring(0, 200) + "...",
      categoryId,
      category,
      authorId: user.id,
      author: userRecord,
      isPinned: false,
      isLocked: false,
      tags: tags || [],
      status: "published",
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
