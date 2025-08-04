import { Suspense } from "react"
import { NewPostForm } from "@/components/forum/new-post-form"
import { LoggedInOnly } from "@/components/auth-guard"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { name: "asc" }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Forum Post</h1>
          <p className="text-muted-foreground">
            Share your thoughts, ask questions, or start a discussion with the drone community.
          </p>
        </div>

        <LoggedInOnly>
          <Suspense fallback={<div>Loading form...</div>}>
            <NewPostForm categories={categories} />
          </Suspense>
        </LoggedInOnly>
      </div>
    </div>
  )
}
