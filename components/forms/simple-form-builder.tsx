"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save } from "lucide-react"

interface FormField {
  id: string
  type: string
  label: string
  name: string
  placeholder?: string
  required: boolean
}

interface SimpleFormBuilderProps {
  onSave: (formData: any) => void
  onCancel: () => void
}

export default function SimpleFormBuilder({ onSave, onCancel }: SimpleFormBuilderProps) {
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [fields, setFields] = useState<FormField[]>([])

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: "text",
      label: "New Field",
      name: `field_${fields.length + 1}`,
      placeholder: "Enter text...",
      required: false
    }
    setFields([...fields, newField])
  }

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const handleSave = () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      fields: fields
    }
    onSave(formData)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Form Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="formTitle">Form Title</Label>
              <Input
                id="formTitle"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter form title..."
              />
            </div>
            <div>
              <Label htmlFor="formDescription">Form Description</Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description..."
              />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Form Fields</h3>
              <Button onClick={addField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No fields added yet. Click "Add Field" to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Field {fields.indexOf(field) + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`label_${field.id}`}>Label</Label>
                          <Input
                            id={`label_${field.id}`}
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`name_${field.id}`}>Name</Label>
                          <Input
                            id={`name_${field.id}`}
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`type_${field.id}`}>Type</Label>
                          <select
                            id={`type_${field.id}`}
                            value={field.type}
                            onChange={(e) => updateField(field.id, { type: e.target.value })}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="textarea">Textarea</option>
                            <option value="number">Number</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`placeholder_${field.id}`}>Placeholder</Label>
                          <Input
                            id={`placeholder_${field.id}`}
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          />
                          <span>Required field</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
