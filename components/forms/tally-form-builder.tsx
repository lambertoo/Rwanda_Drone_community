"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Trash2, 
  Eye,
  Save,
  FileText,
  Calendar,
  Upload,
  Hash,
  Mail,
  Phone,
  CheckSquare,
  Circle,
  ChevronDown,
  Settings,
  ArrowUp,
  ArrowDown,
  Edit,
  X
} from "lucide-react"

interface FormField {
  id: string
  type: string
  label: string
  name: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: any
  conditional?: any
  order: number
}

interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  order: number
}

interface TallyFormBuilderProps {
  onSave?: (form: any) => void
  onCancel?: () => void
  initialData?: any
}

const FIELD_TYPES = [
  { value: 'TEXT', label: 'Text', icon: FileText },
  { value: 'TEXTAREA', label: 'Textarea', icon: FileText },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'PHONE', label: 'Phone', icon: Phone },
  { value: 'NUMBER', label: 'Number', icon: Hash },
  { value: 'SELECT', label: 'Select', icon: ChevronDown },
  { value: 'RADIO', label: 'Radio', icon: Circle },
  { value: 'CHECKBOX', label: 'Checkbox', icon: CheckSquare },
  { value: 'DATE', label: 'Date', icon: Calendar },
  { value: 'FILE', label: 'File Upload', icon: Upload },
  { value: 'URL', label: 'URL', icon: FileText },
  { value: 'PASSWORD', label: 'Password', icon: FileText },
  { value: 'HIDDEN', label: 'Hidden', icon: FileText },
  { value: 'PARAGRAPH', label: 'Paragraph', icon: FileText },
]

export default function TallyFormBuilder({ onSave, onCancel, initialData }: TallyFormBuilderProps) {
  // Debug: Log the initial data to see what we're receiving
  console.log('TallyFormBuilder initialData:', initialData)
  
  const [formTitle, setFormTitle] = useState(initialData?.title || "Untitled Form")
  const [formDescription, setFormDescription] = useState(initialData?.description || "")
  const [sections, setSections] = useState<FormSection[]>(() => {
    if (initialData?.sections && initialData.sections.length > 0) {
      return initialData.sections.map((section: any) => ({
        id: section.id,
        title: section.title,
        description: section.description || '',
        order: section.order || 1,
        fields: section.fields?.map((field: any) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          name: field.name,
          placeholder: field.placeholder || '',
          required: field.validation?.required || false,
          options: field.options || [],
          validation: field.validation || {},
          conditional: field.conditional || {},
          order: field.order || 1
        })) || []
      }))
    }
    return [
      {
        id: 'section_1',
        title: 'Section 1',
        description: '',
        fields: [],
        order: 1
      }
    ]
  })
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState(() => {
    if (initialData?.sections && initialData.sections.length > 0) {
      return initialData.sections[0].id
    }
    return 'section_1'
  })
  const [editingField, setEditingField] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [allowSubmissions, setAllowSubmissions] = useState(
    initialData?.settings?.allowSubmissions ?? initialData?.allowSubmissions ?? true
  )

  const addSection = () => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      fields: [],
      order: sections.length + 1
    }
    setSections([...sections, newSection])
    setActiveSection(newSection.id)
  }

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ))
  }

  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) return
    setSections(sections.filter(section => section.id !== sectionId))
    if (activeSection === sectionId) {
      setActiveSection(sections[0].id)
    }
  }

  const addField = (type: string) => {
    const activeSectionData = sections.find(s => s.id === activeSection)
    if (!activeSectionData) return

    const fieldName = `field_${Date.now()}`
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: type.charAt(0) + type.slice(1).toLowerCase(),
      name: fieldName,
      placeholder: '',
      required: false,
      options: ['Option 1', 'Option 2'],
      order: activeSectionData.fields.length + 1
    }

    updateSection(activeSection, {
      fields: [...activeSectionData.fields, newField]
    })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setSections(sections.map(section => ({
      ...section,
      fields: section.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    })))
  }

  const deleteField = (fieldId: string) => {
    setSections(sections.map(section => ({
      ...section,
      fields: section.fields.filter(field => field.id !== fieldId)
    })))
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setSections(sections.map(section => {
      const fieldIndex = section.fields.findIndex(f => f.id === fieldId)
      if (fieldIndex === -1) return section

      const newFields = [...section.fields]
      const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1

      if (targetIndex >= 0 && targetIndex < newFields.length) {
        [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]]
        newFields.forEach((field, index) => {
          field.order = index + 1
        })
      }

      return { ...section, fields: newFields }
    }))
  }

  const addOption = (fieldId: string) => {
    const field = sections.find(s => s.fields.some(f => f.id === fieldId))?.fields.find(f => f.id === fieldId)
    if (!field?.options) return

    const newOptions = [...field.options, 'New Option']
    updateField(fieldId, { options: newOptions })
  }

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = sections.find(s => s.fields.some(f => f.id === fieldId))?.fields.find(f => f.id === fieldId)
    if (!field?.options) return

    const newOptions = [...field.options]
    newOptions[optionIndex] = value
    updateField(fieldId, { options: newOptions })
  }

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = sections.find(s => s.fields.some(f => f.id === fieldId))?.fields.find(f => f.id === fieldId)
    if (!field?.options || field.options.length <= 1) return

    const newOptions = field.options.filter((_, index) => index !== optionIndex)
    updateField(fieldId, { options: newOptions })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        allowSubmissions: allowSubmissions,
        settings: {
          allowSubmissions: allowSubmissions
        },
        sections: sections.map(section => ({
          title: section.title,
          description: section.description,
          fields: section.fields.map(field => ({
            type: field.type,
            label: field.label,
            name: field.name,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options,
            validation: field.validation,
            conditional: field.conditional,
            order: field.order
          }))
        }))
      }

      if (onSave) {
        await onSave(formData)
      }
    } catch (error) {
      console.error('Error saving form:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const activeSectionData = sections.find(s => s.id === activeSection)

  if (previewMode) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Preview</h2>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Form
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{formTitle}</CardTitle>
            {formDescription && (
              <p className="text-gray-600">{formDescription}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {field.type === 'TEXT' && (
                        <Input placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'TEXTAREA' && (
                        <Textarea placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'EMAIL' && (
                        <Input type="email" placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'PHONE' && (
                        <Input type="tel" placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'NUMBER' && (
                        <Input type="number" placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'SELECT' && (
                        <select className="w-full p-2 border rounded-md" disabled>
                          <option>Select an option</option>
                          {field.options?.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'RADIO' && (
                        <div className="space-y-2">
                          {field.options?.map((option, index) => (
                            <label key={index} className="flex items-center space-x-2">
                              <input type="radio" name={field.name} disabled />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {field.type === 'CHECKBOX' && (
                        <div className="space-y-2">
                          {field.options?.map((option, index) => (
                            <label key={index} className="flex items-center space-x-2">
                              <input type="checkbox" disabled />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {field.type === 'DATE' && (
                        <Input type="date" disabled />
                      )}
                      
                      {field.type === 'FILE' && (
                        <Input type="file" disabled />
                      )}
                      
                      {field.type === 'URL' && (
                        <Input type="url" placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'PASSWORD' && (
                        <Input type="password" placeholder={field.placeholder} disabled />
                      )}
                      
                      {field.type === 'PARAGRAPH' && (
                        <p className="text-gray-600 text-sm">{field.label}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Form Builder</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Form'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Sections Only */}
        <div className="lg:col-span-1">
          {/* Sections */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Sections</CardTitle>
                <Button size="sm" onClick={addSection}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    activeSection === section.id 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{section.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {section.fields.length} fields
                        </Badge>
                      </div>
                      {section.description && (
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingSection(section.id)
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {sections.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSection(section.id)
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Field Types */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Add Field</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon
                return (
                  <Button
                    key={fieldType.value}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addField(fieldType.value)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {fieldType.label}
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Form Builder and Settings */}
        <div className="lg:col-span-3">
          {/* Form Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter form title"
                  />
                </div>
                <div>
                  <Label htmlFor="form-description">Description</Label>
                  <Input
                    id="form-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter form description"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Allow Submissions</Label>
                  <p className="text-xs text-muted-foreground">
                    When disabled, no new submissions can be made
                  </p>
                </div>
                <Switch
                  checked={allowSubmissions}
                  onCheckedChange={setAllowSubmissions}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeSectionData?.title || 'Select a section'}
              </CardTitle>
              {activeSectionData?.description && (
                <p className="text-sm text-gray-600">{activeSectionData.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {activeSectionData && (
                <div className="space-y-4">
                  {activeSectionData.fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No fields yet. Add a field from the sidebar.</p>
                    </div>
                  ) : (
                    activeSectionData.fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div key={field.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{field.type}</Badge>
                                <span className="font-medium">{field.label}</span>
                                {field.required && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">Name: {field.name}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingField(field.id)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveField(field.id, 'up')}
                                disabled={field.order === 1}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveField(field.id, 'down')}
                                disabled={field.order === activeSectionData.fields.length}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteField(field.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Field Preview */}
                          <div className="mt-2">
                            {field.type === 'TEXT' && (
                              <Input placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'TEXTAREA' && (
                              <Textarea placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'EMAIL' && (
                              <Input type="email" placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'PHONE' && (
                              <Input type="tel" placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'NUMBER' && (
                              <Input type="number" placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'SELECT' && (
                              <select className="w-full p-2 border rounded-md" disabled>
                                <option>Select an option</option>
                                {field.options?.map((option, index) => (
                                  <option key={index} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                            {field.type === 'RADIO' && (
                              <div className="space-y-2">
                                {field.options?.map((option, index) => (
                                  <label key={index} className="flex items-center space-x-2">
                                    <input type="radio" name={field.name} disabled />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {field.type === 'CHECKBOX' && (
                              <div className="space-y-2">
                                {field.options?.map((option, index) => (
                                  <label key={index} className="flex items-center space-x-2">
                                    <input type="checkbox" disabled />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {field.type === 'DATE' && (
                              <Input type="date" disabled />
                            )}
                            {field.type === 'FILE' && (
                              <Input type="file" disabled />
                            )}
                            {field.type === 'URL' && (
                              <Input type="url" placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'PASSWORD' && (
                              <Input type="password" placeholder={field.placeholder} disabled />
                            )}
                            {field.type === 'PARAGRAPH' && (
                              <p className="text-gray-600 text-sm">{field.label}</p>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Edit Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={sections.find(s => s.id === editingSection)?.title || ''}
                  onChange={(e) => updateSection(editingSection, { title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={sections.find(s => s.id === editingSection)?.description || ''}
                  onChange={(e) => updateSection(editingSection, { description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setEditingSection(null)}>
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Field</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Label</Label>
                <Input
                  value={sections.find(s => s.fields.some(f => f.id === editingField))?.fields.find(f => f.id === editingField)?.label || ''}
                  onChange={(e) => updateField(editingField, { label: e.target.value })}
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={sections.find(s => s.fields.some(f => f.id === editingField))?.fields.find(f => f.id === editingField)?.name || ''}
                  onChange={(e) => updateField(editingField, { name: e.target.value })}
                />
              </div>
              <div>
                <Label>Placeholder</Label>
                <Input
                  value={sections.find(s => s.fields.some(f => f.id === editingField))?.fields.find(f => f.id === editingField)?.placeholder || ''}
                  onChange={(e) => updateField(editingField, { placeholder: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={sections.find(s => s.fields.some(f => f.id === editingField))?.fields.find(f => f.id === editingField)?.required || false}
                  onChange={(e) => updateField(editingField, { required: e.target.checked })}
                />
                <Label htmlFor="required">Required</Label>
              </div>

              {/* Options for select, radio, checkbox */}
              {['SELECT', 'RADIO', 'CHECKBOX'].includes(sections.find(s => s.fields.some(f => f.id === editingField))?.fields.find(f => f.id === editingField)?.type || '') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {sections.find(s => s.fields.some(f => f.id === editingField))?.fields.find(f => f.id === editingField)?.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(editingField, index, e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeOption(editingField, index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addOption(editingField)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingField(null)}>
                  Cancel
                </Button>
                <Button onClick={() => setEditingField(null)}>
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}