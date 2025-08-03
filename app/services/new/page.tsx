import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import NewServiceForm from "@/components/services/new-service-form"

export default function NewServicePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-foreground">
            Services
          </Link>
          <span>/</span>
          <span>New Service</span>
        </div>
      </div>

      {/* Form */}
      <NewServiceForm />
    </div>
  )
} 