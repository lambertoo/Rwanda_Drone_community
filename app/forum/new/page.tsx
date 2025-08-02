import { NewPostForm } from "@/components/forum/new-post-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewPostPage() {
  // Mock categories - in real app, fetch from API
  const categories = [
    {
      id: "regulations",
      name: "Regulations & Legal",
      slug: "regulations",
      description: "Discuss RCAA regulations, legal requirements, and compliance",
      icon: "⚖️",
    },
    {
      id: "maintenance",
      name: "Repairs & Maintenance",
      slug: "maintenance",
      description: "Get help with drone repairs and maintenance",
      icon: "🔧",
    },
    {
      id: "flying-tips",
      name: "Flying Tips & Techniques",
      slug: "flying-tips",
      description: "Share flying experiences and techniques",
      icon: "✈️",
    },
    {
      id: "jobs",
      name: "Jobs & Opportunities",
      slug: "jobs",
      description: "Find drone-related job opportunities",
      icon: "💼",
    },
    {
      id: "events",
      name: "Events & Meetups",
      slug: "events",
      description: "Organize and discover community events",
      icon: "📅",
    },
    {
      id: "agriculture",
      name: "Agricultural Applications",
      slug: "agriculture",
      description: "Discuss drone applications in agriculture",
      icon: "🌾",
    },
    {
      id: "photography",
      name: "Photography & Videography",
      slug: "photography",
      description: "Share aerial photography tips and showcase work",
      icon: "📸",
    },
    {
      id: "general",
      name: "General Discussion",
      slug: "general",
      description: "General drone discussions and community topics",
      icon: "💬",
    },
  ]

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
      <NewPostForm categories={categories} />
    </div>
  )
}
