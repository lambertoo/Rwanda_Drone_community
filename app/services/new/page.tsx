import NewServiceForm from "@/components/services/new-service-form"
import { AuthGuard } from "@/components/auth-guard"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function NewServicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">List Your Service</h1>
          <p className="text-muted-foreground">
            Offer your drone services to the community. Service Providers and Pilots can list their services.
          </p>
        </div>

        <AuthGuard 
          requiredPermissions={["authenticated"]}
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You need to be logged in as a Service Provider or Pilot to list services.
              </p>
            </div>
          }
        >
          <NewServiceForm />
        </AuthGuard>
      </div>
    </div>
  )
} 