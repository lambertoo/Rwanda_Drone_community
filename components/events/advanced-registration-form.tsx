"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Settings, Eye, EyeOff, ArrowRight, Zap } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date' | 'file'
  required: boolean
  placeholder?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  conditionalLogic?: {
    showWhen: string | null
    operator: string | null
    value: string | null
    action: 'show' | 'hide' | 'require' | 'jump_to'
  }
}

interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  conditionalRules: ConditionalRule[]
}

interface ConditionalRule {
  id: string
  when: {
    fieldId: string
    operator: 'is' | 'is_not' | 'contains' | 'does_not_contain' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than'
    value: string
  }
  then: {
    action: 'show' | 'hide' | 'require' | 'jump_to' | 'calculate'
    target: string
    value?: string
  }
}

interface AdvancedRegistrationFormProps {
  eventId: string
  fields: FormField[]
  onComplete: (data: Record<string, any>) => void
}

export default function AdvancedRegistrationForm({ eventId, fields, onComplete }: AdvancedRegistrationFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [sections, setSections] = useState<FormSection[]>([])
  const [isFormBuilder, setIsFormBuilder] = useState(false)
  const [newField, setNewField] = useState<Partial<FormField>>({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: [],
    conditionalLogic: {
      showWhen: null,
      operator: null,
      value: null,
      action: 'show'
    }
  })
  const [showAddField, setShowAddField] = useState(false)
  const [newSection, setNewSection] = useState({
    title: '',
    description: ''
  })
  const [showAddSection, setShowAddSection] = useState(false)
  const [activeSection, setActiveSection] = useState(-1)

  // Initialize sections from fields if provided
  useState(() => {
    if (fields && fields.length > 0) {
      setSections([{
        id: 'default',
        title: 'Registration Information',
        description: 'Please fill out the following information',
        fields: fields,
        conditionalRules: []
      }])
    }
  })

  // Check if field should be required based on conditional rules
  const isFieldRequired = (field: FormField): boolean => {
    const section = sections.find(s => s.fields.some(f => f.id === field.id))
    if (!section) return field.required

    const requireRules = section.conditionalRules.filter(rule => 
      rule.then.action === 'require' && rule.then.target === field.id
    )

    if (requireRules.length === 0) return field.required

    return requireRules.every(rule => {
      const fieldValue = formData[rule.when.fieldId]
      
      switch (rule.when.operator) {
        case 'is': return fieldValue === rule.when.value
        case 'is_not': return fieldValue !== rule.when.value
        case 'is_empty': return !fieldValue || fieldValue === ''
        case 'is_not_empty': return fieldValue && fieldValue !== ''
        case 'contains': return String(fieldValue).includes(String(rule.when.value))
        case 'does_not_contain': return !String(fieldValue).includes(String(rule.when.value))
        case 'greater_than': return Number(fieldValue) > Number(rule.when.value)
        case 'less_than': return Number(fieldValue) < Number(rule.when.value)
        default: return false
      }
    })
  }

  // Check if field should be visible based on conditional rules
  const isFieldVisible = (field: FormField): boolean => {
    const section = sections.find(s => s.fields.some(f => f.id === field.id))
    if (!section) return true

    const hideRules = section.conditionalRules.filter(rule => 
      rule.then.action === 'hide' && rule.then.target === field.id
    )

    if (hideRules.length === 0) return true

    return hideRules.every(rule => {
      const fieldValue = formData[rule.when.fieldId]
      
      switch (rule.when.operator) {
        case 'is': return fieldValue !== rule.when.value // If rule is 'is X', field is visible if value is NOT X
        case 'is_not': return fieldValue === rule.when.value // If rule is 'is_not X', field is visible if value IS X
        case 'is_empty': return fieldValue && fieldValue !== ''
        case 'is_not_empty': return !fieldValue || fieldValue === ''
        case 'contains': return !String(fieldValue).includes(String(rule.when.value))
        case 'does_not_contain': return String(fieldValue).includes(String(rule.when.value))
        case 'greater_than': return Number(fieldValue) <= Number(rule.when.value)
        case 'less_than': return Number(fieldValue) >= Number(rule.when.value)
        default: return true
      }
    })
  }

  // Check if section should be visible
  const isSectionVisible = (section: FormSection): boolean => {
    if (section.conditionalRules.length === 0) return true

    return section.conditionalRules.every(rule => {
      const fieldValue = formData[rule.when.fieldId]
      
      switch (rule.when.operator) {
        case 'is': return fieldValue === rule.when.value
        case 'is_not': return fieldValue !== rule.when.value
        case 'is_empty': return !fieldValue || fieldValue === ''
        case 'is_not_empty': return fieldValue && fieldValue !== ''
        case 'contains': return String(fieldValue).includes(String(rule.when.value))
        case 'does_not_contain': return !String(fieldValue).includes(String(rule.when.value))
        case 'greater_than': return Number(fieldValue) > Number(rule.when.value)
        case 'less_than': return Number(fieldValue) < Number(rule.when.value)
        default: return true
      }
    })
  }

  // Handle conditional actions when field values change
  const handleFieldChange = (fieldId: string, value: any) => {
    updateFieldValue(fieldId, value)
    
    sections.forEach(section => {
      section.conditionalRules.forEach(rule => {
        if (rule.when.fieldId === fieldId) {
          const shouldExecute = (() => {
            const fieldValue = formData[fieldId]
            
            switch (rule.when.operator) {
              case 'is': return fieldValue === rule.when.value
              case 'is_not': return fieldValue !== rule.when.value
              case 'is_empty': return !fieldValue || fieldValue === ''
              case 'is_not_empty': return fieldValue && fieldValue !== ''
              case 'contains': return String(fieldValue).includes(String(rule.when.value))
              case 'does_not_contain': return !String(fieldValue).includes(String(rule.when.value))
              case 'greater_than': return Number(fieldValue) > Number(rule.when.value)
              case 'less_than': return Number(fieldValue) < Number(rule.when.value)
              default: return false
            }
          })()
          
          if (shouldExecute) {
            executeConditionalAction(rule)
          }
        }
      })
    })
  }

  // Execute conditional actions
  const executeConditionalAction = (rule: ConditionalRule) => {
    switch (rule.then.action) {
      case 'jump_to':
        const targetSectionIndex = sections.findIndex(s => s.id === rule.then.target)
        if (targetSectionIndex !== -1) {
          setCurrentSection(targetSectionIndex)
        }
        break
      case 'calculate':
        if (rule.then.target && rule.then.value !== undefined) {
          const calculatedValue = calculateValue(rule.then.value, formData)
          updateFieldValue(rule.then.target, calculatedValue)
        }
        break
    }
  }

  // Calculate values based on form data
  const calculateValue = (calculation: string, data: Record<string, any>): any => {
    if (calculation.includes('sum(')) {
      const fieldIds = calculation.match(/sum\(([^)]+)\)/)?.[1]?.split(',') || []
      return fieldIds.reduce((sum, fieldId) => {
        const value = Number(data[fieldId.trim()]) || 0
        return sum + value
      }, 0)
    }
    
    if (calculation.includes('age(')) {
      const fieldId = calculation.match(/age\(([^)]+)\)/)?.[1]
      if (fieldId && data[fieldId]) {
        const birthDate = new Date(data[fieldId])
        const today = new Date()
        return today.getFullYear() - birthDate.getFullYear()
      }
    }
    
    return calculation
  }

  const updateFieldValue = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const addField = () => {
    if (!newField.label) return

    const field: FormField = {
      id: Date.now().toString(),
      label: newField.label,
      type: newField.type as any,
      required: newField.required || false,
      placeholder: newField.placeholder,
      options: newField.options,
      conditionalLogic: newField.conditionalLogic
    }

    if (activeSection >= 0) {
      const updatedSections = [...sections]
      updatedSections[activeSection].fields.push(field)
      setSections(updatedSections)
    } else {
      setSections(prev => [...prev, {
        id: Date.now().toString(),
        title: 'New Section',
        description: '',
        fields: [field],
        conditionalRules: []
      }])
    }

    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      conditionalLogic: {
        showWhen: null,
        operator: null,
        value: null,
        action: 'show'
      }
    })
    setShowAddField(false)
    setActiveSection(-1)
  }

  const addSection = () => {
    if (!newSection.title) return

    const section: FormSection = {
      id: Date.now().toString(),
      title: newSection.title,
      description: newSection.description,
      fields: [],
      conditionalRules: []
    }

    setSections(prev => [...prev, section])
    setNewSection({ title: '', description: '' })
    setShowAddSection(false)
  }

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].fields.splice(fieldIndex, 1)
    setSections(updatedSections)
  }

  const removeSection = (sectionIndex: number) => {
    const updatedSections = [...sections]
    updatedSections.splice(sectionIndex, 1)
    setSections(updatedSections)
  }

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: isFieldRequired(field),
      onChange: (e: any) => handleFieldChange(field.id, e.target.value)
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <Input {...commonProps} type={field.type} />
      
      case 'textarea':
        return <Textarea {...commonProps} />
      
      case 'select':
        return (
          <Select onValueChange={(value) => handleFieldChange(field.id, value)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'radio':
        return (
          <RadioGroup onValueChange={(value) => handleFieldChange(field.id, value)}>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${field.id}-${index}`}
                  onCheckedChange={(checked) => {
                    const currentValues = formData[field.id] || []
                    const newValues = checked 
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option)
                    handleFieldChange(field.id, newValues)
                  }}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )
      
      case 'date':
        return <Input {...commonProps} type="date" />
      
      case 'file':
        return <Input {...commonProps} type="file" />
      
      default:
        return <Input {...commonProps} />
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  if (isFormBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Form Builder</h3>
          <Button onClick={() => setIsFormBuilder(false)} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Form
          </Button>
        </div>

        {/* Section Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Sections</h4>
            <Button onClick={() => setShowAddSection(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {showAddSection && (
            <Card className="p-4 border-dashed">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sectionTitle">Section Title</Label>
                  <Input
                    id="sectionTitle"
                    value={newSection.title}
                    onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                    placeholder="e.g., Personal Information"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionDescription">Section Description</Label>
                  <Input
                    id="sectionDescription"
                    value={newSection.description}
                    onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addSection} size="sm">Add Section</Button>
                  <Button onClick={() => setShowAddSection(false)} variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {sections.map((section, sectionIndex) => (
            <Card key={section.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setActiveSection(sectionIndex)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                    <Button 
                      onClick={() => removeSection(sectionIndex)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.label}</span>
                          {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                          <Badge variant="outline" className="text-xs">{field.type}</Badge>
                          {field.conditionalLogic && field.conditionalLogic.showWhen && (
                            <Badge variant="destructive" className="text-xs">Conditional</Badge>
                          )}
                        </div>
                        {field.placeholder && (
                          <p className="text-sm text-muted-foreground">{field.placeholder}</p>
                        )}
                      </div>
                      <Button 
                        onClick={() => removeField(sectionIndex, fieldIndex)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {section.fields.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No fields in this section yet. Click "Add Field" to get started.
                    </p>
                  )}
                </div>

                {activeSection === sectionIndex && (
                  <Card className="mt-4 p-4 border-dashed">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fieldLabel">Field Label</Label>
                          <Input
                            id="fieldLabel"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            placeholder="e.g., Company Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fieldType">Field Type</Label>
                          <Select 
                            value={newField.type} 
                            onValueChange={(value: any) => setNewField({ ...newField, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="textarea">Text Area</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="radio">Radio Buttons</SelectItem>
                              <SelectItem value="file">File Upload</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                          <Input
                            id="fieldPlaceholder"
                            value={newField.placeholder}
                            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                            placeholder="Optional placeholder text"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fieldRequired"
                            checked={newField.required}
                            onCheckedChange={(checked) => setNewField({ ...newField, required: !!checked })}
                          />
                          <Label htmlFor="fieldRequired">Required field</Label>
                        </div>
                      </div>

                      {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
                        <div>
                          <Label>Options (one per line)</Label>
                          <Textarea
                            value={newField.options?.join('\n') || ''}
                            onChange={(e) => setNewField({ 
                              ...newField, 
                              options: e.target.value.split('\n').filter(opt => opt.trim()) 
                            })}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={addField} size="sm">Add Field</Button>
                        <Button onClick={() => setActiveSection(-1)} variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
                  </Card>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Registration Form</h3>
        <Button onClick={() => setIsFormBuilder(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Form Builder
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section, sectionIndex) => (
          isSectionVisible(section) && (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.fields.map(field => (
                  isFieldVisible(field) && (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>
                        {field.label}
                        {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          )
        ))}

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  )
}