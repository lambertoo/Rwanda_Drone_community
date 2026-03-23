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
  matrixRows?: string[]
  matrixColumns?: string[]
  matrixType?: 'single' | 'multiple'
  scaleStart?: number
  scaleEnd?: number
  scaleStep?: number
  leftLabel?: string
  centerLabel?: string
  rightLabel?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
    allowedFileTypes?: string[]
    maxFileSize?: number
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
  conditional?: {
    dependsOn: string
    operator: string
    value: string
  }
}

export interface FormSettings {
  theme?: 'default' | 'dark' | 'light'
  confirmationMessage?: string
  redirectUrl?: string
  allowMultipleSubmissions?: boolean
  collectEmail?: boolean
  showProgressBar?: boolean
  submitButtonText?: string
  closedMessage?: string
  primaryColor?: string
  coverImage?: string
  closeDate?: string
  maxResponses?: number | null
}

interface FormRendererProps {
  formData: {
    id?: string
    title: string
    description: string
    sections: FormSection[]
    settings: FormSettings
    isClosed?: boolean
    closedReason?: string
  }
  onSubmit: (data: any) => Promise<void>
}

const FIELD_ICONS = {
  SHORT_TEXT: Type,
  LONG_TEXT: FileText,
  MULTIPLE_CHOICE: ChevronRight,
  CHECKBOXES: ChevronRight,
  DROPDOWN: ChevronRight,
  NUMBER: Hash,
  EMAIL: Mail,
  PHONE: Phone,
  URL: Link,
  FILE_UPLOAD: Upload,
  DATE: Calendar,
  TIME: Calendar,
  LINEAR_SCALE: Hash,
  MATRIX: ChevronRight,
  RATING: Hash,
}

export default function FormRenderer({ formData, onSubmit }: FormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, any>>(() => {
    // Prefill from URL params
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const prefilled: Record<string, any> = {}
      params.forEach((value, key) => { prefilled[key] = value })
      return prefilled
    }
    return {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

  // Add error handling for missing or invalid formData
  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Form Not Found</h2>
          <p className="text-muted-foreground">The form data is not available.</p>
        </div>
      </div>
    )
  }

  const { title, description, sections, settings = {} } = formData
  
  // Add null checks for sections
  if (!sections || !Array.isArray(sections)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Invalid Form</h2>
          <p className="text-muted-foreground">The form structure is invalid.</p>
        </div>
      </div>
    )
  }

  // Conditional logic helpers
  const evaluateCondition = (fieldValue: any, operator: string, condValue: string): boolean => {
    const v = Array.isArray(fieldValue) ? fieldValue.join(', ') : String(fieldValue ?? '')
    switch (operator) {
      case 'equals': return v === condValue
      case 'not_equals': return v !== condValue
      case 'contains': return v.toLowerCase().includes(condValue.toLowerCase())
      case 'not_contains': return !v.toLowerCase().includes(condValue.toLowerCase())
      case 'is_empty': return !fieldValue || v === ''
      case 'is_not_empty': return !!(fieldValue && v !== '')
      default: return true
    }
  }

  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional?.dependsOn) return true
    const { dependsOn, operator, value } = field.conditional
    return evaluateCondition(formValues[dependsOn], operator, value)
  }

  const isSectionVisible = (section: FormSection): boolean => {
    if (!section.conditional?.dependsOn) return true
    const { dependsOn, operator, value } = section.conditional
    return evaluateCondition(formValues[dependsOn], operator, value)
  }

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0))
  const visibleSections = sortedSections.filter(isSectionVisible)
  const currentSection = visibleSections[Math.min(currentStep, visibleSections.length - 1)]
  const totalSteps = visibleSections.length

  // Add error handling for currentSection
  if (!currentSection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Form Error</h2>
          <p className="text-muted-foreground">Unable to load the current form section.</p>
        </div>
      </div>
    )
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
    
    // Real-time validation
    const field = currentSection.fields?.find((f: FormField) => f.name === fieldName)
    if (field) {
      const error = validateField(field)
      setErrors(prev => {
        const newErrors = { ...prev }
        if (error) {
          newErrors[fieldName] = error
        } else {
        delete newErrors[fieldName]
        }
        return newErrors
      })
    }
  }

  const validateField = (field: FormField): string | null => {
    const value = formValues[field.name]
    
    // Check required field validation
    if (field.required) {
      if (!value || 
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
      return `${field.label} is required`
      }
    }

    // Only validate non-empty values
    if (value && value !== '') {
      // Email validation
      if (field.type === 'EMAIL' && typeof value === 'string') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address'
        }
      }

      // URL validation
      if (field.type === 'URL' && typeof value === 'string') {
        // More flexible URL validation that accepts:
        // - http:// and https:// protocols
        // - localhost and IP addresses (with or without ports)
        // - subdomains (www.example.com, api.example.com, etc.)
        // - paths, query parameters, and fragments
        try {
          const url = new URL(value)
          if (!['http:', 'https:'].includes(url.protocol)) {
            return 'Please enter a valid URL (must start with http:// or https://)'
          }
        } catch {
          return 'Please enter a valid URL (e.g., https://www.example.com, http://localhost:3000)'
        }
      }

      // Number validation
      if (field.type === 'NUMBER' && typeof value === 'string') {
        if (isNaN(Number(value)) || value.trim() === '') {
          return 'Please enter a valid number'
        }
      }

      // Phone validation
      if (field.type === 'PHONE' && typeof value === 'string') {
        if (!/^\+[1-9]\d{1,14}$/.test(value.replace(/[\s-]/g, ''))) {
          return 'Please enter a valid phone number with country code (e.g., +250788123456)'
        }
      }

      // Custom validation rules
      if (field.validation) {
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
    }

    return null
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (currentSection.fields && Array.isArray(currentSection.fields)) {
      currentSection.fields.filter(isFieldVisible).forEach((field: FormField) => {
        const error = validateField(field)
        if (error) {
          newErrors[field.name] = error
          isValid = false
        }
      })
    }

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
            <FieldIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">{field.label}</h3>
          </div>
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
          <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
        )}


        {field.type === 'SHORT_TEXT' && (
          <Input
            id={field.name}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'LONG_TEXT' && (
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
            onBlur={(e) => {
              // Validate email format on blur
              const email = e.target.value
              if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                const currentField = currentSection.fields.find((f: FormField) => f.name === field.name)
                if (currentField) {
                  setErrors(prev => ({
                    ...prev,
                    [currentField.name]: 'Please enter a valid email address'
                  }))
                }
              }
            }}
          />
        )}

        {field.type === 'PHONE' && (
          <Input
            id={field.name}
            type="tel"
            value={value}
            onChange={(e) => {
              // Only allow +, numbers, spaces, and hyphens
              const phoneValue = e.target.value.replace(/[^+\d\s-]/g, '')
              handleInputChange(field.name, phoneValue)
            }}
            placeholder={field.placeholder || '+250 788 123 456'}
            className={error ? 'border-red-500' : ''}
            onBlur={(e) => {
              // Validate phone format on blur
              const phone = e.target.value
              if (phone && !/^\+[1-9]\d{1,14}$/.test(phone.replace(/[\s-]/g, ''))) {
                const currentField = currentSection.fields.find((f: FormField) => f.name === field.name)
                if (currentField) {
                  setErrors(prev => ({
                    ...prev,
                    [currentField.name]: 'Please enter a valid phone number with country code (e.g., +250788123456)'
                  }))
                }
              }
            }}
          />
        )}

        {field.type === 'NUMBER' && (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => {
              // Only allow numbers and decimal point
              const numericValue = e.target.value.replace(/[^0-9.-]/g, '')
              // Prevent multiple decimal points
              const parts = numericValue.split('.')
              const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue
              handleInputChange(field.name, cleanValue)
            }}
            onKeyDown={(e) => {
              // Prevent non-numeric characters except backspace, delete, arrow keys, etc.
              if (!/[0-9.-]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
                e.preventDefault()
              }
            }}
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
            onBlur={(e) => {
              // Validate URL format on blur
              const url = e.target.value
              if (url && !/^https?:\/\/.+/.test(url)) {
                const currentField = currentSection.fields.find((f: FormField) => f.name === field.name)
                if (currentField) {
                  setErrors(prev => ({
                    ...prev,
                    [currentField.name]: 'Please enter a valid URL (must start with http:// or https://)'
                  }))
                }
              }
            }}
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

        {field.type === 'MULTIPLE_CHOICE' && (
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

        {field.type === 'CHECKBOXES' && (
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

        {field.type === 'DROPDOWN' && (
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

        {field.type === 'MULTI_SELECT' && (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-ms-${index}`}
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (checked) {
                      handleInputChange(field.name, [...currentValues, option])
                    } else {
                      handleInputChange(field.name, currentValues.filter((v: string) => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.name}-ms-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )}


        {field.type === 'GPS_COORDINATES' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Latitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="-1.9403"
                value={typeof value === 'object' ? value?.lat || '' : ''}
                onChange={(e) => handleInputChange(field.name, { ...(typeof value === 'object' ? value : {}), lat: e.target.value })}
                className={error ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Longitude</Label>
              <Input
                type="number"
                step="any"
                placeholder="29.8739"
                value={typeof value === 'object' ? value?.lng || '' : ''}
                onChange={(e) => handleInputChange(field.name, { ...(typeof value === 'object' ? value : {}), lng: e.target.value })}
                className={error ? 'border-red-500' : ''}
              />
            </div>
          </div>
        )}

        {field.type === 'NATIONAL_ID' && (
          <div>
            <Input
              id={field.name}
              type="text"
              inputMode="numeric"
              maxLength={16}
              placeholder="1199880012345678"
              value={value}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 16)
                handleInputChange(field.name, digits)
              }}
              className={error ? 'border-red-500' : ''}
            />
            {value && value.length > 0 && value.length !== 16 && (
              <p className="text-xs text-amber-600 mt-1">{value.length}/16 digits</p>
            )}
          </div>
        )}

        {field.type === 'SCORE' && (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={value === option}
                  onChange={() => handleInputChange(field.name, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'CALCULATED' && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic">
            This field is automatically calculated
          </div>
        )}

        {field.type === 'TIME' && (
          <Input
            id={field.name}
            type="time"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        )}

        {field.type === 'LINEAR_SCALE' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{field.leftLabel || field.scaleStart || 0}</span>
              <span>{field.rightLabel || field.scaleEnd || 10}</span>
            </div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: ((field.scaleEnd || 10) - (field.scaleStart || 0)) / (field.scaleStep || 1) + 1 }, (_, i) => {
                const scaleValue = (field.scaleStart || 0) + (i * (field.scaleStep || 1))
                return (
                  <button
                    key={scaleValue}
                    type="button"
                    onClick={() => handleInputChange(field.name, scaleValue)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                      value === scaleValue
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-border hover:border-ring'
                    }`}
                  >
                    {scaleValue}
                  </button>
                )
              })}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Selected: {value !== undefined ? value : 'None'}
            </div>
          </div>
        )}

        {field.type === 'MATRIX' && (
          <div className="space-y-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 text-left font-medium text-foreground"></th>
                    {field.matrixColumns?.map((column, index) => (
                      <th key={index} className="border border-border p-2 text-center font-medium text-foreground">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {field.matrixRows?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/30">
                      <td className="border border-border p-2 font-medium text-foreground">
                        {row}
                      </td>
                      {field.matrixColumns?.map((column, colIndex) => {
                        const currentValues = formValues[field.name] || {}
                        const rowValues = currentValues[rowIndex] || []
                        const isChecked = field.matrixType === 'single' 
                          ? currentValues[rowIndex] === column
                          : rowValues.includes(column)
                        
                        return (
                          <td key={colIndex} className="border border-border p-2 text-center">
                            {field.matrixType === 'single' ? (
                              <input
                                type="radio"
                                name={`${field.name}_${rowIndex}`}
                                value={column}
                                checked={isChecked}
                                onChange={(e) => {
                                  const newValues = { ...currentValues, [rowIndex]: e.target.checked ? column : null }
                                  handleInputChange(field.name, newValues)
                                }}
                                className="w-4 h-4"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                name={`${field.name}_${rowIndex}_${colIndex}`}
                                value={column}
                                checked={isChecked}
                                onChange={(e) => {
                                  let newRowValues
                                  if (e.target.checked) {
                                    newRowValues = [...rowValues, column]
                                  } else {
                                    newRowValues = rowValues.filter((val: string) => val !== column)
                                  }
                                  const newValues = { ...currentValues, [rowIndex]: newRowValues }
                                  handleInputChange(field.name, newValues)
                                }}
                                className="w-4 h-4"
                              />
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {field.type === 'RATING' && (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange(field.name, star)}
                  className={`text-2xl ${
                    star <= (value || 0) ? 'text-yellow-400' : 'text-muted-foreground'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Rating: {value || 0}/5
            </div>
          </div>
        )}

        {field.type === 'FILE_UPLOAD' && (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-ring transition-colors">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <input
              type="file"
              className="hidden"
              id={field.name}
              multiple={false}
              accept={field.validation?.allowedFileTypes ? field.validation.allowedFileTypes.map((type: string) => `.${type}`).join(',') : '*'}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Check if there's already a file uploaded for this field
                  if (value?.uploaded) {
                    const replace = confirm(`A file "${value.name}" is already uploaded. Do you want to replace it?`)
                    if (!replace) {
                      // Clear the file input and return
                      e.target.value = ''
                      return
                    }
                  }
                  
                  // Check file type if specified
                  if (field.validation?.allowedFileTypes) {
                    const fileExtension = file.name.split('.').pop()?.toLowerCase()
                    if (fileExtension && !field.validation.allowedFileTypes.includes(fileExtension)) {
                      alert(`Invalid file type. Allowed: ${field.validation.allowedFileTypes.join(', ')}`)
                      e.target.value = ''
                      return
                    }
                  }
                  
                  // Check file size
                  const maxSize = field.validation?.maxFileSize || 10 * 1024 * 1024
                  if (file.size > maxSize) {
                    alert(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`)
                    e.target.value = ''
                    return
                  }
                  
                  // Set uploading state
                  setUploadingFiles(prev => new Set(prev).add(field.name))
                  
                  try {
                    // Upload file with form-specific folder structure
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)
                    uploadFormData.append('type', 'forms')
                    uploadFormData.append('entityId', formData.id || 'unknown') // Use form ID for folder structure
                    uploadFormData.append('subfolder', 'files')
                    
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData
                    })
                    
                    if (response.ok) {
                      const result = await response.json()
                      // Store the uploaded file info (replaces any existing file)
                      handleInputChange(field.name, {
                        name: result.originalName,
                        size: result.size,
                        type: result.type,
                        url: result.fileUrl,
                        uploaded: true
                      })
                    } else {
                      const error = await response.json()
                      alert(`Upload failed: ${error.error}`)
                      // Clear the file input
                      e.target.value = ''
                    }
                  } catch (error) {
                    console.error('Upload error:', error)
                    alert('Failed to upload file')
                    // Clear the file input
                    e.target.value = ''
                  } finally {
                    // Remove uploading state
                    setUploadingFiles(prev => {
                      const newSet = new Set(prev)
                      newSet.delete(field.name)
                      return newSet
                    })
                  }
                }
              }}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              disabled={uploadingFiles.has(field.name)}
              onClick={() => document.getElementById(field.name)?.click()}
            >
              {uploadingFiles.has(field.name) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                  Uploading...
                </>
              ) : value?.name ? (
                `Selected: ${value.name}`
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>
            {value?.name && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  {value.name} ({(value.size / 1024).toFixed(1)} KB)
                  {value.uploaded && (
                    <span className="text-green-600 ml-2">✓ Uploaded</span>
                  )}
                  {value.error && (
                    <span className="text-red-600 ml-2">✗ {value.error}</span>
                  )}
                </p>
                {value.uploaded && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                    onClick={() => {
                      // Clear the file
                      handleInputChange(field.name, null)
                      // Clear the file input
                      const fileInput = document.getElementById(field.name) as HTMLInputElement
                      if (fileInput) {
                        fileInput.value = ''
                      }
                    }}
                  >
                    Remove File
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }

  const accentColor = settings?.primaryColor || '#2563eb'
  const { isClosed, closedReason } = formData as any

  // Closed form
  if (isClosed) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Form Closed</h2>
          <p className="text-muted-foreground">{closedReason || settings?.closedMessage || 'This form is no longer accepting responses.'}</p>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-2xl border shadow-sm p-8 text-center animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: accentColor + '15' }}>
            <CheckCircle className="w-8 h-8" style={{ color: accentColor }} />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Thank you!</h2>
          <p className="text-muted-foreground mb-6">{settings?.confirmationMessage || 'Your response has been recorded.'}</p>
          {settings?.redirectUrl && (
            <Button asChild className="w-full" style={{ backgroundColor: accentColor }}>
              <a href={settings.redirectUrl}>Continue</a>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Cover Image */}
      {settings?.coverImage && (
        <div className="h-48 w-full overflow-hidden">
          <img src={settings.coverImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Progress Bar */}
      {settings?.showProgressBar !== false && totalSteps > 1 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        {/* Section */}
        <div className="bg-background rounded-2xl border shadow-sm p-6 md:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {totalSteps > 1 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold">{currentSection.title}</h2>
              {currentSection.description && <p className="text-sm text-muted-foreground mt-1">{currentSection.description}</p>}
            </div>
          )}

          <div className="space-y-6">
            {currentSection.fields && Array.isArray(currentSection.fields)
              ? currentSection.fields
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .filter(isFieldVisible)
                  .map((field) => (
                    <div key={field.id} className="animate-in fade-in-0 duration-200">
                      {renderField(field)}
                    </div>
                  ))
              : <div className="text-center text-muted-foreground py-4">No fields in this section</div>
            }
          </div>
        </div>

        {/* Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 mt-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Please fix the following:</p>
            <ul className="text-sm text-red-700 dark:text-red-400/80 space-y-0.5">
              {Object.entries(errors).map(([fieldName, error]) => (
                <li key={fieldName}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={handlePrevious} className="flex items-center gap-1.5">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : <div />}

          {currentStep === totalSteps - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 text-white"
              style={{ backgroundColor: accentColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                settings?.submitButtonText || 'Submit'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 text-white"
              style={{ backgroundColor: accentColor }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
