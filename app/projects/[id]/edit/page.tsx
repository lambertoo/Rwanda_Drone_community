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

  // Handle JSON fields (already parsed by Prisma)
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const objectives = Array.isArray(project.objectives) ? project.objectives : []
  const challenges = Array.isArray(project.challenges) ? project.challenges : []
  const outcomes = Array.isArray(project.outcomes) ? project.outcomes : []
  const teamMembers = Array.isArray(project.teamMembers) ? project.teamMembers : []
  const gallery = Array.isArray(project.gallery) ? project.gallery : []
  const resources = Array.isArray(project.resources) ? project.resources : []

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
          resources,
        }}
      />
    </div>
  )
} 