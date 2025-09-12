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
import TallyCloneBuilder from "@/components/forms/tally-clone-builder"
import { useOpportunityCategories } from "@/hooks/use-opportunity-categories"
import { useEmploymentTypes } from "@/hooks/use-employment-types"

export default function NewOpportunityForm() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("job")
  const { categories, loading: categoriesLoading } = useOpportunityCategories()
  const { employmentTypes, loading: employmentTypesLoading } = useEmploymentTypes(selectedTab)
  const [loading, setLoading] = useState(false)
  const [requirements, setRequirements] = useState<string[]>([""])
  const [showRegistrationFormBuilder, setShowRegistrationFormBuilder] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({
    title: "Application Form",
    description: "Please fill out this form to apply for this opportunity",
    sections: [
      {
        id: 'section_1',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        fields: [
          {
            id: 'field_1',
            type: 'SHORT_TEXT',
            label: 'Full Name',
            name: 'full_name',
            placeholder: 'Enter your full name',
            required: true,
            validation: { required: true },
            order: 1
          },
          {
            id: 'field_2',
            type: 'EMAIL',
            label: 'Email Address',
            name: 'email',
            placeholder: 'Enter your email address',
            required: true,
            validation: { required: true },
            order: 2
          },
          {
            id: 'field_3',
            type: 'PHONE',
            label: 'Phone Number',
            name: 'phone',
            placeholder: 'Enter your phone number',
            required: false,
            validation: { required: false },
            order: 3
          }
        ]
      }
    ]
  })
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    opportunityType: "",
    employmentTypeId: "",
    categoryId: "",
    location: "",
    salary: "",
    isUrgent: false,
    isRemote: false,
    applicationDeadline: ""
  })

  // Reset employment type and category when tab changes
  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    setFormData(prev => ({
      ...prev,
      opportunityType: "",
      employmentTypeId: "",
      categoryId: ""
    }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      description: "",
      opportunityType: "",
      employmentTypeId: "",
      categoryId: "",
      location: "",
      salary: "",
      isUrgent: false,
      isRemote: false,
      applicationDeadline: ""
    })
    setRequirements([""])
    setSelectedTab("job")
    setShowRegistrationFormBuilder(false)
    setRegistrationForm({
      title: "Application Form",
      description: "Please fill out this form to apply for this opportunity",
      sections: [
        {
          id: 'section_1',
          title: 'Personal Information',
          description: 'Tell us about yourself',
          fields: [
            {
              id: 'field_1',
              type: 'SHORT_TEXT',
              label: 'Full Name',
              name: 'full_name',
              placeholder: 'Enter your full name',
              required: true,
              validation: { required: true },
              order: 1
            },
            {
              id: 'field_2',
              type: 'EMAIL',
              label: 'Email Address',
              name: 'email',
              placeholder: 'Enter your email address',
              required: true,
              validation: { required: true },
              order: 2
            },
            {
              id: 'field_3',
              type: 'PHONE',
              label: 'Phone Number',
              name: 'phone',
              placeholder: 'Enter your phone number',
              required: false,
              validation: { required: false },
              order: 3
            }
          ]
        }
      ]
    })
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
      
      // Add allowApplication flag - always true for opportunities that accept applications
      formDataObj.append("allowApplication", "true")
      
      // Add employment type and category IDs
      formDataObj.append("employmentTypeId", formData.employmentTypeId)
      formDataObj.append("categoryId", formData.categoryId)
      
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
        // Create application form if one was built
        let applicationFormId = null
        if (showRegistrationFormBuilder && registrationForm) {
          try {
            console.log('Creating application form with data:', registrationForm)
            
            const formResponse = await fetch('/api/forms', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(registrationForm)
            })

            if (formResponse.ok) {
              const formResult = await formResponse.json()
              console.log('Application form created successfully:', formResult)
              applicationFormId = formResult.id
              
              // Update the opportunity with the form ID
              await fetch(`/api/opportunities/${result.opportunity.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                  applicationFormId: applicationFormId
                })
              })
            } else {
              const errorData = await formResponse.json()
              console.error('Failed to create application form:', errorData)
            }
          } catch (error) {
            console.error('Error creating application form:', error)
          }
        }

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
                    onClick={() => handleTabChange("job")}
                    className="w-full h-12"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Jobs</div>
                      <div className="text-xs text-muted-foreground">Permanent & Career Positions</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTab === "gig" ? "default" : "outline"}
                    onClick={() => handleTabChange("gig")}
                    className="w-full h-12"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Gigs</div>
                      <div className="text-xs text-muted-foreground">Short-term & Freelance Work</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTab === "other" ? "default" : "outline"}
                    onClick={() => handleTabChange("other")}
                    className="w-full h-12"
                  >
                    <div className="text-center">
                      <div className="font-semibold">Other</div>
                      <div className="text-xs text-muted-foreground">Internships & Training Programs</div>
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
                  <Label htmlFor="employmentTypeId">Employment Type *</Label>
                  <Select 
                    name="employmentTypeId" 
                    required 
                    disabled={employmentTypesLoading}
                    value={formData.employmentTypeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employmentTypeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={employmentTypesLoading ? "Loading employment types..." : "Select employment type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((employmentType) => (
                        <SelectItem key={employmentType.id} value={employmentType.id}>
                          <div className="flex items-center gap-2">
                            <span>{employmentType.icon}</span>
                            <span>{employmentType.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select 
                    name="categoryId" 
                    required 
                    disabled={categoriesLoading}
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
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

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline (Optional)</Label>
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="datetime-local"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty if there's no deadline for applications
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Application Form</Label>
                  <p className="text-sm text-muted-foreground">
                    Create a custom application form for this opportunity. This form will be used by applicants to submit their applications.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={showRegistrationFormBuilder ? "default" : "outline"}
                      onClick={() => setShowRegistrationFormBuilder(!showRegistrationFormBuilder)}
                      className="w-fit"
                    >
                      {showRegistrationFormBuilder ? "Hide Form Builder" : "Create Custom Form"}
                    </Button>
                  </div>
                </div>
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

              {showRegistrationFormBuilder && (
                <div className="border rounded-lg p-4">
                  <TallyCloneBuilder
                    initialData={registrationForm}
                    onSave={(formData) => setRegistrationForm(formData)}
                    onCancel={() => setShowRegistrationFormBuilder(false)}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Opportunity...
                    </>
                  ) : (
                    "Create Opportunity"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 