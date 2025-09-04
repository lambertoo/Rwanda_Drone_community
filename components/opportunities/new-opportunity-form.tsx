"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createOpportunityAction } from "@/lib/actions"
import AdvancedFormBuilder from "./advanced-form-builder"

export default function NewOpportunityForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState<string[]>([""])
  const [selectedTab, setSelectedTab] = useState("job")
  const [activeFormTab, setActiveFormTab] = useState("basic")
  const [applicationForm, setApplicationForm] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    opportunityType: "",
    category: "",
    location: "",
    salary: "",
    isUrgent: false,
    isRemote: false
  })

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      description: "",
      opportunityType: "",
      category: "",
      location: "",
      salary: "",
      isUrgent: false,
      isRemote: false
    })
    setRequirements([""])
    setSelectedTab("job")
  }

  const addRequirement = () => {
    setRequirements([...requirements, ""])
  }

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index))
    }
  }

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements]
    newRequirements[index] = value
    setRequirements(newRequirements)
  }

  const handleFormBuilderSave = (form: { title: string; description: string; sections: any[] }) => {
    setApplicationForm(form)
    alert("Application form saved successfully!")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if user is logged in
      const user = localStorage.getItem("user")
      if (!user) {
        alert("Please log in to post an opportunity.")
        return
      }

      const formDataObj = new FormData(e.currentTarget)
      
      // Add requirements array to form data
      const validRequirements = requirements.filter(req => req.trim() !== "")
      formDataObj.append("requirements", JSON.stringify(validRequirements))
      
      // Add user ID from localStorage
      const userData = JSON.parse(user)
      formDataObj.append("userId", userData.id)
      
      // Add tab category
      formDataObj.append("tabCategory", selectedTab)
      
      // Debug logging
      console.log("Form submission details:")
      console.log("- Selected tab:", selectedTab)
      console.log("- User ID:", userData.id)
      console.log("- Requirements:", validRequirements)
      console.log("- Form data entries:")
      for (let [key, value] of formDataObj.entries()) {
        console.log(`  ${key}: ${value}`)
      }

      console.log("Creating opportunity with user:", userData.id)
      const result = await createOpportunityAction(formDataObj)
      
      if (result.success) {
        // Reset form after successful submission
        resetForm()
        alert("Opportunity created successfully!")
        router.push(`/opportunities/${result.opportunity.id}`)
      } else {
        alert(result.error || "Failed to create opportunity. Please try again.")
      }
    } catch (error) {
      console.error("Error creating opportunity:", error)
      
      // Show more specific error message
      if (error instanceof Error) {
        alert(`Error: ${error.message}`)
      } else {
        alert("Failed to create opportunity. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Post an Opportunity</h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect drone professional for your project
          </p>
        </div>

        <Tabs value={activeFormTab} onValueChange={setActiveFormTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="form">Application Form</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab Selection - Main Opportunity Category */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">What type of opportunity are you posting? *</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedTab === "job" ? "default" : "outline"}
                    onClick={() => setSelectedTab("job")}
                    className="w-full h-12"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Jobs</div>
                      <div className="text-xs text-muted-foreground">Full-time & Part-time</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTab === "gig" ? "default" : "outline"}
                    onClick={() => setSelectedTab("gig")}
                    className="w-full h-12"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Gigs</div>
                      <div className="text-xs text-muted-foreground">Freelance & Projects</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTab === "other" ? "default" : "outline"}
                    onClick={() => setSelectedTab("other")}
                    className="w-full h-12"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Other</div>
                      <div className="text-xs text-muted-foreground">Internships & Training</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Opportunity Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Drone Pilot for Agricultural Mapping"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., AgriTech Solutions Rwanda"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opportunity Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opportunityType">Employment Type *</Label>
                  <Select name="opportunityType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Conservation">Conservation</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Kigali, Musanze"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary (Optional)</Label>
                <Input
                  id="salary"
                  name="salary"
                  placeholder="e.g., 800,000 - 1,200,000 RWF or Competitive"
                />
              </div>

              <div className="space-y-4">
                <Label>Requirements</Label>
                <div className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRequirement}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="isUrgent" name="isUrgent" value="true" />
                  <Label htmlFor="isUrgent">Mark as Urgent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isRemote" name="isRemote" value="true" />
                  <Label htmlFor="isRemote">Remote Work Available</Label>
                </div>
              </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {loading ? "Creating..." : "Post Opportunity"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="form">
            <AdvancedFormBuilder
              opportunityId="new"
              onSave={handleFormBuilderSave}
              initialForm={applicationForm}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 