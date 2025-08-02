import type { Metadata } from "next"
import NewEventForm from "@/components/events/new-event-form"

export const metadata: Metadata = {
  title: "Create New Event | Rwanda Drone Community",
  description: "Create and share a new drone community event",
}

export default function NewEventPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground mt-2">
            Share your drone event with the community and help others discover exciting opportunities.
          </p>
        </div>

        <NewEventForm />
      </div>
    </div>
  )
}
