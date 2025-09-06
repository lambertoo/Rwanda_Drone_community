"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  name: string
  placeholder?: string
  options?: any[]
  validation?: any
  order: number
  conditional?: any
  isActive: boolean
}

interface FormSection {
  id: string
  title: string
  description?: string
  order: number
  conditional?: any
  isActive: boolean
  fields: FormField[]
}

interface Form {
  id: string
  title: string
  description?: string
  slug: string
  settings?: any
  isActive: boolean
  isPublic: boolean
  sections: FormSection[]
  user: {
    id: string
    username: string
    fullName: string
  }
}

export default function FormPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.formId as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}?public=true`)
      if (!response.ok) {
        throw new Error('Form not found')
      }
      const data = await response.json()
      setForm(data)
    } catch (error) {
      console.error('Error fetching form:', error)
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const validateCurrentSection = () => {
    if (!form) return false
    
    const currentSection = form.sections[currentStep]
    const requiredFields = currentSection.fields.filter(field => 
      field.validation?.required && field.isActive
    )

    for (const field of requiredFields) {
      if (!formValues[field.name] || formValues[field.name].toString().trim() === '') {
        toast({
          title: "Validation Error",
          description: `${field.label} is required`,
          variant: "destructive"
        })
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentStep(prev => Math.min(prev + 1, form!.sections.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateCurrentSection()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: formValues })
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      toast({
        title: "Success",
        description: "Form submitted successfully!",
      })
      
      // Redirect to thank you page or clear form
      router.push('/forms/thank-you')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formValues[field.name] || ''

    switch (field.type) {
      case 'TEXT':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
      
      case 'TEXTAREA':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        )
      
      case 'EMAIL':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
      
      case 'PHONE':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
      
      case 'NUMBER':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
      
      case 'SELECT':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any, index: number) => (
                <SelectItem key={index} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'RADIO':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.name, val)}>
            {field.options?.map((option: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value || option} id={`${field.name}_${index}`} />
                <Label htmlFor={`${field.name}_${index}`}>{option.label || option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options?.map((option: any, index: number) => {
              const optionValue = option.value || option
              const isChecked = Array.isArray(value) ? value.includes(optionValue) : false
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}_${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValue = Array.isArray(value) ? value : []
                      if (checked) {
                        handleFieldChange(field.name, [...currentValue, optionValue])
                      } else {
                        handleFieldChange(field.name, currentValue.filter((v: any) => v !== optionValue))
                      }
                    }}
                  />
                  <Label htmlFor={`${field.name}_${index}`}>{option.label || option}</Label>
                </div>
              )
            })}
          </div>
        )
      
      case 'DATE':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        )
      
      case 'FILE':
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFieldChange(field.name, file.name)
              }
            }}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Form not found</h1>
            <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or is no longer available.</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentSection = form.sections[currentStep]
  const isLastStep = currentStep === form.sections.length - 1

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
          
          {/* Progress bar */}
          {form.sections.length > 1 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep + 1} of {form.sections.length}</span>
                <span>{Math.round(((currentStep + 1) / form.sections.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / form.sections.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Current Section */}
        <Card>
          <CardHeader>
            <CardTitle>{currentSection.title}</CardTitle>
            {currentSection.description && (
              <p className="text-gray-600">{currentSection.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentSection.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="text-sm font-medium">
                  {field.label}
                  {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}