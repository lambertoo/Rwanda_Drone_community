"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Copy, 
  Settings, 
  Move, 
  GripVertical,
  Type,
  List,
  Circle,
  Square,
  Calendar,
  Upload,
  Link,
  Lock,
  EyeOff,
  Hash,
  Mail,
  Phone,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  Palette,
  Zap,
  Share2
} from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

export type FieldType = 
  | 'TEXT' 
  | 'TEXTAREA' 
  | 'EMAIL' 
  | 'PHONE' 
  | 'NUMBER' 
  | 'SELECT' 
  | 'RADIO' 
  | 'CHECKBOX' 
  | 'DATE' 
  | 'FILE' 
  | 'URL' 
  | 'PASSWORD' 
  | 'HIDDEN' 
  | 'PARAGRAPH'

export interface FormField {
  id: string
  type: FieldType
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

interface TallyCloneBuilderProps {
  onSave: (formData: any) => void
  onCancel: () => void
  initialData?: {
    title: string
    description: string
    sections: FormSection[]
    settings: FormSettings
  }
}

const FIELD_TYPES = [
  { type: 'TEXT', label: 'Text Input', icon: Type, description: 'Single line text', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
  { type: 'TEXTAREA', label: 'Long Text', icon: FileText, description: 'Multi-line text', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
  { type: 'EMAIL', label: 'Email', icon: Mail, description: 'Email address', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
  { type: 'PHONE', label: 'Phone', icon: Phone, description: 'Phone number', color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' },
  { type: 'NUMBER', label: 'Number', icon: Hash, description: 'Numeric input', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' },
  { type: 'SELECT', label: 'Dropdown', icon: ChevronDown, description: 'Select from options', color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100' },
  { type: 'RADIO', label: 'Multiple Choice', icon: Circle, description: 'Single selection', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100' },
  { type: 'CHECKBOX', label: 'Checkboxes', icon: Square, description: 'Multiple selections', color: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100' },
  { type: 'DATE', label: 'Date', icon: Calendar, description: 'Date picker', color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' },
  { type: 'FILE', label: 'File Upload', icon: Upload, description: 'File attachment', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
  { type: 'URL', label: 'Website', icon: Link, description: 'URL input', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' },
  { type: 'PASSWORD', label: 'Password', icon: Lock, description: 'Password field', color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' },
  { type: 'PARAGRAPH', label: 'Text Block', icon: FileText, description: 'Display text only', color: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' },
]

export default function TallyCloneBuilder({ onSave, onCancel, initialData }: TallyCloneBuilderProps) {
  const [formTitle, setFormTitle] = useState(initialData?.title || "")
  const [formDescription, setFormDescription] = useState(initialData?.description || "")
  const [sections, setSections] = useState<FormSection[]>(
    initialData?.sections || [
      {
        id: 'section-1',
        title: 'Untitled Section',
        description: '',
        order: 0,
        fields: []
      }
    ]
  )
  const [settings, setSettings] = useState<FormSettings>(
    initialData?.settings || {
      theme: 'default',
      confirmationMessage: 'Thank you for your submission!',
      allowMultipleSubmissions: true,
      collectEmail: false,
      showProgressBar: true,
      submitButtonText: 'Submit'
    }
  )
  const [activeSection, setActiveSection] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [draggedField, setDraggedField] = useState<string | null>(null)

  const addField = useCallback((type: FieldType, sectionIndex: number) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${FIELD_TYPES.find(f => f.type === type)?.label || 'Field'}`,
      name: `field_${Date.now()}`,
      placeholder: '',
      required: false,
      options: type === 'SELECT' || type === 'RADIO' || type === 'CHECKBOX' ? ['Option 1', 'Option 2'] : undefined,
      order: sections[sectionIndex].fields.length
    }

    setSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ))
  }, [sections])

  const updateField = useCallback((sectionIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? {
            ...section,
            fields: section.fields.map((field, fIndex) => 
              fIndex === fieldIndex ? { ...field, ...updates } : field
            )
          }
        : section
    ))
  }, [])

  const deleteField = useCallback((sectionIndex: number, fieldIndex: number) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex 
        ? {
            ...section,
            fields: section.fields.filter((_, fIndex) => fIndex !== fieldIndex)
          }
        : section
    ))
  }, [])

  const addSection = useCallback(() => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'Untitled Section',
      description: '',
      order: sections.length,
      fields: []
    }
    setSections(prev => [...prev, newSection])
    setActiveSection(sections.length)
  }, [sections.length])

  const updateSection = useCallback((sectionIndex: number, updates: Partial<FormSection>) => {
    setSections(prev => prev.map((section, index) => 
      index === sectionIndex ? { ...section, ...updates } : section
    ))
  }, [])

  const deleteSection = useCallback((sectionIndex: number) => {
    if (sections.length <= 1) return
    setSections(prev => prev.filter((_, index) => index !== sectionIndex))
    if (activeSection >= sectionIndex) {
      setActiveSection(Math.max(0, activeSection - 1))
    }
  }, [sections.length, activeSection])

  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceSectionIndex = parseInt(source.droppableId.split('-')[1])
    const destSectionIndex = parseInt(destination.droppableId.split('-')[1])
    const sourceIndex = source.index
    const destIndex = destination.index

    if (sourceSectionIndex === destSectionIndex) {
      // Reorder within same section
      setSections(prev => prev.map((section, index) => 
        index === sourceSectionIndex 
          ? {
              ...section,
              fields: (() => {
                const newFields = Array.from(section.fields)
                const [removed] = newFields.splice(sourceIndex, 1)
                newFields.splice(destIndex, 0, removed)
                return newFields.map((field, idx) => ({ ...field, order: idx }))
              })()
            }
          : section
      ))
    } else {
      // Move between sections
      setSections(prev => prev.map((section, index) => {
        if (index === sourceSectionIndex) {
          const newFields = Array.from(section.fields)
          const [movedField] = newFields.splice(sourceIndex, 1)
          return {
            ...section,
            fields: newFields.map((field, idx) => ({ ...field, order: idx }))
          }
        } else if (index === destSectionIndex) {
          const newFields = Array.from(section.fields)
          const movedField = sections[sourceSectionIndex].fields[sourceIndex]
          newFields.splice(destIndex, 0, { ...movedField, order: destIndex })
          return {
            ...section,
            fields: newFields.map((field, idx) => ({ ...field, order: idx }))
          }
        }
        return section
      }))
    }
  }, [sections])

  const handleSave = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      sections: sections.map(section => ({
        ...section,
        fields: section.fields.map(field => ({
          ...field,
          name: field.name || field.label.toLowerCase().replace(/\s+/g, '_')
        }))
      })),
      settings
    }
    onSave(formData)
  }

  const renderFieldEditor = (field: FormField, sectionIndex: number, fieldIndex: number) => {
    const FieldIcon = FIELD_TYPES.find(f => f.type === field.type)?.icon || Type

    return (
      <Card className="mb-4 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FieldIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-500">
                {FIELD_TYPES.find(f => f.type === field.type)?.label}
              </span>
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteField(sectionIndex, fieldIndex)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`label-${field.id}`}>Label</Label>
            <Input
              id={`label-${field.id}`}
              value={field.label}
              onChange={(e) => {
                const newLabel = e.target.value
                updateField(sectionIndex, fieldIndex, { 
                  label: newLabel,
                  name: newLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') || `field_${Date.now()}`
                })
              }}
              placeholder="Field label"
            />
          </div>

          <div>
            <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
            <Input
              id={`placeholder-${field.id}`}
              value={field.placeholder || ''}
              onChange={(e) => updateField(sectionIndex, fieldIndex, { placeholder: e.target.value })}
              placeholder="Placeholder text"
            />
          </div>

          <div>
            <Label htmlFor={`description-${field.id}`}>Description</Label>
            <Textarea
              id={`description-${field.id}`}
              value={field.description || ''}
              onChange={(e) => updateField(sectionIndex, fieldIndex, { description: e.target.value })}
              placeholder="Help text for users"
              rows={2}
            />
          </div>

          {(field.type === 'SELECT' || field.type === 'RADIO' || field.type === 'CHECKBOX') && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                {field.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])]
                        newOptions[optionIndex] = e.target.value
                        updateField(sectionIndex, fieldIndex, { options: newOptions })
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newOptions = field.options?.filter((_, idx) => idx !== optionIndex) || []
                        updateField(sectionIndex, fieldIndex, { options: newOptions })
                      }}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                    updateField(sectionIndex, fieldIndex, { options: newOptions })
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => updateField(sectionIndex, fieldIndex, { required: checked })}
              />
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Form Builder</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Tally.so Clone
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                Save Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Field Types */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FIELD_TYPES.map((fieldType) => {
                  const Icon = fieldType.icon
                  return (
                    <Button
                      key={fieldType.type}
                      variant="outline"
                      className={`w-full justify-start h-auto p-3 ${fieldType.color}`}
                      onClick={() => addField(fieldType.type as FieldType, activeSection)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{fieldType.label}</div>
                          <div className="text-xs opacity-75">{fieldType.description}</div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Sections */}
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Sections</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSection}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`p-2 rounded cursor-pointer border ${
                      activeSection === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveSection(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{section.title}</div>
                        <div className="text-xs text-gray-500">
                          {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {sections.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSection(index)
                          }}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Form Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Form Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter form title..."
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="form-description">Form Description</Label>
                  <Textarea
                    id="form-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter form description..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Editor */}
            {sections.map((section, sectionIndex) => (
              <Card key={section.id} className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                        className="text-lg font-semibold border-none p-0 h-auto"
                        placeholder="Section title"
                      />
                      <Textarea
                        value={section.description || ''}
                        onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                        placeholder="Section description (optional)"
                        className="mt-2 border-none p-0 h-auto resize-none"
                        rows={1}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={`section-${sectionIndex}`}>
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {section.fields.map((field, fieldIndex) => (
                            <Draggable key={field.id} draggableId={field.id} index={fieldIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-6 p-1 cursor-grab hover:bg-gray-100 rounded"
                                    >
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      {renderFieldEditor(field, sectionIndex, fieldIndex)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {section.fields.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-sm">No fields in this section</div>
                      <div className="text-xs mt-1">Add fields from the sidebar to get started</div>
                    </div>
                  )}

                  {/* Add Field Button for this section */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-3">Add Field to This Section</div>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.slice(0, 6).map((fieldType) => {
                        const Icon = fieldType.icon
                        return (
                          <Button
                            key={fieldType.type}
                            variant="outline"
                            size="sm"
                            className={`justify-start h-auto p-2 ${fieldType.color}`}
                            onClick={() => addField(fieldType.type as FieldType, sectionIndex)}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-3 w-3" />
                              <span className="text-xs">{fieldType.label}</span>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Settings Panel */}
            {showSettings && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Form Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Theme</Label>
                    <Select value={settings.theme} onValueChange={(value: any) => setSettings(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="confirmation-message">Confirmation Message</Label>
                    <Textarea
                      id="confirmation-message"
                      value={settings.confirmationMessage}
                      onChange={(e) => setSettings(prev => ({ ...prev, confirmationMessage: e.target.value }))}
                      placeholder="Thank you for your submission!"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="submit-button-text">Submit Button Text</Label>
                    <Input
                      id="submit-button-text"
                      value={settings.submitButtonText}
                      onChange={(e) => setSettings(prev => ({ ...prev, submitButtonText: e.target.value }))}
                      placeholder="Submit"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allow-multiple">Allow Multiple Submissions</Label>
                        <div className="text-sm text-gray-500">Let users submit the form multiple times</div>
                      </div>
                      <Switch
                        id="allow-multiple"
                        checked={settings.allowMultipleSubmissions}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowMultipleSubmissions: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="collect-email">Collect Email</Label>
                        <div className="text-sm text-gray-500">Automatically collect submitter's email</div>
                      </div>
                      <Switch
                        id="collect-email"
                        checked={settings.collectEmail}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, collectEmail: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-progress">Show Progress Bar</Label>
                        <div className="text-sm text-gray-500">Display progress for multi-step forms</div>
                      </div>
                      <Switch
                        id="show-progress"
                        checked={settings.showProgressBar}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showProgressBar: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
