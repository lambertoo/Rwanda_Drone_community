"use client"

import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EditProjectForm from '@/components/projects/edit-project-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function EditProjectPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = params.id as string

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`)
        if (response.ok) {
          const projectData = await response.json()
          setProject(projectData)
        } else {
          setError('Project not found')
        }
      } catch (error) {
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  // Show loading state while authentication is being checked
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if user can edit this project
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">You must be logged in to edit projects.</p>
            <Button onClick={() => router.push('/login')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[200px]>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Project Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user can edit this project (admin or project author)
  if (!user.role.includes('admin') && project.authorId !== user.id) {
    return (
      <div className="flex items-center justify-center min-h-[200px]>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You don't have permission to edit this project. Only the project author and administrators can edit projects.
            </p>
            <Button onClick={() => router.push(`/projects/${projectId}`)}>View Project</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update your project details</p>
        </div>
      </div>

      <EditProjectForm projectId={projectId} />
    </div>
  )
} 