import NewOpportunityForm from "@/components/opportunities/new-opportunity-form"
import { AuthGuard } from "@/components/auth-guard"

export default function NewOpportunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
                              <h1 className="text-3xl font-bold mb-2">Post an Opportunity</h1>
                    <p className="text-muted-foreground">
                      Post opportunity opportunities for drone pilots and professionals. Service Providers and Pilots can post opportunities.
                    </p>
        </div>

        <AuthGuard 
          requiredPermissions={["authenticated"]}
          fallback={
            <div className="text-center py-12">
                                      <p className="text-muted-foreground mb-4">
                          You need to be logged in as a Service Provider or Pilot to post opportunities.
                        </p>
            </div>
          }
        >
                                <NewOpportunityForm />
        </AuthGuard>
      </div>
    </div>
  )
} 