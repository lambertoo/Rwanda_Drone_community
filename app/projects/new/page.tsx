import type { Metadata } from "next"
import NewProjectForm from "@/components/projects/new-project-form"

export const metadata: Metadata = {
  title: "Share Your Project | Rwanda Drone Community",
  description: "Share your drone project with the Rwanda drone community and showcase your innovations.",
}

export default function NewProjectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <NewProjectForm />
    </div>
  )
}
