"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Upload, 
  Calendar,
  Mail,
  Phone,
  Link,
  Lock,
  Hash,
  Globe,
  FileText,
  Type
} from "lucide-react"

export interface FormField {
  id: string
  type: string
  label: string
  name: string
  placeholder?: string
  description?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  conditional?: {
    dependsOn: string
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains'
    value: string
  }
  order: number
}

export interface FormSection {
  id: string
  title: string
  description?: string
  order: number
  fields: FormField[]
}

export interface FormSettings {
  theme: 'default' | 'dark' | 'light'
  confirmationMessage: string
  redirectUrl?: string
  allowMultipleSubmissions: boolean
  collectEmail: boolean
  showProgressBar: boolean
  submitButtonText: string
}

interface TallyPublicRendererProps {
  formData: {
    title: string
    description: string
    sections: FormSection[]
    settings: FormSettings
  }
  onSubmit: (data: any) => Promise<void>
}

const FIELD_ICONS = {
  TEXT: Type,
  TEXTAREA: FileText,
  EMAIL: Mail,
  PHONE: Phone,
  NUMBER: Hash,
  SELECT: ChevronRight,
  RADIO: ChevronRight,
  CHECKBOX: ChevronRight,
  DATE: Calendar,
  FILE: Upload,
  URL: Link,
  PASSWORD: Lock,
  HIDDEN: Lock,
  PARAGRAPH: FileText,
}

export default function TallyPublicRenderer({ formData, onSubmit }: TallyPublicRendererProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { title, description, sections, settings } = formData
  const sortedSections = sections.sort((a, b) => a.order - b.order)
  const currentSection = sortedSections[currentStep]
  const totalSteps = sortedSections.length

  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const validateField = (field: FormField): string | null => {
    const value = formValues[field.name]
    
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`
    }

    if (value && field.validation) {
      if (field.validation.min && typeof value === 'number' && value < field.validation.min) {
        return field.validation.message || `${field.label} must be at least ${field.validation.min}`
      }
      if (field.validation.max && typeof value === 'number' && value > field.validation.max) {
        return field.validation.message || `${field.label} must be at most ${field.validation.max}`
      }
      if (field.validation.pattern && typeof value === 'string') {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(value)) {
          return field.validation.message || `${field.label} format is invalid`
        }
      }
    }

    return null
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    currentSection.fields.forEach(field => {
      const error = validateField(field)
      if (error) {
        newErrors[field.name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      setIsSubmitting(true)
      try {
        await onSubmit(formValues)
        setIsSubmitted(true)
      } catch (error) {
        console.error('Submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const renderField = (field: FormField) => {
    const FieldIcon = FIELD_ICONS[field.type as keyof typeof FIELD_ICONS] || Type
    const value = formValues[field.name] || ''
    const error = errors[field.name]

    if (field.type === 'PARAGRAPH') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FieldIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-lg font-medium">{field.label}</h3>
          </div>
          {field.description && (
            <p className="text-gray-600 text-sm">{field.description}</p>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={field.name} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.description && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}

        {field.type === 'TEXT' && (
          <Input
            id={field.name}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'TEXTAREA' && (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'EMAIL' && (
          <Input
            id={field.name}
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter your email'}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'PHONE' && (
          <Input
            id={field.name}
            type="tel"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter your phone number'}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'NUMBER' && (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'DATE' && (
          <Input
            id={field.name}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'URL' && (
          <Input
            id={field.name}
            type="url"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'https://example.com'}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'PASSWORD' && (
          <Input
            id={field.name}
            type="password"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'SELECT' && (
          <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === 'RADIO' && (
          <RadioGroup value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.name}-${index}`} />
                <Label htmlFor={`${field.name}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {field.type === 'CHECKBOX' && (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${index}`}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (checked) {
                      handleInputChange(field.name, [...currentValues, option])
                    } else {
                      handleInputChange(field.name, currentValues.filter(v => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.name}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}

        {field.type === 'FILE' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <input
              type="file"
              className="hidden"
              id={field.name}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleInputChange(field.name, file)
                }
              }}
            />
            <Label htmlFor={field.name} className="cursor-pointer">
              <Button variant="outline" size="sm" className="mt-2">
                Choose File
              </Button>
            </Label>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Form Submitted!</h2>
              <p className="text-gray-600 mb-6">{settings.confirmationMessage}</p>
              {settings.redirectUrl && (
                <Button asChild className="w-full">
                  <a href={settings.redirectUrl}>Continue</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {settings.showProgressBar && totalSteps > 1 && (
        <div className="bg-white border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentSection.title}</CardTitle>
            {currentSection.description && (
              <p className="text-gray-600">{currentSection.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSection.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <div key={field.id}>
                  {renderField(field)}
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === totalSteps - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  {settings.submitButtonText}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
