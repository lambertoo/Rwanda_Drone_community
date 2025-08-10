import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EventEditForm from "@/components/events/event-edit-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params

  // Fetch event data
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: true,
      category: true,
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/events" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Events</span>
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {event.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {event.category.icon} {event.category.name}
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Edit: {event.title}
              </h1>
              
              <p className="text-lg text-gray-600 max-w-3xl">
                Update your event details, speakers, agenda, and settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <EventEditForm event={event} />
        </div>
      </div>
    </div>
  )
} 