"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
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
  X,
  GripVertical,
  Star,
  Image as ImageIcon,
  Type,
  Clock,
  Link2,
  LayoutGrid,
  Sliders,
  ListChecks,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────
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

interface FormSettings {
  allowMultipleSubmissions: boolean
  collectEmail: boolean
  showProgressBar: boolean
  confirmationMessage: string
  redirectUrl: string
  submitButtonText: string
  closedMessage: string
  closeDate: string
  maxResponses: number | null
  coverImage: string
  primaryColor: string
  notifyEmails: string
}

interface FormEditorProps {
  onSave?: (form: any) => void
  onCancel?: () => void
  initialData?: any
}

// ── Field Type Config ────────────────────────────────────
const FIELD_TYPES = [
  { value: "SHORT_TEXT", label: "Short Answer", icon: Type, category: "Input" },
  { value: "LONG_TEXT", label: "Long Answer", icon: FileText, category: "Input" },
  { value: "EMAIL", label: "Email", icon: Mail, category: "Input" },
  { value: "NUMBER", label: "Number", icon: Hash, category: "Input" },
  { value: "PHONE", label: "Phone", icon: Phone, category: "Input" },
  { value: "URL", label: "Link (URL)", icon: Link2, category: "Input" },
  { value: "DATE", label: "Date", icon: Calendar, category: "Input" },
  { value: "TIME", label: "Time", icon: Clock, category: "Input" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: Circle, category: "Choice" },
  { value: "CHECKBOXES", label: "Checkboxes", icon: CheckSquare, category: "Choice" },
  { value: "DROPDOWN", label: "Dropdown", icon: ChevronDown, category: "Choice" },
  { value: "MULTI_SELECT", label: "Multi Select", icon: ListChecks, category: "Choice" },
  { value: "LINEAR_SCALE", label: "Linear Scale", icon: Sliders, category: "Rating" },
  { value: "RATING", label: "Rating", icon: Star, category: "Rating" },
  { value: "MATRIX", label: "Matrix", icon: LayoutGrid, category: "Rating" },
  { value: "FILE_UPLOAD", label: "File Upload", icon: Upload, category: "Other" },
]

const FIELD_ICON_MAP: Record<string, any> = Object.fromEntries(
  FIELD_TYPES.map((ft) => [ft.value, ft.icon])
)

function getFieldIcon(type: string) {
  const Icon = FIELD_ICON_MAP[type] || Type
  return <Icon className="w-4 h-4" />
}

function getDefaultValidation(type: string) {
  if (type === "FILE_UPLOAD") {
    return { required: false, allowedFileTypes: ["pdf", "jpg", "png", "docx"], maxFileSize: 10485760, maxFiles: 1 }
  }
  return { required: false }
}

// ── Slash Command Palette ────────────────────────────────
function SlashCommandPalette({
  position,
  search,
  onSelect,
  onClose,
}: {
  position: { top: number; left: number }
  search: string
  onSelect: (type: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const filtered = FIELD_TYPES.filter(
    (ft) =>
      ft.label.toLowerCase().includes(search.toLowerCase()) ||
      ft.value.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  const categories = ["Input", "Choice", "Rating", "Other"]

  return (
    <div
      ref={ref}
      className="absolute z-50 w-72 bg-popover border rounded-lg shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground px-1">Add a block</p>
      </div>
      <div className="max-h-72 overflow-y-auto p-1">
        {filtered.length === 0 && (
          <p className="p-3 text-sm text-muted-foreground text-center">No blocks found</p>
        )}
        {categories.map((cat) => {
          const items = filtered.filter((ft) => ft.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">{cat}</p>
              {items.map((ft) => {
                const Icon = ft.icon
                return (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => onSelect(ft.value)}
                    className="flex items-center gap-3 w-full px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{ft.label}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Add Block Button (between fields) ────────────────────
function AddBlockButton({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative h-6 flex items-center justify-center group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div className={`absolute inset-x-0 top-1/2 border-t border-dashed border-border transition-opacity ${visible ? "opacity-100" : "opacity-0"}`} />
      <button
        type="button"
        onClick={onClick}
        className={`relative z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-sm transition-all ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-75"
        } hover:scale-110`}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Inline Field Block ───────────────────────────────────
function FieldBlock({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [hovered, setHovered] = useState(false)
  const labelRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingLabel && labelRef.current) {
      labelRef.current.focus()
      labelRef.current.select()
    }
  }, [editingLabel])

  const needsOptions = ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "MULTI_SELECT"].includes(field.type)

  return (
    <div
      className={`group relative rounded-lg border transition-all ${
        isSelected
          ? "border-primary/50 bg-primary/[0.02] shadow-sm ring-1 ring-primary/20"
          : "border-transparent hover:border-border"
      }`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Drag handle + actions */}
      <div className={`absolute -left-10 top-3 flex flex-col items-center gap-0.5 transition-opacity ${hovered || isSelected ? "opacity-100" : "opacity-0"}`}>
        <button type="button" className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Field type badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
              {getFieldIcon(field.type)}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {FIELD_TYPES.find((ft) => ft.value === field.type)?.label || field.type}
            </span>
          </div>
          <div className={`flex items-center gap-1 transition-opacity ${hovered || isSelected ? "opacity-100" : "opacity-0"}`}>
            <div className="flex items-center gap-1 mr-2">
              <span className="text-xs text-muted-foreground">Required</span>
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
                className="scale-75"
              />
            </div>
            {canMoveUp && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp() }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {canMoveDown && (
              <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown() }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline label editing */}
        {editingLabel ? (
          <input
            ref={labelRef}
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            onBlur={() => setEditingLabel(false)}
            onKeyDown={(e) => { if (e.key === "Enter") setEditingLabel(false) }}
            className="text-base font-medium bg-transparent border-none outline-none w-full p-0 focus:ring-0"
          />
        ) : (
          <h3
            className="text-base font-medium cursor-text hover:text-primary transition-colors"
            onClick={(e) => { e.stopPropagation(); setEditingLabel(true) }}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        )}

        {/* Inline placeholder */}
        {isSelected && (
          <input
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Add placeholder text..."
            className="mt-1 text-sm text-muted-foreground bg-transparent border-none outline-none w-full p-0 focus:ring-0 italic"
          />
        )}

        {/* Field preview */}
        <div className="mt-3 pointer-events-none opacity-60">
          {field.type === "SHORT_TEXT" && <div className="h-9 rounded-md border bg-muted/20" />}
          {field.type === "LONG_TEXT" && <div className="h-20 rounded-md border bg-muted/20" />}
          {field.type === "EMAIL" && <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3"><Mail className="w-4 h-4 text-muted-foreground/40" /></div>}
          {field.type === "NUMBER" && <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3"><Hash className="w-4 h-4 text-muted-foreground/40" /></div>}
          {field.type === "PHONE" && <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3"><Phone className="w-4 h-4 text-muted-foreground/40" /></div>}
          {field.type === "URL" && <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3"><Link2 className="w-4 h-4 text-muted-foreground/40" /></div>}
          {field.type === "DATE" && <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3"><Calendar className="w-4 h-4 text-muted-foreground/40" /></div>}
          {field.type === "TIME" && <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3"><Clock className="w-4 h-4 text-muted-foreground/40" /></div>}
          {field.type === "FILE_UPLOAD" && (
            <div className="h-16 rounded-md border-2 border-dashed bg-muted/10 flex items-center justify-center gap-2 text-muted-foreground/40">
              <Upload className="w-4 h-4" /> <span className="text-xs">Upload file</span>
            </div>
          )}
          {field.type === "RATING" && (
            <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 text-muted-foreground/30" />)}</div>
          )}
          {field.type === "LINEAR_SCALE" && (
            <div className="flex gap-2 items-center">
              {[1,2,3,4,5].map(n => (
                <div key={n} className="w-8 h-8 rounded-full border flex items-center justify-center text-xs text-muted-foreground/50">{n}</div>
              ))}
            </div>
          )}
          {field.type === "MATRIX" && (
            <div className="border rounded p-2 text-xs text-muted-foreground/50">Matrix grid</div>
          )}
        </div>

        {/* Options editing (inline when selected) */}
        {isSelected && needsOptions && (
          <div className="mt-3 space-y-1.5 pointer-events-auto">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                {field.type === "MULTIPLE_CHOICE" ? (
                  <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                ) : (
                  <CheckSquare className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])]
                    newOptions[index] = e.target.value
                    onUpdate({ options: newOptions })
                  }}
                  className="flex-1 text-sm bg-transparent border-b border-transparent focus:border-primary outline-none py-1"
                />
                {(field.options?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onUpdate({ options: field.options?.filter((_, i) => i !== index) })
                    }}
                    className="p-0.5 text-muted-foreground/40 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })
              }}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 pl-6"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Form Editor ─────────────────────────────────────
export default function FormEditor({ onSave, onCancel, initialData }: FormEditorProps) {
  const [formTitle, setFormTitle] = useState(initialData?.title || "")
  const [formDescription, setFormDescription] = useState(initialData?.description || "")
  const [sections, setSections] = useState<FormSection[]>(() => {
    if (initialData?.sections?.length > 0) {
      return initialData.sections.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description || "",
        order: s.order || 1,
        fields: s.fields?.map((f: any) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          name: f.name,
          placeholder: f.placeholder || "",
          required: f.validation?.required || f.required || false,
          options: f.options || ["Option 1", "Option 2"],
          validation: f.validation || {},
          conditional: f.conditional || undefined,
          order: f.order || 1,
        })) || [],
      }))
    }
    return [{ id: "section_1", title: "Section 1", description: "", fields: [], order: 1 }]
  })

  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [slashCommand, setSlashCommand] = useState<{
    sectionId: string
    insertIndex: number
    position: { top: number; left: number }
    search: string
  } | null>(null)

  const [settings, setSettings] = useState<FormSettings>({
    allowMultipleSubmissions: initialData?.settings?.allowMultipleSubmissions ?? true,
    collectEmail: initialData?.settings?.collectEmail ?? false,
    showProgressBar: initialData?.settings?.showProgressBar ?? true,
    confirmationMessage: initialData?.settings?.confirmationMessage ?? "Thank you for your submission!",
    redirectUrl: initialData?.settings?.redirectUrl ?? "",
    submitButtonText: initialData?.settings?.submitButtonText ?? "Submit",
    closedMessage: initialData?.settings?.closedMessage ?? "This form is no longer accepting responses.",
    closeDate: initialData?.settings?.closeDate ?? "",
    maxResponses: initialData?.settings?.maxResponses ?? null,
    coverImage: initialData?.settings?.coverImage ?? "",
    primaryColor: initialData?.settings?.primaryColor ?? "#2563eb",
    notifyEmails: initialData?.settings?.notifyEmails ?? "",
  })

  const titleRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Focus title on mount if empty
  useEffect(() => {
    if (!formTitle && titleRef.current) titleRef.current.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Section/Field CRUD ─────────────────────────────────
  const addSection = () => {
    const s: FormSection = {
      id: `section_${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: "",
      fields: [],
      order: sections.length + 1,
    }
    setSections([...sections, s])
  }

  const updateSection = (id: string, updates: Partial<FormSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteSection = (id: string) => {
    if (sections.length <= 1) return
    setSections(sections.filter((s) => s.id !== id))
  }

  const addFieldAt = (sectionId: string, insertIndex: number, type: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: FIELD_TYPES.find((ft) => ft.value === type)?.label || "New field",
      name: `field_${Date.now()}`,
      placeholder: "",
      required: false,
      options: ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "MULTI_SELECT"].includes(type) ? ["Option 1", "Option 2"] : undefined,
      validation: getDefaultValidation(type),
      order: insertIndex + 1,
    }

    const newFields = [...section.fields]
    newFields.splice(insertIndex, 0, newField)
    newFields.forEach((f, i) => (f.order = i + 1))
    updateSection(sectionId, { fields: newFields })
    setSelectedField(newField.id)
    setSlashCommand(null)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setSections(
      sections.map((s) => ({
        ...s,
        fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
      }))
    )
  }

  const deleteField = (fieldId: string) => {
    setSections(
      sections.map((s) => ({
        ...s,
        fields: s.fields.filter((f) => f.id !== fieldId),
      }))
    )
    if (selectedField === fieldId) setSelectedField(null)
  }

  const moveField = (fieldId: string, direction: "up" | "down") => {
    setSections(
      sections.map((s) => {
        const idx = s.fields.findIndex((f) => f.id === fieldId)
        if (idx === -1) return s
        const target = direction === "up" ? idx - 1 : idx + 1
        if (target < 0 || target >= s.fields.length) return s
        const newFields = [...s.fields];
        [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]]
        newFields.forEach((f, i) => (f.order = i + 1))
        return { ...s, fields: newFields }
      })
    )
  }

  // ── Slash command trigger ──────────────────────────────
  const openSlashPalette = (sectionId: string, insertIndex: number, anchorEl?: HTMLElement) => {
    const rect = anchorEl?.getBoundingClientRect() || { top: 200, left: 400 }
    const editorRect = editorRef.current?.getBoundingClientRect() || { top: 0, left: 0 }
    setSlashCommand({
      sectionId,
      insertIndex,
      position: { top: rect.top - editorRect.top + 30, left: rect.left - editorRect.left },
      search: "",
    })
  }

  // ── Save ───────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        settings,
        sections: sections.map((s) => ({
          title: s.title,
          description: s.description,
          fields: s.fields.map((f) => ({
            type: f.type,
            label: f.label,
            name: f.name,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options,
            validation: { ...f.validation, required: f.required },
            conditional: f.conditional,
            order: f.order,
          })),
        })),
      }
      if (onSave) await onSave(formData)
    } catch (err) {
      console.error("Error saving form:", err)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Preview Mode ───────────────────────────────────────
  if (previewMode) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Preview</span>
          <Button size="sm" variant="outline" onClick={() => setPreviewMode(false)}>
            <Edit className="w-3.5 h-3.5 mr-1.5" /> Back to editor
          </Button>
        </div>
        <div className="max-w-2xl mx-auto py-12 px-4">
          {settings.coverImage && (
            <div className="h-48 rounded-xl overflow-hidden mb-6">
              <img src={settings.coverImage} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="bg-background rounded-xl border shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-1">{formTitle || "Untitled Form"}</h1>
            {formDescription && <p className="text-muted-foreground mb-6">{formDescription}</p>}
            {sections.map((section, si) => (
              <div key={section.id} className="mb-8">
                {sections.length > 1 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
                  </div>
                )}
                <div className="space-y-5">
                  {section.fields.map((field) => (
                    <div key={field.id}>
                      <Label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="mt-1.5">
                        {field.type === "SHORT_TEXT" && <Input placeholder={field.placeholder} disabled />}
                        {field.type === "LONG_TEXT" && <Textarea placeholder={field.placeholder} disabled rows={3} />}
                        {field.type === "EMAIL" && <Input type="email" placeholder={field.placeholder || "email@example.com"} disabled />}
                        {field.type === "NUMBER" && <Input type="number" placeholder={field.placeholder} disabled />}
                        {field.type === "PHONE" && <Input type="tel" placeholder={field.placeholder || "+250..."} disabled />}
                        {field.type === "URL" && <Input type="url" placeholder={field.placeholder || "https://..."} disabled />}
                        {field.type === "DATE" && <Input type="date" disabled />}
                        {field.type === "TIME" && <Input type="time" disabled />}
                        {field.type === "FILE_UPLOAD" && <Input type="file" disabled />}
                        {field.type === "RATING" && (
                          <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-6 h-6 text-muted-foreground/30" />)}</div>
                        )}
                        {field.type === "LINEAR_SCALE" && (
                          <div className="flex gap-2">{[1,2,3,4,5].map(n => (
                            <div key={n} className="w-10 h-10 rounded-full border flex items-center justify-center text-sm">{n}</div>
                          ))}</div>
                        )}
                        {(field.type === "MULTIPLE_CHOICE") && (
                          <div className="space-y-2 mt-1">{field.options?.map((o, i) => (
                            <label key={i} className="flex items-center gap-2 text-sm"><input type="radio" disabled />{o}</label>
                          ))}</div>
                        )}
                        {(field.type === "CHECKBOXES" || field.type === "MULTI_SELECT") && (
                          <div className="space-y-2 mt-1">{field.options?.map((o, i) => (
                            <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled />{o}</label>
                          ))}</div>
                        )}
                        {field.type === "DROPDOWN" && (
                          <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" disabled>
                            <option>Select an option</option>
                            {field.options?.map((o, i) => <option key={i}>{o}</option>)}
                          </select>
                        )}
                        {field.type === "MATRIX" && (
                          <div className="border rounded p-3 text-sm text-muted-foreground">Matrix grid</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button className="w-full mt-4" style={{ backgroundColor: settings.primaryColor }} disabled>
              {settings.submitButtonText}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Settings Panel ─────────────────────────────────────
  if (showSettings) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Form Settings</span>
          <Button size="sm" variant="outline" onClick={() => setShowSettings(false)}>
            <X className="w-3.5 h-3.5 mr-1.5" /> Close
          </Button>
        </div>
        <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
          {/* Branding */}
          <div className="bg-background rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">Branding</h3>
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-32"
                />
              </div>
            </div>
            <div>
              <Label>Cover Image URL</Label>
              <Input
                value={settings.coverImage}
                onChange={(e) => setSettings({ ...settings, coverImage: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Submission Rules */}
          <div className="bg-background rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">Submissions</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Allow multiple submissions</p>
                <p className="text-xs text-muted-foreground">Let the same person submit more than once</p>
              </div>
              <Switch
                checked={settings.allowMultipleSubmissions}
                onCheckedChange={(v) => setSettings({ ...settings, allowMultipleSubmissions: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Collect email</p>
                <p className="text-xs text-muted-foreground">Require respondent email</p>
              </div>
              <Switch
                checked={settings.collectEmail}
                onCheckedChange={(v) => setSettings({ ...settings, collectEmail: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show progress bar</p>
                <p className="text-xs text-muted-foreground">Show completion progress for multi-section forms</p>
              </div>
              <Switch
                checked={settings.showProgressBar}
                onCheckedChange={(v) => setSettings({ ...settings, showProgressBar: v })}
              />
            </div>
            <div>
              <Label>Max responses</Label>
              <Input
                type="number"
                value={settings.maxResponses ?? ""}
                onChange={(e) => setSettings({ ...settings, maxResponses: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Close date</Label>
              <Input
                type="datetime-local"
                value={settings.closeDate}
                onChange={(e) => setSettings({ ...settings, closeDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Submit button text</Label>
              <Input
                value={settings.submitButtonText}
                onChange={(e) => setSettings({ ...settings, submitButtonText: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* After Submission */}
          <div className="bg-background rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">After Submission</h3>
            <div>
              <Label>Confirmation message</Label>
              <Textarea
                value={settings.confirmationMessage}
                onChange={(e) => setSettings({ ...settings, confirmationMessage: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Redirect URL (optional)</Label>
              <Input
                value={settings.redirectUrl}
                onChange={(e) => setSettings({ ...settings, redirectUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Closed form message</Label>
              <Input
                value={settings.closedMessage}
                onChange={(e) => setSettings({ ...settings, closedMessage: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-background rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">Notifications</h3>
            <div>
              <Label>Email on new submission</Label>
              <Input
                value={settings.notifyEmails}
                onChange={(e) => setSettings({ ...settings, notifyEmails: e.target.value })}
                placeholder="email@example.com, team@example.com"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated email addresses</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Editor Layout ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30" ref={editorRef}>
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button size="sm" variant="ghost" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">{formTitle || "Untitled"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-1.5" /> Settings
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPreviewMode(true)}>
              <Eye className="w-4 h-4 mr-1.5" /> Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="max-w-2xl mx-auto py-12 px-4 relative">
        {/* Form Title & Description */}
        <div className="mb-8">
          <input
            ref={titleRef}
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Untitled form"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
          />
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Add a description..."
            rows={1}
            className="w-full mt-2 text-base text-muted-foreground bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Sections */}
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-10">
            {/* Section Header */}
            {sections.length > 1 && (
              <div className="flex items-center gap-2 mb-4 group">
                <div className="flex-1">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="text-lg font-semibold bg-transparent border-none outline-none w-full"
                  />
                  <input
                    type="text"
                    value={section.description || ""}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    placeholder="Section description..."
                    className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full"
                  />
                </div>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteSection(section.id)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Add block at top of section */}
            <AddBlockButton onClick={(e?: any) => openSlashPalette(section.id, 0, e?.currentTarget)} />

            {/* Fields */}
            {section.fields.map((field, fieldIndex) => (
              <React.Fragment key={field.id}>
                <FieldBlock
                  field={field}
                  isSelected={selectedField === field.id}
                  onSelect={() => setSelectedField(field.id)}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onDelete={() => deleteField(field.id)}
                  onMoveUp={() => moveField(field.id, "up")}
                  onMoveDown={() => moveField(field.id, "down")}
                  canMoveUp={fieldIndex > 0}
                  canMoveDown={fieldIndex < section.fields.length - 1}
                />
                <AddBlockButton onClick={(e?: any) => openSlashPalette(section.id, fieldIndex + 1, e?.currentTarget)} />
              </React.Fragment>
            ))}

            {/* Empty state */}
            {section.fields.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm mb-3">No fields yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => openSlashPalette(section.id, 0, e.currentTarget)}
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add first block
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Add Section */}
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="w-4 h-4 mr-1.5" /> Add section
          </Button>
        </div>

        {/* Slash Command Palette */}
        {slashCommand && (
          <SlashCommandPalette
            position={slashCommand.position}
            search={slashCommand.search}
            onSelect={(type) => addFieldAt(slashCommand.sectionId, slashCommand.insertIndex, type)}
            onClose={() => setSlashCommand(null)}
          />
        )}
      </div>
    </div>
  )
}
