import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EventEditForm from "@/components/events/event-edit-form"

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Edit Event</h1>
      </div>
      
      <EventEditForm event={event} />
    </div>
  )
} 