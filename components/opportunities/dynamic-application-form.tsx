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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FormField {
  id: string
  label: string
  type: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: any
  conditions: FormCondition[]
}

interface FormCondition {
  id: string
  targetFieldId: string
  operator: string
  value: string
  action: string
}

interface ApplicationFormProps {
  form: {
    id: string
    title: string
    description?: string
    fields: FormField[]
  }
  onSubmit: (submission: { formId: string; fieldSubmissions: { fieldId: string; value: string }[] }) => void
  isSubmitting?: boolean
}

export default function DynamicApplicationForm({ form, onSubmit, isSubmitting = false }: ApplicationFormProps) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({})
  const [visibleFields, setVisibleFields] = useState<{ [key: string]: boolean }>({})
  const [requiredFields, setRequiredFields] = useState<{ [key: string]: boolean }>({})

  // Initialize form state
  useEffect(() => {
    const initialData: { [key: string]: any } = {}
    const initialVisible: { [key: string]: boolean } = {}
    const initialRequired: { [key: string]: boolean } = {}

    form.fields.forEach(field => {
      initialData[field.id] = field.type === 'CHECKBOX' ? [] : ''
      initialVisible[field.id] = true
      initialRequired[field.id] = field.required
    })

    setFormData(initialData)
    setVisibleFields(initialVisible)
    setRequiredFields(initialRequired)
  }, [form.fields])

  // Apply conditional logic when form data changes
  useEffect(() => {
    const newVisible = { ...visibleFields }
    const newRequired = { ...requiredFields }

    form.fields.forEach(field => {
      field.conditions.forEach(condition => {
        const targetValue = formData[condition.targetFieldId]
        let shouldApply = false

        switch (condition.operator) {
          case 'EQUALS':
            shouldApply = targetValue === condition.value
            break
          case 'NOT_EQUALS':
            shouldApply = targetValue !== condition.value
            break
          case 'CONTAINS':
            shouldApply = String(targetValue).includes(condition.value)
            break
          case 'NOT_CONTAINS':
            shouldApply = !String(targetValue).includes(condition.value)
            break
          case 'IS_EMPTY':
            shouldApply = !targetValue || targetValue === ''
            break
          case 'IS_NOT_EMPTY':
            shouldApply = targetValue && targetValue !== ''
            break
        }

        if (shouldApply) {
          switch (condition.action) {
            case 'SHOW':
              newVisible[field.id] = true
              break
            case 'HIDE':
              newVisible[field.id] = false
              break
            case 'REQUIRE':
              newRequired[field.id] = true
              break
            case 'MAKE_OPTIONAL':
              newRequired[field.id] = false
              break
          }
        }
      })
    })

    setVisibleFields(newVisible)
    setRequiredFields(newRequired)
  }, [formData, form.fields])

  const updateFieldValue = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const errors: string[] = []
    form.fields.forEach(field => {
      if (requiredFields[field.id] && visibleFields[field.id]) {
        const value = formData[field.id]
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
          errors.push(`${field.label} is required`)
        }
      }
    })

    if (errors.length > 0) {
      alert('Please fill in all required fields:\n' + errors.join('\n'))
      return
    }

    // Prepare submission data
    const fieldSubmissions = form.fields
      .filter(field => visibleFields[field.id])
      .map(field => ({
        fieldId: field.id,
        value: Array.isArray(formData[field.id]) 
          ? formData[field.id].join(', ')
          : String(formData[field.id])
      }))

    onSubmit({
      formId: form.id,
      fieldSubmissions
    })
  }

  const renderField = (field: FormField) => {
    if (!visibleFields[field.id]) return null

    const commonProps = {
      id: field.id,
      required: requiredFields[field.id],
      placeholder: field.placeholder,
      value: formData[field.id] || '',
      onChange: (e: any) => updateFieldValue(field.id, e.target.value)
    }

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <Input
            {...commonProps}
            type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
          />
        )

      case 'NUMBER':
        return (
          <Input
            {...commonProps}
            type="number"
            onChange={(e) => updateFieldValue(field.id, parseFloat(e.target.value) || '')}
          />
        )

      case 'TEXTAREA':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
          />
        )

      case 'SELECT':
        return (
          <Select value={formData[field.id] || ''} onValueChange={(value) => updateFieldValue(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'RADIO':
        return (
          <RadioGroup value={formData[field.id] || ''} onValueChange={(value) => updateFieldValue(field.id, value)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}_${index}`} />
                <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}_${index}`}
                  checked={formData[field.id]?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData[field.id] || []
                    if (checked) {
                      updateFieldValue(field.id, [...currentValues, option])
                    } else {
                      updateFieldValue(field.id, currentValues.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'DATE':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData[field.id] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData[field.id] ? format(formData[field.id], "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData[field.id] ? new Date(formData[field.id]) : undefined}
                onSelect={(date) => updateFieldValue(field.id, date?.toISOString() || '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case 'FILE':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  updateFieldValue(field.id, file.name)
                }
              }}
            />
            {formData[field.id] && (
              <p className="text-sm text-muted-foreground">Selected: {formData[field.id]}</p>
            )}
          </div>
        )

      case 'PARAGRAPH':
        return (
          <div className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-md">
            {field.label}
          </div>
        )

      default:
        return <Input {...commonProps} />
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {form.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {requiredFields[field.id] && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  )
} 