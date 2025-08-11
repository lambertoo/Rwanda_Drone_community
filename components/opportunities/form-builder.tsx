"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Settings, Eye, EyeOff, GripVertical, Copy, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface FormField {
  id: string
  label: string
  type: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: any
  conditions: FormCondition[]
  blockType: 'question' | 'layout' | 'embed' | 'advanced'
  order: number
}

interface FormCondition {
  id: string
  targetFieldId: string
  operator: string
  value: string
  action: string
  targetBlock?: string
  targetPage?: string
}

interface FormBuilderProps {
  opportunityId: string
  onSave: (form: { title: string; description: string; fields: FormField[] }) => void
  initialForm?: any
}

const BLOCK_TYPES = {
  question: [
    { value: 'SHORT_ANSWER', label: 'Short answer', icon: '—' },
    { value: 'LONG_ANSWER', label: 'Long answer', icon: '☰' },
    { value: 'MULTIPLE_CHOICE', label: 'Multiple choice', icon: '○' },
    { value: 'CHECKBOXES', label: 'Checkboxes', icon: '☑' },
    { value: 'DROPDOWN', label: 'Dropdown', icon: '⌄' },
    { value: 'MULTI_SELECT', label: 'Multi-select', icon: '☑☑' },
    { value: 'NUMBER', label: 'Number', icon: '#' },
    { value: 'EMAIL', label: 'Email', icon: '@' },
    { value: 'PHONE', label: 'Phone number', icon: '📞' },
    { value: 'LINK', label: 'Link', icon: '🔗' },
    { value: 'FILE_UPLOAD', label: 'File upload', icon: '⬆' },
    { value: 'DATE', label: 'Date', icon: '📅' },
    { value: 'TIME', label: 'Time', icon: '🕐' },
    { value: 'LINEAR_SCALE', label: 'Linear scale', icon: '⋯' },
    { value: 'RATING', label: 'Rating', icon: '⭐' },
    { value: 'SIGNATURE', label: 'Signature', icon: '✒' },
    { value: 'RANKING', label: 'Ranking', icon: '🏆' }
  ],
  layout: [
    { value: 'NEW_PAGE', label: 'New page', icon: '📄' },
    { value: 'THANK_YOU_PAGE', label: "'Thank you' page", icon: '😊' },
    { value: 'TEXT', label: 'Text', icon: 'T' },
    { value: 'HEADING_1', label: 'Heading 1', icon: 'H1' },
    { value: 'HEADING_2', label: 'Heading 2', icon: 'H2' },
    { value: 'HEADING_3', label: 'Heading 3', icon: 'H3' },
    { value: 'DIVIDER', label: 'Divider', icon: '—' },
    { value: 'TITLE', label: 'Title', icon: '🔖' },
    { value: 'LABEL', label: 'Label', icon: '🏷' }
  ],
  embed: [
    { value: 'IMAGE', label: 'Image', icon: '🖼' },
    { value: 'VIDEO', label: 'Video', icon: '🎬' },
    { value: 'AUDIO', label: 'Audio', icon: '🔊' },
    { value: 'EMBED_ANYTHING', label: 'Embed anything', icon: '🧭' }
  ],
  advanced: [
    { value: 'CONDITIONAL_LOGIC', label: 'Conditional logic', icon: '🔗' },
    { value: 'CALCULATED_FIELDS', label: 'Calculated fields', icon: '÷' },
    { value: 'HIDDEN_FIELDS', label: 'Hidden fields', icon: '👁' },
    { value: 'RECAPTCHA', label: 'reCAPTCHA', icon: '👤' },
    { value: 'RESPONDENT_COUNTRY', label: "Respondent's country", icon: '🌐' }
  ]
}

const OPERATORS = [
  { value: 'IS', label: 'Is' },
  { value: 'IS_NOT', label: 'Is not' },
  { value: 'IS_EMPTY', label: 'Is empty' },
  { value: 'IS_NOT_EMPTY', label: 'Is not empty' },
  { value: 'IS_ANY_OF', label: 'Is any of' },
  { value: 'IS_NOT_ANY_OF', label: 'Is not any of' },
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'NOT_CONTAINS', label: 'Does not contain' },
  { value: 'GREATER_THAN', label: 'Greater than' },
  { value: 'LESS_THAN', label: 'Less than' },
  { value: 'EQUALS', label: 'Equals' },
  { value: 'NOT_EQUALS', label: 'Does not equal' }
]

const ACTIONS = [
  { value: 'SHOW_BLOCKS', label: 'Show blocks' },
  { value: 'HIDE_BLOCKS', label: 'Hide blocks' },
  { value: 'JUMP_TO_PAGE', label: 'Jump to page' },
  { value: 'REQUIRE_ANSWER', label: 'Require answer' },
  { value: 'CALCULATE', label: 'Calculate' },
  { value: 'HIDE_BUTTON', label: 'Hide button to disable completion' },
  { value: 'SHOW_FIELD', label: 'Show field' },
  { value: 'HIDE_FIELD', label: 'Hide field' },
  { value: 'MAKE_REQUIRED', label: 'Make required' },
  { value: 'MAKE_OPTIONAL', label: 'Make optional' }
]

export default function FormBuilder({ opportunityId, onSave, initialForm }: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || "Application Form")
  const [description, setDescription] = useState(initialForm?.description || "")
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || [])
  const [showConditions, setShowConditions] = useState<{ [key: string]: boolean }>({})
  const [activeTab, setActiveTab] = useState("question")

  const addField = (blockType: string, fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "",
      type: fieldType,
      placeholder: "",
      required: false,
      options: [],
      validation: {},
      conditions: [],
      blockType: blockType as any,
      order: fields.length
    }
    setFields([...fields, newField])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const duplicateField = (index: number) => {
    const field = fields[index]
    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
      order: fields.length
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const addCondition = (fieldIndex: number) => {
    const newCondition: FormCondition = {
      id: `condition_${Date.now()}`,
      targetFieldId: "",
      operator: "IS",
      value: "",
      action: "SHOW_BLOCKS"
    }
    const newFields = [...fields]
    newFields[fieldIndex].conditions.push(newCondition)
    setFields(newFields)
  }

  const removeCondition = (fieldIndex: number, conditionIndex: number) => {
    const newFields = [...fields]
    newFields[fieldIndex].conditions.splice(conditionIndex, 1)
    setFields(newFields)
  }

  const updateCondition = (fieldIndex: number, conditionIndex: number, updates: Partial<FormCondition>) => {
    const newFields = [...fields]
    newFields[fieldIndex].conditions[conditionIndex] = {
      ...newFields[fieldIndex].conditions[conditionIndex],
      ...updates
    }
    setFields(newFields)
  }

  const addOption = (fieldIndex: number) => {
    const newFields = [...fields]
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = []
    }
    newFields[fieldIndex].options!.push("")
    setFields(newFields)
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields]
    newFields[fieldIndex].options!.splice(optionIndex, 1)
    setFields(newFields)
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const newFields = [...fields]
    newFields[fieldIndex].options![optionIndex] = value
    setFields(newFields)
  }

  const handleSave = () => {
    if (fields.length === 0) {
      alert("Please add at least one field to the form")
      return
    }

    // Validate fields
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      if (!field.label.trim()) {
        alert(`Field ${i + 1} must have a label`)
        return
      }
      
      if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'MULTI_SELECT'].includes(field.type) && (!field.options || field.options.length === 0)) {
        alert(`Field "${field.label}" must have at least one option`)
        return
      }
    }

    onSave({ title, description, fields })
  }

  const renderFieldInputs = (field: FormField, index: number) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Field Label *</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
              placeholder="e.g., Full Name"
            />
          </div>
          <div>
            <Label>Field Type *</Label>
            <Select value={field.type} onValueChange={(value) => updateField(index, { type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES[field.blockType].map((type) => (
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
            value={field.placeholder || ""}
            onChange={(e) => updateField(index, { placeholder: e.target.value })}
            placeholder="e.g., Enter your full name"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`required_${index}`}
            checked={field.required}
            onCheckedChange={(checked) => updateField(index, { required: !!checked })}
          />
          <Label htmlFor={`required_${index}`}>Required field</Label>
        </div>

        {/* Options for select, radio, checkbox */}
        {['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN', 'MULTI_SELECT'].includes(field.type) && (
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {(field.options || []).map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index, optionIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(index)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Conditional Logic */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Conditional Logic</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowConditions({ ...showConditions, [field.id]: !showConditions[field.id] })}
            >
              {showConditions[field.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showConditions[field.id] ? "Hide" : "Show"} Logic
            </Button>
          </div>

          {showConditions[field.id] && (
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
              {field.conditions.map((condition, conditionIndex) => (
                <div key={condition.id} className="space-y-3 p-3 border rounded bg-white">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <span>When</span>
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">?</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={condition.targetFieldId}
                        onValueChange={(value) => updateCondition(index, conditionIndex, { targetFieldId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((f, i) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.label || `Field ${i + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, conditionIndex, { operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATORS.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Value</Label>
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(index, conditionIndex, { value: e.target.value })}
                        placeholder="Value"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <span>Then</span>
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">⚡</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-end">
                    <div>
                      <Label className="text-xs">Action</Label>
                      <Select
                        value={condition.action}
                        onValueChange={(value) => updateCondition(index, conditionIndex, { action: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIONS.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index, conditionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addCondition(index)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what information you need from applicants..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Form Blocks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="question">Questions</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="embed">Embed</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {Object.entries(BLOCK_TYPES).map(([blockType, types]) => (
              <TabsContent key={blockType} value={blockType} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {types.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                      onClick={() => addField(blockType, type.value)}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Form Fields</CardTitle>
            <div className="text-sm text-muted-foreground">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
                      {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4" />
              <p>No fields added yet. Click 'Add Field' to start building your form.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{field.blockType}</Badge>
                          <Badge variant="outline">{field.type}</Badge>
                          {field.required && <Badge variant="destructive">Required</Badge>}
                          {field.conditions.length > 0 && (
                            <Badge variant="secondary">{field.conditions.length} logic rule{field.conditions.length !== 1 ? 's' : ''}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateField(index)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderFieldInputs(field, index)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Add Field Button - Always visible below fields */}
          <div className="mt-6 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Add more fields to your form</p>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(BLOCK_TYPES).map(([blockType, types]) => (
                  types.map((type) => (
                    <Button
                      key={`${blockType}-${type.value}`}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => addField(blockType, type.value)}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  ))
                ))}
              </div>
            </div>
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