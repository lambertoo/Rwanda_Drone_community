import NewJobForm from "@/components/jobs/new-job-form"
import { AuthGuard } from "@/components/auth-guard"

export default function NewJobPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
          <p className="text-muted-foreground">
            Post job opportunities for drone pilots and professionals. Service Providers and Pilots can post jobs.
          </p>
        </div>

        <AuthGuard 
          requiredPermissions={["authenticated"]}
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You need to be logged in as a Service Provider or Pilot to post jobs.
              </p>
            </div>
          }
        >
          <NewJobForm />
        </AuthGuard>
      </div>
    </div>
  )
} 