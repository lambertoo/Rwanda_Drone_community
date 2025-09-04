import NewProjectForm from "@/components/projects/new-project-form"
import { AuthGuard } from "@/components/auth-guard"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function NewProjectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Showcase your drone projects, share your work, and inspire the community.
          </p>
        </div>

        <AuthGuard 
          requiredPermissions={["authenticated"]}
          fallback={
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to create projects. Hobbyists, Pilots, Students, and Service Providers can create projects.
              </p>
            </div>
          }
        >
          <NewProjectForm />
        </AuthGuard>
      </div>
    </div>
  )
}
