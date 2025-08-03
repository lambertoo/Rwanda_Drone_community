import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditProjectForm from "@/components/projects/edit-project-form"

export const metadata: Metadata = {
  title: "Edit Project | Rwanda Drone Community",
  description: "Edit your drone project in the Rwanda drone community.",
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params

  // Fetch project data
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      author: true,
    }
  })

  if (!project) {
    notFound()
  }

  // Parse JSON fields
  const technologies = project.technologies ? JSON.parse(project.technologies) : []
  const objectives = project.objectives ? JSON.parse(project.objectives) : []
  const challenges = project.challenges ? JSON.parse(project.challenges) : []
  const outcomes = project.outcomes ? JSON.parse(project.outcomes) : []
  const teamMembers = project.teamMembers ? JSON.parse(project.teamMembers) : []
  const gallery = project.gallery ? JSON.parse(project.gallery) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <EditProjectForm 
        project={{
          ...project,
          technologies,
          objectives,
          challenges,
          outcomes,
          teamMembers,
          gallery,
        }}
      />
    </div>
  )
} 