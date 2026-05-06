import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import PublicFormClient from "./public-form-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  const form = await prisma.universalForm.findUnique({
    where: { id },
    select: { title: true, description: true, settings: true },
  })

  if (!form) {
    return {
      title: "Form Not Found",
    }
  }

  const title = form.title
  const description = form.description || "Fill out this form on Rwanda UAS Community"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Rwanda UAS Community",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default function PublicFormPage() {
  return <PublicFormClient />
}
