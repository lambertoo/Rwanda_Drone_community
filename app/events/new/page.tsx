import NewEventForm from "@/components/events/new-event-form"
import { AuthGuard } from "@/components/auth-guard"

export default function NewEventPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
          <p className="text-muted-foreground">
            Organize drone events, workshops, and meetups. Admins and Regulators can create events.
          </p>
        </div>

        <AuthGuard 
          requiredPermissions={["authenticated"]}
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You need to be logged in as an Admin or Regulator to create events.
              </p>
            </div>
          }
        >
          <NewEventForm />
        </AuthGuard>
      </div>
    </div>
  )
}
