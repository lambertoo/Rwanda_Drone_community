"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date' | 'file' | 'url'
  placeholder?: string
  required: boolean
  options?: string[]
  fileTypes?: string
  conditionalLogic?: {
    showWhen: string | null
    operator: string | null
    value: string | null
    action: 'show' | 'hide' | 'require' | 'jump_to'
    target?: string | null
  }
}

interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

interface FormBuilderProps {
  opportunityId: string
  onSave: (form: { title: string; description: string; sections: FormSection[] }) => void
  initialForm?: any
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: '—' },
  { value: 'textarea', label: 'Long text', icon: '☰' },
  { value: 'select', label: 'Dropdown', icon: '⌄' },
  { value: 'radio', label: 'Multiple choice', icon: '○' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑' },
  { value: 'number', label: 'Number', icon: '#' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'phone', label: 'Phone number', icon: '📞' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'file', label: 'File upload', icon: '⬆' },
  { value: 'date', label: 'Date', icon: '📅' }
]

export default function AdvancedFormBuilder({ opportunityId, onSave, initialForm }: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || "Application Form")
  const [description, setDescription] = useState(initialForm?.description || "")
  const [sections, setSections] = useState<FormSection[]>(initialForm?.sections || [])
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSection, setNewSection] = useState({ title: '', description: '' })
  const [activeSection, setActiveSection] = useState(-1)
  const [newField, setNewField] = useState<FormField>({
    id: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: false,
    options: [],
    fileTypes: '',
    conditionalLogic: {
      showWhen: null,
      operator: null,
      value: null,
      action: 'show',
      target: null
    }
  })

  const addSection = () => {
    if (newSection.title.trim()) {
      const section: FormSection = {
        id: `section_${Date.now()}`,
        title: newSection.title,
        description: newSection.description,
        fields: []
      }
      setSections([...sections, section])
      setNewSection({ title: '', description: '' })
      setShowAddSection(false)
    }
  }

  const addFieldToSection = (sectionIndex: number) => {
    if (newField.label.trim()) {
      const updatedSections = [...sections]
      updatedSections[sectionIndex].fields.push({
        ...newField,
        id: `field_${Date.now()}`
      })
      setSections(updatedSections)
      setNewField({
        id: '',
        label: '',
        type: 'text',
        placeholder: '',
        required: false,
        options: [],
        fileTypes: '',
        conditionalLogic: {
          showWhen: null,
          operator: null,
          value: null,
          action: 'show',
          target: null
        }
      })
      setActiveSection(-1)
    }
  }

  const getAllFields = (): FormField[] => {
    return sections.flatMap(section => section.fields)
  }

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].fields.splice(fieldIndex, 1)
    setSections(updatedSections)
  }

  const removeSection = (sectionIndex: number) => {
    setSections(sections.filter((_, i) => i !== sectionIndex))
  }

  const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].fields[fieldIndex] = { 
      ...updatedSections[sectionIndex].fields[fieldIndex], 
      ...updates 
    }
    setSections(updatedSections)
  }

  const addOption = (sectionIndex: number, fieldIndex: number) => {
    const updatedSections = [...sections]
    if (!updatedSections[sectionIndex].fields[fieldIndex].options) {
      updatedSections[sectionIndex].fields[fieldIndex].options = []
    }
    updatedSections[sectionIndex].fields[fieldIndex].options!.push("")
    setSections(updatedSections)
  }

  const removeOption = (sectionIndex: number, fieldIndex: number, optionIndex: number) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].fields[fieldIndex].options!.splice(optionIndex, 1)
    setSections(updatedSections)
  }

  const updateOption = (sectionIndex: number, fieldIndex: number, optionIndex: number, value: string) => {
    const updatedSections = [...sections]
    updatedSections[sectionIndex].fields[fieldIndex].options![optionIndex] = value
    setSections(updatedSections)
  }

  const handleSave = () => {
    const allFields = getAllFields()
    if (allFields.length === 0) {
      alert("Please add at least one field to the form")
      return
    }

    onSave({ title, description, sections })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Form Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Form Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Application Form"
              />
            </div>
            <div>
              <Label>Form Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
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
                    <Button onClick={addSection} size="sm">
                      Add Section
                    </Button>
                    <Button onClick={() => setShowAddSection(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Existing Sections */}
            {sections.map((section, sectionIndex) => (
              <Card key={section.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{section.title}</h5>
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
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Fields in this section */}
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
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => removeField(sectionIndex, fieldIndex)} 
                          variant="outline" 
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Field Form */}
                  {activeSection === sectionIndex && (
                    <Card className="p-4 border-dashed">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Field Label *</Label>
                            <Input
                              value={newField.label}
                              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                              placeholder="e.g., Full Name"
                            />
                          </div>
                          <div>
                            <Label>Field Type *</Label>
                            <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value as any })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Placeholder Text</Label>
                          <Input
                            value={newField.placeholder || ""}
                            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                            placeholder="e.g., Enter your full name"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`required_${sectionIndex}`}
                            checked={newField.required}
                            onCheckedChange={(checked) => setNewField({ ...newField, required: !!checked })}
                          />
                          <Label htmlFor={`required_${sectionIndex}`}>Required field</Label>
                        </div>

                        {/* Options for select, radio, checkbox */}
                        {['select', 'radio', 'checkbox'].includes(newField.type) && (
                          <div className="space-y-2">
                            <Label>Options</Label>
                            <div className="space-y-2">
                              {(newField.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(newField.options || [])]
                                      newOptions[optionIndex] = e.target.value
                                      setNewField({ ...newField, options: newOptions })
                                    }}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newOptions = [...(newField.options || [])]
                                      newOptions.splice(optionIndex, 1)
                                      setNewField({ ...newField, options: newOptions })
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(newField.options || []), ""]
                                  setNewField({ ...newField, options: newOptions })
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* File Types for file upload */}
                        {newField.type === 'file' && (
                          <div>
                            <Label>File Types</Label>
                            <Input
                              value={newField.fileTypes || ''}
                              onChange={(e) => setNewField({ ...newField, fileTypes: e.target.value })}
                              placeholder="e.g., .pdf, .doc, .docx"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => addFieldToSection(sectionIndex)} 
                            size="sm"
                          >
                            Add Field
                          </Button>
                          <Button 
                            onClick={() => setActiveSection(-1)} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} className="flex-1">
          Save Form
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
 
 
 
 
 