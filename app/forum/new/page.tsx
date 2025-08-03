import { NewPostForm } from "@/components/forum/new-post-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function NewPostPage() {
  // Fetch categories from database
  const categories = await prisma.forumCategory.findMany({
    orderBy: { name: 'asc' }
  })

  // Transform categories to match expected format
  const transformedCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: getCategoryIcon(category.slug),
  }))

  function getCategoryIcon(slug: string): string {
    const icons: { [key: string]: string } = {
      general: "💬",
      technical: "🔧",
      showcase: "📸",
    }
    return icons[slug] || "📝"
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      {/* Form */}
      <NewPostForm categories={transformedCategories} />
    </div>
  )
}
