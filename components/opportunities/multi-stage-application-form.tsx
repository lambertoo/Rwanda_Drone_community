"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"

interface FormField {
  id: string
  label: string
  type: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: any
  order: number
  stage?: number
  conditions?: {
    fieldId: string
    operator: string
    value: string
  }[]
}

interface ApplicationForm {
  id: string
  title: string
  description?: string
  fields: FormField[]
  stages?: {
    id: string
    title: string
    description?: string
    fields: string[]
  }[]
}

interface MultiStageApplicationFormProps {
  form: ApplicationForm
  onSubmit: (submission: { formId: string; fieldSubmissions: { fieldId: string; value: string }[] }) => void
  isSubmitting: boolean
}

export default function MultiStageApplicationForm({ form, onSubmit, isSubmitting }: MultiStageApplicationFormProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set())

  // Group fields by stages
  const stages = form.stages || [{
    id: 'default',
    title: 'Application Form',
    description: form.description,
    fields: form.fields.map(f => f.id)
  }]

  const getFieldsForStage = (stageIndex: number) => {
    const stage = stages[stageIndex]
    if (!stage) return []
    
    return form.fields
      .filter(field => stage.fields.includes(field.id))
      .sort((a, b) => a.order - b.order)
  }

  const currentFields = getFieldsForStage(currentStage)
  const totalStages = stages.length
  const progress = ((currentStage + 1) / totalStages) * 100

  // Check if current stage is complete
  const isStageComplete = () => {
    return currentFields.every(field => {
      if (!field.required) return true
      const value = formData[field.id]
      return value && value.trim() !== ''
    })
  }

  // Check field conditions
  const shouldShowField = (field: FormField) => {
    if (!field.conditions || field.conditions.length === 0) return true

    return field.conditions.every(condition => {
      const fieldValue = formData[condition.fieldId]
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'not_equals':
          return fieldValue !== condition.value
        case 'contains':
          return fieldValue && fieldValue.includes(condition.value)
        case 'not_contains':
          return !fieldValue || !fieldValue.includes(condition.value)
        default:
          return true
      }
    })
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const validateStage = () => {
    const newErrors: Record<string, string> = {}
    
    currentFields.forEach(field => {
      if (field.required && shouldShowField(field)) {
        const value = formData[field.id]
        if (!value || value.trim() === '') {
          newErrors[field.id] = `${field.label} is required`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStage()) {
      setCompletedStages(prev => new Set([...prev, currentStage]))
      
      if (currentStage < totalStages - 1) {
        setCurrentStage(prev => prev + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    const fieldSubmissions = Object.entries(formData).map(([fieldId, value]) => ({
      fieldId,
      value
    }))

    onSubmit({
      formId: form.id,
      fieldSubmissions
    })
  }

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null

    const value = formData[field.id] || ''

    switch (field.type) {
      case 'TEXT':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'EMAIL':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="email"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'NUMBER':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'TEXTAREA':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : ''}
              rows={4}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'SELECT':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              <SelectTrigger className={errors[field.id] ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'RADIO':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'CHECKBOX':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => {
                const isChecked = value.includes(option)
                return (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${option}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = value ? value.split(',') : []
                        if (checked) {
                          const newValues = [...currentValues, option]
                          handleFieldChange(field.id, newValues.join(','))
                        } else {
                          const newValues = currentValues.filter(v => v !== option)
                          handleFieldChange(field.id, newValues.join(','))
                        }
                      }}
                    />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                )
              })}
            </div>
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'FILE':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFieldChange(field.id, file.name)
                }
              }}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      case 'DATE':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={errors[field.id] ? 'border-red-500' : ''}
            />
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Stage {currentStage + 1} of {totalStages}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stage Title */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {completedStages.has(currentStage) && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {stages[currentStage]?.title}
          </CardTitle>
          {stages[currentStage]?.description && (
            <p className="text-muted-foreground">{stages[currentStage].description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Form Fields */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {currentFields.map(renderField)}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStage === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isStageComplete() || isSubmitting}
        >
          {currentStage === totalStages - 1 ? (
            isSubmitting ? 'Submitting...' : 'Submit Application'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
