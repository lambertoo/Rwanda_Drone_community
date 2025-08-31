'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import EditProjectForm from "@/components/projects/edit-project-form"

interface Project {
  id: string
  title: string
  description: string
  fullDescription?: string
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  location?: string
  duration?: string
  startDate?: string
  endDate?: string
  funding?: string
  technologies?: any[]
  objectives?: any[]
  challenges?: any[]
  outcomes?: any[]
  methodology?: string
  results?: string
  teamMembers?: any[]
  gallery?: any[]
  resources?: any[]
  thumbnail?: string
  categoryId?: string
  author: {
    id: string
    fullName: string
    avatar?: string
    role: string
  }
  category?: {
    id: string
    name: string
    color: string
    icon: string
  }
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setProject(data)
        } else {
          setError(`Failed to fetch project: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setError(`Fetch error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  // Check if user can edit this project
  useEffect(() => {
    if (project && isAuthenticated && user && !authLoading) {
      const canEdit = user.role === 'admin' || user.id === project.author.id
      if (!canEdit) {
        router.push(`/projects/${params.id}`)
      }
    }
  }, [project, isAuthenticated, user, authLoading, router, params.id])

  // Show loading state while authentication is being checked or project is being fetched
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-muted-foreground mt-2">{error || 'Project not found'}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if user can edit this project
  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  const canEdit = user.role === 'admin' || user.id === project.author.id
  if (!canEdit) {
    router.push(`/projects/${params.id}`)
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Project</h1>
          <p className="text-muted-foreground">
            Update your drone project information and share the latest developments with the community.
          </p>
        </div>

        <EditProjectForm 
          projectId={params.id}
          initialData={project}
        />
      </div>
    </div>
  )
} 