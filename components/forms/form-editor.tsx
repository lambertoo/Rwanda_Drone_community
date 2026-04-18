"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import ActionsBuilder from "@/components/forms/actions-builder"
import FormSettingsPanel from "@/components/forms/form-settings-panel"
import type { ActionRule } from "@/lib/form-actions"
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
  AtSign,
  Phone,
  CheckSquare,
  Circle,
  ChevronDown,
  Settings,
  ArrowUp,
  ArrowDown,
  Pencil,
  X,
  GripVertical,
  Star,
  Image as ImageIcon,
  Type,
  Clock,
  Link2,
  Grid3X3,
  Sliders,
  ListChecks,
  MapPin,
  CreditCard,
  Heading1,
  Minus,
  SeparatorHorizontal,
  EyeOff,
  Globe,
  Calculator,
  Target,
  PenLine,
  Award,
  AlignJustify,
  CircleDot,
  CheckCheck,
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
  actions?: any
  order: number
}

interface FormSection {
  id: string
  title: string
  description?: string
  fields: FormField[]
  order: number
  actions?: ActionRule[] | null
  isActive?: boolean
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

// ── Layout block types (no required toggle) ──────────────
const LAYOUT_TYPES = new Set([
  "HEADING",
  "PARAGRAPH",
  "DIVIDER",
  "IMAGE",
  "PAGE_BREAK",
])

// ── Choice types (need options editing) ──────────────────
const CHOICE_TYPES = new Set([
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "MULTI_SELECT",
  "RANKING",
])

// ── Field Type Config (organized Tally-style) ────────────
const FIELD_TYPES: {
  value: string
  label: string
  icon: any
  category: "Questions" | "Layout blocks" | "Advanced blocks"
}[] = [
  // Questions
  { value: "SHORT_TEXT", label: "Short Answer", icon: Type, category: "Questions" },
  { value: "LONG_TEXT", label: "Long Answer", icon: AlignJustify, category: "Questions" },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: CircleDot, category: "Questions" },
  { value: "CHECKBOXES", label: "Checkboxes", icon: CheckSquare, category: "Questions" },
  { value: "DROPDOWN", label: "Dropdown", icon: ChevronDown, category: "Questions" },
  { value: "MULTI_SELECT", label: "Multi Select", icon: CheckCheck, category: "Questions" },
  { value: "NUMBER", label: "Number", icon: Hash, category: "Questions" },
  { value: "EMAIL", label: "Email", icon: AtSign, category: "Questions" },
  { value: "PHONE", label: "Phone Number", icon: Phone, category: "Questions" },
  { value: "URL", label: "Link (URL)", icon: Link2, category: "Questions" },
  { value: "FILE_UPLOAD", label: "File Upload", icon: Upload, category: "Questions" },
  { value: "DATE", label: "Date", icon: Calendar, category: "Questions" },
  { value: "TIME", label: "Time", icon: Clock, category: "Questions" },
  { value: "LINEAR_SCALE", label: "Linear Scale", icon: Sliders, category: "Questions" },
  { value: "MATRIX", label: "Matrix / Likert", icon: Grid3X3, category: "Questions" },
  { value: "RATING", label: "Star Rating", icon: Star, category: "Questions" },
  { value: "RANKING", label: "Ranking", icon: Award, category: "Questions" },
  { value: "SIGNATURE", label: "Signature", icon: PenLine, category: "Questions" },
  { value: "GPS_COORDINATES", label: "GPS Coordinates", icon: MapPin, category: "Questions" },
  { value: "NATIONAL_ID", label: "National ID", icon: CreditCard, category: "Questions" },

  // Layout blocks
  { value: "HEADING", label: "Heading", icon: Heading1, category: "Layout blocks" },
  { value: "PARAGRAPH", label: "Text / Description", icon: Type, category: "Layout blocks" },
  { value: "DIVIDER", label: "Divider", icon: Minus, category: "Layout blocks" },
  { value: "IMAGE", label: "Image", icon: ImageIcon, category: "Layout blocks" },
  { value: "PAGE_BREAK", label: "Page Break", icon: SeparatorHorizontal, category: "Layout blocks" },

  // Advanced blocks
  { value: "HIDDEN_FIELD", label: "Hidden Field", icon: EyeOff, category: "Advanced blocks" },
  { value: "COUNTRY", label: "Country", icon: Globe, category: "Advanced blocks" },
  { value: "CALCULATED", label: "Calculated Field", icon: Calculator, category: "Advanced blocks" },
  { value: "SCORE", label: "Score (Quiz)", icon: Target, category: "Advanced blocks" },
]

const FIELD_ICON_MAP: Record<string, any> = Object.fromEntries(
  FIELD_TYPES.map((ft) => [ft.value, ft.icon])
)

const CATEGORY_ORDER = ["Questions", "Layout blocks", "Advanced blocks"]

const CATEGORY_COLORS: Record<string, string> = {
  Questions: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  "Layout blocks": "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  "Advanced blocks": "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
}

// Auto-resizing textarea: wraps long text and grows vertically as the user types,
// so form / section / field descriptions never require horizontal scrolling.
const AutoTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function AutoTextarea({ onInput, onChange, value, className, ...rest }, forwardedRef) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  const setRefs = (el: HTMLTextAreaElement | null) => {
    innerRef.current = el
    if (typeof forwardedRef === 'function') forwardedRef(el)
    else if (forwardedRef) (forwardedRef as any).current = el
  }
  const resize = () => {
    const el = innerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
  useEffect(() => {
    resize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <textarea
      ref={setRefs}
      rows={1}
      value={value as string | number | readonly string[] | undefined}
      onChange={(e) => {
        onChange?.(e)
        resize()
      }}
      onInput={(e) => {
        onInput?.(e)
        resize()
      }}
      className={`resize-none overflow-hidden ${className ?? ''}`}
      {...rest}
    />
  )
})

// Path colour themes so sections gated by CS4 are visually distinct in the editor.
// Matches the palette used by FormFlowView.
function getSectionPathTheme(section: any): {
  border: string
  bg: string
  label: string | null
  dot: string
  badgeClass: string
} {
  const actions = Array.isArray(section?.actions) ? (section.actions as any[]) : []
  if (actions.length === 0) {
    return { border: 'border-l-slate-300', bg: '', label: 'Always shown', dot: 'bg-slate-400', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
  }
  // Inspect any clause values and dependent field names across all rules
  const blob = JSON.stringify(actions).toLowerCase()
  const dependsOnCs4 = blob.includes('"field":"cs4_value_chain"')
  if (blob.includes('upstream')) return { border: 'border-l-indigo-400', bg: 'bg-indigo-50/30 dark:bg-indigo-950/10', label: 'Upstream path', dot: 'bg-indigo-500', badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' }
  if (blob.includes('midstream')) return { border: 'border-l-emerald-400', bg: 'bg-emerald-50/30 dark:bg-emerald-950/10', label: 'Midstream path', dot: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' }
  if (blob.includes('investor')) return { border: 'border-l-amber-400', bg: 'bg-amber-50/30 dark:bg-amber-950/10', label: 'Downstream · Investor', dot: 'bg-amber-500', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' }
  if (blob.includes('end-user') || blob.includes('advocacy') || blob.includes('downstream')) return { border: 'border-l-rose-400', bg: 'bg-rose-50/30 dark:bg-rose-950/10', label: 'Downstream · End-user / Advocacy', dot: 'bg-rose-500', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' }
  if (!dependsOnCs4) {
    return { border: 'border-l-violet-400', bg: 'bg-violet-50/30 dark:bg-violet-950/10', label: 'Nested branch', dot: 'bg-violet-500', badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200' }
  }
  return { border: 'border-l-slate-300', bg: '', label: 'Conditional', dot: 'bg-slate-400', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
}

// Walk a condition group tree and collect every field name it references.
function collectReferencedFields(node: any, acc: Set<string>) {
  if (!node) return
  if (Array.isArray(node.clauses)) {
    for (const c of node.clauses) collectReferencedFields(c, acc)
  } else if (typeof node.field === 'string') {
    acc.add(node.field)
  }
}

// Build a map of fieldName -> { sections: number, fields: Array<{ label, sectionTitle }> }
// describing who references that field in their action logic.
function buildReferenceMap(sections: any[]) {
  type Ref = { label: string; sectionTitle: string; kind: 'section' | 'field' }
  const refs = new Map<string, Ref[]>()

  const add = (name: string, ref: Ref) => {
    if (!refs.has(name)) refs.set(name, [])
    refs.get(name)!.push(ref)
  }

  for (const s of sections) {
    const sectionTitle = s.title || 'Untitled section'
    const sectionActions: any[] = Array.isArray(s.actions) ? s.actions : []
    for (const rule of sectionActions) {
      const set = new Set<string>()
      collectReferencedFields(rule.when, set)
      for (const name of set) add(name, { label: sectionTitle, sectionTitle, kind: 'section' })
    }
    for (const f of s.fields || []) {
      const fieldActions: any[] = Array.isArray(f.actions) ? f.actions : []
      for (const rule of fieldActions) {
        const set = new Set<string>()
        collectReferencedFields(rule.when, set)
        for (const name of set) add(name, { label: f.label || f.name, sectionTitle, kind: 'field' })
      }
    }
  }
  return refs
}

function getFieldIcon(type: string) {
  const Icon = FIELD_ICON_MAP[type] || Type
  return <Icon className="w-4 h-4" />
}

function getDefaultValidation(type: string) {
  if (type === "FILE_UPLOAD") {
    return {
      required: false,
      allowedFileTypes: ["pdf", "jpg", "png", "docx"],
      maxFileSize: 10485760,
      maxFiles: 1,
    }
  }
  if (type === "LINEAR_SCALE") {
    return {
      required: false,
      startValue: 1,
      endValue: 5,
      step: 1,
      leftLabel: "",
      rightLabel: "",
    }
  }
  if (type === "MATRIX") {
    return {
      required: false,
      rows: ["Row 1", "Row 2"],
      columns: ["Column 1", "Column 2", "Column 3"],
      multipleSelection: false,
    }
  }
  if (type === "RATING") {
    return { required: false, maxStars: 5 }
  }
  if (type === "HEADING") {
    return { headingLevel: 2 }
  }
  if (type === "IMAGE") {
    return { imageUrl: "", altText: "" }
  }
  if (type === "HIDDEN_FIELD") {
    return { defaultValue: "" }
  }
  return { required: false }
}

function getDefaultOptions(type: string): string[] | undefined {
  if (
    ["MULTIPLE_CHOICE", "CHECKBOXES", "DROPDOWN", "MULTI_SELECT"].includes(type)
  ) {
    return ["Option 1", "Option 2"]
  }
  if (type === "RANKING") {
    return ["Item 1", "Item 2", "Item 3"]
  }
  return undefined
}

function getDefaultLabel(type: string): string {
  const ft = FIELD_TYPES.find((f) => f.value === type)
  if (type === "HEADING") return "Heading"
  if (type === "PARAGRAPH") return "Add your description here..."
  if (type === "DIVIDER") return ""
  if (type === "PAGE_BREAK") return ""
  if (type === "IMAGE") return ""
  return ft?.label || "New field"
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
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const filtered = FIELD_TYPES.filter(
    (ft) =>
      ft.label.toLowerCase().includes(search.toLowerCase()) ||
      ft.value.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setHighlightedIndex(0)
  }, [search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
      }
      if (e.key === "Enter") {
        e.preventDefault()
        if (filtered[highlightedIndex]) {
          onSelect(filtered[highlightedIndex].value)
        }
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [onClose, filtered, highlightedIndex, onSelect])

  let globalIndex = 0

  return (
    <div
      ref={ref}
      className="absolute z-50 w-80 bg-popover border rounded-xl shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-3 border-b bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
          Add a block
        </p>
        {search && (
          <p className="text-xs text-muted-foreground px-1 mt-1">
            Searching: &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto p-1.5">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground text-center">
            No blocks found
          </p>
        )}
        {CATEGORY_ORDER.map((cat) => {
          const items = filtered.filter((ft) => ft.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat} className="mb-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 pt-3 pb-1.5">
                {cat}
              </p>
              {items.map((ft) => {
                const Icon = ft.icon
                const thisIndex = globalIndex++
                const isHighlighted = thisIndex === highlightedIndex
                const colorClass =
                  CATEGORY_COLORS[cat] || "bg-muted text-muted-foreground"
                return (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => onSelect(ft.value)}
                    onMouseEnter={() => setHighlightedIndex(thisIndex)}
                    className={`flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      isHighlighted ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{ft.label}</span>
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
function AddBlockButton({ onClick }: { onClick: (e?: any) => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative h-6 flex items-center justify-center group"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div
        className={`absolute inset-x-0 top-1/2 border-t border-dashed border-border transition-opacity ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        type="button"
        onClick={(e) => onClick(e)}
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
  allSections,
  currentSectionIndex,
  referencedBy,
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
  allSections: FormSection[]
  currentSectionIndex: number
  referencedBy: Array<{ label: string; sectionTitle: string; kind: 'section' | 'field' }>
}) {
  const [editingLabel, setEditingLabel] = useState(false)
  const [hovered, setHovered] = useState(false)
  const labelRef = useRef<HTMLTextAreaElement>(null)
  const headingRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingLabel && labelRef.current) {
      labelRef.current.focus()
      labelRef.current.select()
    }
  }, [editingLabel])

  const isLayout = LAYOUT_TYPES.has(field.type)
  const needsOptions = CHOICE_TYPES.has(field.type)

  // ── DIVIDER layout block ──
  if (field.type === "DIVIDER") {
    return (
      <div
        className={`group relative rounded-lg border transition-all py-2 ${
          isSelected
            ? "border-primary/50 bg-primary/[0.02] shadow-sm ring-1 ring-primary/20"
            : "border-transparent hover:border-border"
        }`}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`absolute -left-10 top-2 flex flex-col items-center gap-0.5 transition-opacity ${
            hovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4">
          <div
            className={`flex items-center justify-end mb-1 transition-opacity ${
              hovered || isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1">
              {canMoveUp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {canMoveDown && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <hr className="border-t border-border" />
        </div>
      </div>
    )
  }

  // ── PAGE_BREAK layout block ──
  if (field.type === "PAGE_BREAK") {
    return (
      <div
        className={`group relative rounded-lg border transition-all py-2 ${
          isSelected
            ? "border-primary/50 bg-primary/[0.02] shadow-sm ring-1 ring-primary/20"
            : "border-transparent hover:border-border"
        }`}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`absolute -left-10 top-2 flex flex-col items-center gap-0.5 transition-opacity ${
            hovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4">
          <div
            className={`flex items-center justify-end mb-1 transition-opacity ${
              hovered || isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1">
              {canMoveUp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {canMoveDown && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <SeparatorHorizontal className="w-3.5 h-3.5" />
              Page break
            </span>
            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
          </div>
        </div>
      </div>
    )
  }

  // ── HEADING layout block ──
  if (field.type === "HEADING") {
    const headingLevel = field.validation?.headingLevel || 2
    const headingClass =
      headingLevel === 1
        ? "text-2xl font-bold"
        : headingLevel === 2
          ? "text-xl font-semibold"
          : "text-lg font-medium"

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
        <div
          className={`absolute -left-10 top-3 flex flex-col items-center gap-0.5 transition-opacity ${
            hovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <div
            className={`flex items-center justify-between mb-2 transition-opacity ${
              hovered || isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                <Heading1 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Heading
              </span>
            </div>
            <div className="flex items-center gap-1">
              {isSelected && (
                <div className="flex items-center gap-0.5 mr-2">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate({
                          validation: {
                            ...field.validation,
                            headingLevel: level,
                          },
                        })
                      }}
                      className={`px-1.5 py-0.5 text-xs rounded font-medium transition-colors ${
                        headingLevel === level
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      H{level}
                    </button>
                  ))}
                </div>
              )}
              {canMoveUp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {canMoveDown && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <AutoTextarea
            ref={headingRef as any}
            value={field.label}
            onChange={(e) => onUpdate({ label: (e.target as HTMLTextAreaElement).value })}
            placeholder="Heading text..."
            className={`w-full bg-transparent border-none outline-none placeholder:text-muted-foreground/40 leading-tight ${headingClass}`}
          />
        </div>
      </div>
    )
  }

  // ── PARAGRAPH layout block ──
  if (field.type === "PARAGRAPH") {
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
        <div
          className={`absolute -left-10 top-3 flex flex-col items-center gap-0.5 transition-opacity ${
            hovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <div
            className={`flex items-center justify-between mb-2 transition-opacity ${
              hovered || isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                <Type className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Text / Description
              </span>
            </div>
            <div className="flex items-center gap-1">
              {canMoveUp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {canMoveDown && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Type your description text here..."
            rows={3}
            className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40"
          />
        </div>
      </div>
    )
  }

  // ── IMAGE layout block ──
  if (field.type === "IMAGE") {
    const imageUrl = field.validation?.imageUrl || ""
    const altText = field.validation?.altText || ""

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
        <div
          className={`absolute -left-10 top-3 flex flex-col items-center gap-0.5 transition-opacity ${
            hovered || isSelected ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            type="button"
            className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <div
            className={`flex items-center justify-between mb-2 transition-opacity ${
              hovered || isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Image
              </span>
            </div>
            <div className="flex items-center gap-1">
              {canMoveUp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}
              {canMoveDown && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {imageUrl ? (
            <div className="rounded-lg overflow-hidden border bg-muted/20">
              <img
                src={imageUrl}
                alt={altText}
                className="w-full max-h-64 object-contain"
              />
            </div>
          ) : (
            <div className="h-32 rounded-lg border-2 border-dashed bg-muted/10 flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">Add image URL below</span>
            </div>
          )}
          {isSelected && (
            <div className="mt-3 space-y-2 pointer-events-auto">
              <Input
                value={imageUrl}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      imageUrl: e.target.value,
                    },
                  })
                }
                placeholder="Image URL (https://...)"
                className="text-sm"
              />
              <Input
                value={altText}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      altText: e.target.value,
                    },
                  })
                }
                placeholder="Alt text (optional)"
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Default field block (all question types + advanced) ──
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
      {/* Drag handle */}
      <div
        className={`absolute -left-10 top-3 flex flex-col items-center gap-0.5 transition-opacity ${
          hovered || isSelected ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Field type badge + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded flex items-center justify-center ${
                field.type === "HIDDEN_FIELD"
                  ? "bg-amber-50 dark:bg-amber-950"
                  : "bg-muted"
              }`}
            >
              {getFieldIcon(field.type)}
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {FIELD_TYPES.find((ft) => ft.value === field.type)?.label ||
                field.type}
            </span>
            {field.type === "HIDDEN_FIELD" && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 text-amber-600 border-amber-300"
              >
                Hidden
              </Badge>
            )}
          </div>
          <div
            className={`flex items-center gap-1 transition-opacity ${
              hovered || isSelected ? "opacity-100" : "opacity-0"
            }`}
          >
            {!isLayout && (
              <div className="flex items-center gap-1 mr-2">
                <span className="text-xs text-muted-foreground">Required</span>
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                  className="scale-75"
                />
              </div>
            )}
            {canMoveUp && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveUp()
                }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {canMoveDown && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveDown()
                }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline label editing */}
        {editingLabel ? (
          <AutoTextarea
            ref={labelRef as any}
            value={field.label}
            onChange={(e) => onUpdate({ label: (e.target as HTMLTextAreaElement).value })}
            onBlur={() => setEditingLabel(false)}
            onKeyDown={(e) => {
              // Blur on Enter without Shift (Shift+Enter inserts a newline)
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                setEditingLabel(false)
              }
            }}
            className="text-base font-medium bg-transparent border-none outline-none w-full p-0 focus:ring-0 leading-snug"
          />
        ) : (
          <h3
            className="text-base font-medium cursor-text hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setEditingLabel(true)
            }}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        )}

        {/* Inline placeholder (not for hidden fields) */}
        {isSelected && field.type !== "HIDDEN_FIELD" && !isLayout && (
          <input
            type="text"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Add placeholder text..."
            className="mt-1 text-sm text-muted-foreground bg-transparent border-none outline-none w-full p-0 focus:ring-0 italic"
          />
        )}

        {/* Hidden field: default value input */}
        {field.type === "HIDDEN_FIELD" && (
          <div className="mt-3 pointer-events-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <EyeOff className="w-3.5 h-3.5" />
              <span>This field is not visible to respondents</span>
            </div>
            <Input
              value={field.validation?.defaultValue || ""}
              onChange={(e) =>
                onUpdate({
                  validation: {
                    ...field.validation,
                    defaultValue: e.target.value,
                  },
                })
              }
              placeholder="Default value (pre-filled)"
              className="text-sm"
            />
          </div>
        )}

        {/* Field preview */}
        {!isLayout && field.type !== "HIDDEN_FIELD" && (
          <div className="mt-3 pointer-events-none opacity-60">
            {field.type === "SHORT_TEXT" && (
              <div className="h-9 rounded-md border bg-muted/20" />
            )}
            {field.type === "LONG_TEXT" && (
              <div className="h-20 rounded-md border bg-muted/20" />
            )}
            {field.type === "EMAIL" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3">
                <AtSign className="w-4 h-4 text-muted-foreground/40" />
              </div>
            )}
            {field.type === "NUMBER" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3">
                <Hash className="w-4 h-4 text-muted-foreground/40" />
              </div>
            )}
            {field.type === "PHONE" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3">
                <Phone className="w-4 h-4 text-muted-foreground/40" />
              </div>
            )}
            {field.type === "URL" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3">
                <Link2 className="w-4 h-4 text-muted-foreground/40" />
              </div>
            )}
            {field.type === "DATE" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3">
                <Calendar className="w-4 h-4 text-muted-foreground/40" />
              </div>
            )}
            {field.type === "TIME" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3">
                <Clock className="w-4 h-4 text-muted-foreground/40" />
              </div>
            )}
            {field.type === "FILE_UPLOAD" && (
              <div className="h-16 rounded-md border-2 border-dashed bg-muted/10 flex items-center justify-center gap-2 text-muted-foreground/40">
                <Upload className="w-4 h-4" />
                <span className="text-xs">Upload file</span>
              </div>
            )}
            {field.type === "RATING" && (
              <div className="flex gap-1">
                {Array.from({
                  length: field.validation?.maxStars || 5,
                }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-muted-foreground/30" />
                ))}
              </div>
            )}
            {field.type === "LINEAR_SCALE" && (() => {
              const start = field.validation?.startValue ?? 1
              const end = field.validation?.endValue ?? 5
              const leftLabel = field.validation?.leftLabel || ""
              const rightLabel = field.validation?.rightLabel || ""
              const values = []
              for (let i = start; i <= end; i++) values.push(i)
              return (
                <div className="flex items-center gap-2">
                  {leftLabel && (
                    <span className="text-xs text-muted-foreground/60">{leftLabel}</span>
                  )}
                  <div className="flex gap-1.5">
                    {values.map((n) => (
                      <div
                        key={n}
                        className="w-8 h-8 rounded-full border flex items-center justify-center text-xs text-muted-foreground/50"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  {rightLabel && (
                    <span className="text-xs text-muted-foreground/60">{rightLabel}</span>
                  )}
                </div>
              )
            })()}
            {field.type === "MATRIX" && (() => {
              const rows = field.validation?.rows || ["Row 1", "Row 2"]
              const columns = field.validation?.columns || ["Col 1", "Col 2", "Col 3"]
              return (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="p-2 text-left font-medium text-muted-foreground"></th>
                        {columns.map((col: string, ci: number) => (
                          <th
                            key={ci}
                            className="p-2 text-center font-medium text-muted-foreground"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: string, ri: number) => (
                        <tr key={ri} className="border-t">
                          <td className="p-2 text-muted-foreground">{row}</td>
                          {columns.map((_: string, ci: number) => (
                            <td key={ci} className="p-2 text-center">
                              <Circle className="w-4 h-4 text-muted-foreground/30 inline-block" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
            {field.type === "SIGNATURE" && (
              <div className="h-24 rounded-lg border-2 border-dashed bg-muted/10 flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
                <PenLine className="w-6 h-6" />
                <span className="text-xs">Sign here</span>
              </div>
            )}
            {field.type === "GPS_COORDINATES" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3 gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">
                  Lat, Long
                </span>
              </div>
            )}
            {field.type === "NATIONAL_ID" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3 gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">
                  National ID number
                </span>
              </div>
            )}
            {field.type === "COUNTRY" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3 gap-2">
                <Globe className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">
                  Select country...
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto" />
              </div>
            )}
            {field.type === "CALCULATED" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3 gap-2">
                <Calculator className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">
                  Calculated value
                </span>
              </div>
            )}
            {field.type === "SCORE" && (
              <div className="h-9 rounded-md border bg-muted/20 flex items-center px-3 gap-2">
                <Target className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/40">
                  Score points
                </span>
              </div>
            )}
          </div>
        )}

        {/* Options editing for choice-based fields */}
        {isSelected && needsOptions && (
          <div className="mt-3 space-y-1.5 pointer-events-auto">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                {field.type === "MULTIPLE_CHOICE" ? (
                  <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                ) : field.type === "RANKING" ? (
                  <span className="w-5 text-xs text-muted-foreground font-medium text-right flex-shrink-0">
                    {index + 1}.
                  </span>
                ) : field.type === "DROPDOWN" ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
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
                      onUpdate({
                        options: field.options?.filter((_, i) => i !== index),
                      })
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
                const prefix =
                  field.type === "RANKING" ? "Item" : "Option"
                onUpdate({
                  options: [
                    ...(field.options || []),
                    `${prefix} ${(field.options?.length || 0) + 1}`,
                  ],
                })
              }}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 pl-6"
            >
              <Plus className="w-3.5 h-3.5" /> Add{" "}
              {field.type === "RANKING" ? "item" : "option"}
            </button>
          </div>
        )}

        {/* Inline settings for specific field types */}
        {isSelected && field.type === "LINEAR_SCALE" && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-3 pointer-events-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scale Settings
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Start</Label>
                <Input
                  type="number"
                  value={field.validation?.startValue ?? 1}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        startValue: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">End</Label>
                <Input
                  type="number"
                  value={field.validation?.endValue ?? 5}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        endValue: parseInt(e.target.value) || 5,
                      },
                    })
                  }
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Step</Label>
                <Input
                  type="number"
                  value={field.validation?.step ?? 1}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        step: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Left label</Label>
                <Input
                  value={field.validation?.leftLabel || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        leftLabel: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Not at all"
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Right label</Label>
                <Input
                  value={field.validation?.rightLabel || ""}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        rightLabel: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Very much"
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* RATING settings */}
        {isSelected && field.type === "RATING" && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-3 pointer-events-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rating Settings
            </p>
            <div>
              <Label className="text-xs">Number of stars</Label>
              <div className="flex items-center gap-2 mt-1">
                {[3, 4, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onUpdate({
                        validation: { ...field.validation, maxStars: n },
                      })
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      (field.validation?.maxStars || 5) === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MATRIX settings */}
        {isSelected && field.type === "MATRIX" && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-3 pointer-events-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Matrix Settings
            </p>
            <div>
              <Label className="text-xs">Rows</Label>
              <div className="space-y-1 mt-1">
                {(field.validation?.rows || ["Row 1", "Row 2"]).map(
                  (row: string, ri: number) => (
                    <div key={ri} className="flex items-center gap-1.5">
                      <Input
                        value={row}
                        onChange={(e) => {
                          const newRows = [
                            ...(field.validation?.rows || ["Row 1", "Row 2"]),
                          ]
                          newRows[ri] = e.target.value
                          onUpdate({
                            validation: { ...field.validation, rows: newRows },
                          })
                        }}
                        className="h-7 text-xs"
                      />
                      {(field.validation?.rows || []).length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            const newRows = (
                              field.validation?.rows || []
                            ).filter((_: string, i: number) => i !== ri)
                            onUpdate({
                              validation: {
                                ...field.validation,
                                rows: newRows,
                              },
                            })
                          }}
                          className="p-0.5 text-muted-foreground/50 hover:text-red-500 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const rows = field.validation?.rows || ["Row 1", "Row 2"]
                    onUpdate({
                      validation: {
                        ...field.validation,
                        rows: [...rows, `Row ${rows.length + 1}`],
                      },
                    })
                  }}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add row
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs">Columns</Label>
              <div className="space-y-1 mt-1">
                {(
                  field.validation?.columns || ["Col 1", "Col 2", "Col 3"]
                ).map((col: string, ci: number) => (
                  <div key={ci} className="flex items-center gap-1.5">
                    <Input
                      value={col}
                      onChange={(e) => {
                        const newCols = [
                          ...(field.validation?.columns || [
                            "Col 1",
                            "Col 2",
                            "Col 3",
                          ]),
                        ]
                        newCols[ci] = e.target.value
                        onUpdate({
                          validation: {
                            ...field.validation,
                            columns: newCols,
                          },
                        })
                      }}
                      className="h-7 text-xs"
                    />
                    {(field.validation?.columns || []).length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const newCols = (
                            field.validation?.columns || []
                          ).filter((_: string, i: number) => i !== ci)
                          onUpdate({
                            validation: {
                              ...field.validation,
                              columns: newCols,
                            },
                          })
                        }}
                        className="p-0.5 text-muted-foreground/50 hover:text-red-500 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const cols = field.validation?.columns || [
                      "Col 1",
                      "Col 2",
                      "Col 3",
                    ]
                    onUpdate({
                      validation: {
                        ...field.validation,
                        columns: [...cols, `Column ${cols.length + 1}`],
                      },
                    })
                  }}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add column
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">Multiple selection</p>
                <p className="text-[10px] text-muted-foreground">
                  Allow selecting multiple options per row
                </p>
              </div>
              <Switch
                checked={field.validation?.multipleSelection || false}
                onCheckedChange={(v) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      multipleSelection: v,
                    },
                  })
                }
                className="scale-75"
              />
            </div>
          </div>
        )}

        {/* FILE_UPLOAD settings */}
        {isSelected && field.type === "FILE_UPLOAD" && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-3 pointer-events-auto">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Upload Settings
            </p>
            <div>
              <Label className="text-xs">
                Allowed file types (comma-separated)
              </Label>
              <Input
                value={
                  (field.validation?.allowedFileTypes || []).join(", ") || ""
                }
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...field.validation,
                      allowedFileTypes: e.target.value
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="pdf, jpg, png, docx"
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Max file size (MB)</Label>
                <Input
                  type="number"
                  value={
                    Math.round(
                      (field.validation?.maxFileSize || 10485760) / 1048576
                    ) || 10
                  }
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        maxFileSize:
                          (parseInt(e.target.value) || 10) * 1048576,
                      },
                    })
                  }
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Max files</Label>
                <Input
                  type="number"
                  value={field.validation?.maxFiles || 1}
                  onChange={(e) =>
                    onUpdate({
                      validation: {
                        ...field.validation,
                        maxFiles: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="mt-1 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quiz mode: correct answer + points (only surfaces when the form is in quiz mode) */}
        {isSelected && !isLayout && field.type !== 'HIDDEN_FIELD' && (
          <details className="mt-3 pointer-events-auto group/quiz">
            <summary className="text-xs text-muted-foreground hover:text-primary cursor-pointer inline-flex items-center gap-1.5">
              <Award className="w-3 h-3" /> Quiz scoring (optional)
            </summary>
            <div className="mt-2 rounded-md border bg-muted/30 p-3 grid grid-cols-[1fr_auto] gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Correct answer</Label>
                <Input
                  value={(field.validation as any)?.correctAnswer ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      validation: { ...(field.validation || {}), correctAnswer: e.target.value },
                    })
                  }
                  placeholder="Expected value"
                  className="h-7 text-xs mt-0.5"
                />
              </div>
              <div className="w-24">
                <Label className="text-[10px] text-muted-foreground">Points</Label>
                <Input
                  type="number"
                  min={0}
                  value={(field.validation as any)?.points ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      validation: { ...(field.validation || {}), points: e.target.value ? Number(e.target.value) : 1 },
                    })
                  }
                  placeholder="1"
                  className="h-7 text-xs mt-0.5"
                />
              </div>
            </div>
          </details>
        )}

        {/* Show "referenced by N rules" when this field is a logic source — helps
            authors spot anchor fields like CS4 that drive branching elsewhere. */}
        {!isLayout && referencedBy.length > 0 && (
          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Settings className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
                Drives logic elsewhere
              </span>
              <Badge className="text-[10px] bg-blue-600 hover:bg-blue-600">
                {referencedBy.length} rule{referencedBy.length === 1 ? '' : 's'}
              </Badge>
            </div>
            <p className="text-[11px] text-blue-900/80 dark:text-blue-200/80 mb-2">
              The answer to this field decides visibility or behaviour for:
            </p>
            <ul className="text-[11px] space-y-0.5">
              {referencedBy.slice(0, 8).map((r, i) => (
                <li key={i} className="flex items-start gap-1 text-blue-900 dark:text-blue-200">
                  <span className="text-blue-600 dark:text-blue-400 font-mono">
                    {r.kind === 'section' ? '▶' : '·'}
                  </span>
                  <span className="truncate">
                    {r.kind === 'section' ? 'Section ' : 'Field '}<strong>{r.label}</strong>
                    {r.kind === 'field' && <span className="text-blue-700/70 dark:text-blue-300/70"> in {r.sectionTitle}</span>}
                  </span>
                </li>
              ))}
              {referencedBy.length > 8 && (
                <li className="text-blue-700/70 dark:text-blue-300/70 italic">
                  + {referencedBy.length - 8} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Field logic: always visible when actions exist, or on selection for a quick "Add rule" affordance */}
        {!isLayout && (() => {
          const fieldActions = Array.isArray((field as any).actions) ? (field as any).actions as ActionRule[] : []
          const hasActions = fieldActions.length > 0
          if (!hasActions && !isSelected) return null // keep unselected empty fields clean
          return (
            <div className="mt-4 pointer-events-auto rounded-md border border-border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Field logic
                  </span>
                  {hasActions && (
                    <Badge variant="secondary" className="text-[10px]">
                      {fieldActions.length} rule{fieldActions.length === 1 ? '' : 's'}
                    </Badge>
                  )}
                </div>
                {!hasActions && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onUpdate({ actions: [{ action: 'HIDE', when: { type: 'all', clauses: [] } }] } as any)
                    }}
                    className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add rule
                  </button>
                )}
              </div>
              {hasActions ? (
                <ActionsBuilder
                  allSections={allSections}
                  currentSectionIndex={currentSectionIndex}
                  currentFieldName={field.name}
                  target="field"
                  value={fieldActions}
                  onChange={(next) => onUpdate({ actions: next } as any)}
                />
              ) : (
                <p className="text-[11px] text-muted-foreground italic">
                  No logic yet. Add a rule to show / hide / require / enable this field based on earlier answers.
                </p>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ── Main Form Editor ─────────────────────────────────────
export default function FormEditor({
  onSave,
  onCancel,
  initialData,
}: FormEditorProps) {
  const [formTitle, setFormTitle] = useState(initialData?.title || "")
  const [formDescription, setFormDescription] = useState(
    initialData?.description || ""
  )
  const [sections, setSections] = useState<FormSection[]>(() => {
    if (initialData?.sections?.length > 0) {
      return initialData.sections.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description || "",
        order: s.order || 1,
        actions: s.actions || null,
        isActive: s.isActive !== undefined ? s.isActive : true,
        fields:
          s.fields?.map((f: any) => ({
            id: f.id,
            type: f.type,
            label: f.label,
            name: f.name,
            placeholder: f.placeholder || "",
            required: f.validation?.required || f.required || false,
            options: f.options || getDefaultOptions(f.type),
            validation: f.validation || {},
            actions: f.actions || undefined,
            matrixRows: f.matrixRows || undefined,
            matrixColumns: f.matrixColumns || undefined,
            matrixType: f.matrixType || undefined,
            scaleStart: f.scaleStart,
            scaleEnd: f.scaleEnd,
            scaleStep: f.scaleStep,
            leftLabel: f.leftLabel,
            centerLabel: f.centerLabel,
            rightLabel: f.rightLabel,
            order: f.order || 1,
          })) || [],
      }))
    }
    return [
      {
        id: "section_1",
        title: "Section 1",
        description: "",
        fields: [],
        order: 1,
      },
    ]
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [settings, setSettings] = useState<any>({
    allowMultipleSubmissions:
      initialData?.settings?.allowMultipleSubmissions ?? true,
    collectEmail: initialData?.settings?.collectEmail ?? false,
    showProgressBar: initialData?.settings?.showProgressBar ?? true,
    confirmationMessage:
      initialData?.settings?.confirmationMessage ??
      "Thank you for your submission!",
    thankYouHeading: initialData?.settings?.thankYouHeading ?? "Thank you!",
    redirectUrl: initialData?.settings?.redirectUrl ?? "",
    submitButtonText: initialData?.settings?.submitButtonText ?? "Submit",
    closedMessage:
      initialData?.settings?.closedMessage ??
      "This form is no longer accepting responses.",
    closeDate: initialData?.settings?.closeDate ?? "",
    maxResponses: initialData?.settings?.maxResponses ?? null,
    coverImage: initialData?.settings?.coverImage ?? "",
    logo: initialData?.settings?.logo ?? "",
    primaryColor: initialData?.settings?.primaryColor ?? "#2563eb",
    fontFamily: initialData?.settings?.fontFamily ?? "",
    backgroundImage: initialData?.settings?.backgroundImage ?? "",
    backgroundGradient: initialData?.settings?.backgroundGradient ?? "",
    notifyEmails: initialData?.settings?.notifyEmails ?? "",
    // Review / summary
    reviewStep: initialData?.settings?.reviewStep ?? true,
    emailSummaryToApplicant: initialData?.settings?.emailSummaryToApplicant ?? false,
    applicantEmailField: initialData?.settings?.applicantEmailField ?? "",
    // Webhooks
    webhooks: initialData?.settings?.webhooks ?? [],
    // Quiz
    quizMode: initialData?.settings?.quizMode ?? false,
    // Access control
    requireLogin: initialData?.settings?.requireLogin ?? false,
    passwordProtect: initialData?.settings?.passwordProtect ?? "",
    allowedIPs: initialData?.settings?.allowedIPs ?? [],
    requireCaptcha: initialData?.settings?.requireCaptcha ?? false,
    // Languages
    languages: initialData?.settings?.languages ?? [],
    defaultLanguage: initialData?.settings?.defaultLanguage ?? "",
    translations: initialData?.settings?.translations ?? {},
  })

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Focus title on mount if empty
  useEffect(() => {
    if (!formTitle && titleRef.current) titleRef.current.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts ────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape to deselect
      if (e.key === "Escape" && selectedField && !slashCommand) {
        setSelectedField(null)
      }
      // Delete/Backspace on selected field (only if not typing in an input)
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedField &&
        !slashCommand
      ) {
        const target = e.target as HTMLElement
        const isTyping =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable
        if (!isTyping) {
          e.preventDefault()
          if (deleteConfirm === selectedField) {
            deleteField(selectedField)
            setDeleteConfirm(null)
          } else {
            setDeleteConfirm(selectedField)
            setTimeout(() => setDeleteConfirm(null), 2000)
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedField, slashCommand, deleteConfirm]) // eslint-disable-line react-hooks/exhaustive-deps

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
    setSections(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteSection = (id: string) => {
    if (sections.length <= 1) return
    if (!confirm("Delete this section and all its fields?")) return
    setSections(sections.filter((s) => s.id !== id))
  }

  const addFieldAt = (sectionId: string, insertIndex: number, type: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: getDefaultLabel(type),
      name: `field_${Date.now()}`,
      placeholder: "",
      required: false,
      options: getDefaultOptions(type),
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
        fields: s.fields.map((f) =>
          f.id === fieldId ? { ...f, ...updates } : f
        ),
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
        const newFields = [...s.fields]
        ;[newFields[idx], newFields[target]] = [
          newFields[target],
          newFields[idx],
        ]
        newFields.forEach((f, i) => (f.order = i + 1))
        return { ...s, fields: newFields }
      })
    )
  }

  // ── Slash command trigger ──────────────────────────────
  const openSlashPalette = (
    sectionId: string,
    insertIndex: number,
    anchorEl?: HTMLElement
  ) => {
    const rect = anchorEl?.getBoundingClientRect() || { top: 200, left: 400 }
    const editorRect = editorRef.current?.getBoundingClientRect() || {
      top: 0,
      left: 0,
    }
    setSlashCommand({
      sectionId,
      insertIndex,
      position: {
        top: rect.top - editorRect.top + 30,
        left: rect.left - editorRect.left,
      },
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
        sections: sections.map((s, si) => ({
          title: s.title,
          description: s.description,
          order: s.order ?? si + 1,
          actions: (s as any).actions ?? null,
          isActive: s.isActive ?? true,
          fields: s.fields.map((f) => ({
            type: f.type,
            label: f.label,
            name: f.name,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options,
            validation: { ...f.validation, required: f.required },
            actions: (f as any).actions ?? null,
            order: f.order,
            matrixRows: (f as any).matrixRows,
            matrixColumns: (f as any).matrixColumns,
            matrixType: (f as any).matrixType,
            scaleStart: (f as any).scaleStart,
            scaleEnd: (f as any).scaleEnd,
            scaleStep: (f as any).scaleStep,
            leftLabel: (f as any).leftLabel,
            centerLabel: (f as any).centerLabel,
            rightLabel: (f as any).rightLabel,
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewMode(false)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Back to editor
          </Button>
        </div>
        <div className="max-w-2xl mx-auto py-12 px-4">
          {settings.coverImage && (
            <div className="h-48 rounded-xl overflow-hidden mb-6">
              <img
                src={settings.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="bg-background rounded-xl border shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-1">
              {formTitle || "Untitled Form"}
            </h1>
            {formDescription && (
              <p className="text-muted-foreground mb-6">{formDescription}</p>
            )}
            {sections.map((section) => (
              <div key={section.id} className="mb-8">
                {sections.length > 1 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-5">
                  {section.fields.map((field) => {
                    // Layout blocks render differently in preview
                    if (field.type === "DIVIDER") {
                      return <hr key={field.id} className="border-t my-4" />
                    }
                    if (field.type === "PAGE_BREAK") {
                      return (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 py-4"
                        >
                          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Next page
                          </span>
                          <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
                        </div>
                      )
                    }
                    if (field.type === "HEADING") {
                      const level = field.validation?.headingLevel || 2
                      const Tag = (
                        level === 1 ? "h1" : level === 2 ? "h2" : "h3"
                      ) as keyof JSX.IntrinsicElements
                      const cls =
                        level === 1
                          ? "text-2xl font-bold"
                          : level === 2
                            ? "text-xl font-semibold"
                            : "text-lg font-medium"
                      return (
                        <Tag key={field.id} className={cls}>
                          {field.label}
                        </Tag>
                      )
                    }
                    if (field.type === "PARAGRAPH") {
                      return (
                        <p
                          key={field.id}
                          className="text-sm text-muted-foreground whitespace-pre-wrap"
                        >
                          {field.label}
                        </p>
                      )
                    }
                    if (field.type === "IMAGE") {
                      const url = field.validation?.imageUrl
                      const alt = field.validation?.altText || ""
                      return url ? (
                        <div
                          key={field.id}
                          className="rounded-lg overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={alt}
                            className="w-full max-h-64 object-contain"
                          />
                        </div>
                      ) : null
                    }
                    if (field.type === "HIDDEN_FIELD") {
                      return null // Hidden fields not visible
                    }

                    return (
                      <div key={field.id}>
                        <Label className="text-sm font-medium">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <div className="mt-1.5">
                          {field.type === "SHORT_TEXT" && (
                            <Input
                              placeholder={field.placeholder}
                              disabled
                            />
                          )}
                          {field.type === "LONG_TEXT" && (
                            <Textarea
                              placeholder={field.placeholder}
                              disabled
                              rows={3}
                            />
                          )}
                          {field.type === "EMAIL" && (
                            <Input
                              type="email"
                              placeholder={
                                field.placeholder || "email@example.com"
                              }
                              disabled
                            />
                          )}
                          {field.type === "NUMBER" && (
                            <Input
                              type="number"
                              placeholder={field.placeholder}
                              disabled
                            />
                          )}
                          {field.type === "PHONE" && (
                            <Input
                              type="tel"
                              placeholder={field.placeholder || "+250..."}
                              disabled
                            />
                          )}
                          {field.type === "URL" && (
                            <Input
                              type="url"
                              placeholder={field.placeholder || "https://..."}
                              disabled
                            />
                          )}
                          {field.type === "DATE" && (
                            <Input type="date" disabled />
                          )}
                          {field.type === "TIME" && (
                            <Input type="time" disabled />
                          )}
                          {field.type === "FILE_UPLOAD" && (
                            <Input type="file" disabled />
                          )}
                          {field.type === "RATING" && (
                            <div className="flex gap-1">
                              {Array.from({
                                length: field.validation?.maxStars || 5,
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-6 h-6 text-muted-foreground/30"
                                />
                              ))}
                            </div>
                          )}
                          {field.type === "LINEAR_SCALE" && (() => {
                            const start = field.validation?.startValue ?? 1
                            const end = field.validation?.endValue ?? 5
                            const leftLabel = field.validation?.leftLabel || ""
                            const rightLabel = field.validation?.rightLabel || ""
                            const values = []
                            for (let i = start; i <= end; i++) values.push(i)
                            return (
                              <div className="flex items-center gap-2">
                                {leftLabel && (
                                  <span className="text-xs text-muted-foreground">{leftLabel}</span>
                                )}
                                <div className="flex gap-2">
                                  {values.map((n) => (
                                    <div
                                      key={n}
                                      className="w-10 h-10 rounded-full border flex items-center justify-center text-sm"
                                    >
                                      {n}
                                    </div>
                                  ))}
                                </div>
                                {rightLabel && (
                                  <span className="text-xs text-muted-foreground">{rightLabel}</span>
                                )}
                              </div>
                            )
                          })()}
                          {field.type === "MULTIPLE_CHOICE" && (
                            <div className="space-y-2 mt-1">
                              {field.options?.map((o, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <input type="radio" disabled />
                                  {o}
                                </label>
                              ))}
                            </div>
                          )}
                          {(field.type === "CHECKBOXES" ||
                            field.type === "MULTI_SELECT") && (
                            <div className="space-y-2 mt-1">
                              {field.options?.map((o, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <input type="checkbox" disabled />
                                  {o}
                                </label>
                              ))}
                            </div>
                          )}
                          {field.type === "DROPDOWN" && (
                            <select
                              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                              disabled
                            >
                              <option>Select an option</option>
                              {field.options?.map((o, i) => (
                                <option key={i}>{o}</option>
                              ))}
                            </select>
                          )}
                          {field.type === "RANKING" && (
                            <div className="space-y-1.5 mt-1">
                              {field.options?.map((o, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 p-2 rounded-md border bg-muted/20 text-sm"
                                >
                                  <span className="text-xs font-medium text-muted-foreground w-5 text-right">
                                    {i + 1}.
                                  </span>
                                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                                  {o}
                                </div>
                              ))}
                            </div>
                          )}
                          {field.type === "MATRIX" && (() => {
                            const rows = field.validation?.rows || ["Row 1", "Row 2"]
                            const columns = field.validation?.columns || ["Col 1", "Col 2", "Col 3"]
                            return (
                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-muted/30">
                                      <th className="p-2 text-left font-medium text-muted-foreground"></th>
                                      {columns.map((col: string, ci: number) => (
                                        <th key={ci} className="p-2 text-center font-medium text-muted-foreground">{col}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row: string, ri: number) => (
                                      <tr key={ri} className="border-t">
                                        <td className="p-2 text-muted-foreground">{row}</td>
                                        {columns.map((_: string, ci: number) => (
                                          <td key={ci} className="p-2 text-center">
                                            <input type="radio" disabled />
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )
                          })()}
                          {field.type === "SIGNATURE" && (
                            <div className="h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
                              <PenLine className="w-6 h-6" />
                              <span className="text-xs">Sign here</span>
                            </div>
                          )}
                          {field.type === "GPS_COORDINATES" && (
                            <Input
                              placeholder="Lat, Long"
                              disabled
                            />
                          )}
                          {field.type === "NATIONAL_ID" && (
                            <Input
                              placeholder="National ID number"
                              disabled
                            />
                          )}
                          {field.type === "COUNTRY" && (
                            <select
                              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                              disabled
                            >
                              <option>Select country...</option>
                            </select>
                          )}
                          {field.type === "CALCULATED" && (
                            <div className="h-9 rounded-md border bg-muted/30 flex items-center px-3 text-sm text-muted-foreground">
                              Calculated value
                            </div>
                          )}
                          {field.type === "SCORE" && (
                            <div className="h-9 rounded-md border bg-muted/30 flex items-center px-3 text-sm text-muted-foreground">
                              Score
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <Button
              className="w-full mt-4"
              style={{ backgroundColor: settings.primaryColor }}
              disabled
            >
              {settings.submitButtonText}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Settings Panel ─────────────────────────────────────
  if (showSettings) {
    const allFieldsFlat = sections.flatMap((s) =>
      s.fields.map((f) => ({ id: f.id, name: f.name, label: f.label, type: f.type, options: Array.isArray(f.options) ? (f.options as string[]) : undefined, sectionTitle: s.title })),
    )
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium">Form settings</span>
          <Button size="sm" variant="outline" onClick={() => setShowSettings(false)}>
            <X className="w-3.5 h-3.5 mr-1.5" /> Close
          </Button>
        </div>
        <div className="max-w-5xl mx-auto py-6 px-4">
          <FormSettingsPanel
            formId={initialData?.id}
            settings={settings}
            setSettings={setSettings}
            fields={allFieldsFlat}
            onImportDraft={(draft) => {
              // Replace current sections + title + description with the AI draft
              try {
                if (draft?.title) setFormTitle(draft.title)
                if (draft?.description) setFormDescription(draft.description)
                if (Array.isArray(draft?.sections)) {
                  const newSections: any = draft.sections.map((s: any, si: number) => ({
                    id: `section_${Date.now()}_${si}`,
                    title: s.title || `Section ${si + 1}`,
                    description: s.description || '',
                    order: si + 1,
                    fields: (s.fields || []).map((f: any, fi: number) => ({
                      id: `field_${Date.now()}_${si}_${fi}`,
                      type: f.type || 'SHORT_TEXT',
                      label: f.label || '',
                      name: f.name || `field_${Date.now()}_${si}_${fi}`,
                      placeholder: f.placeholder || '',
                      required: !!f.required,
                      options: f.options || getDefaultOptions(f.type || 'SHORT_TEXT'),
                      validation: { required: !!f.required },
                      order: fi + 1,
                    })),
                  }))
                  setSections(newSections)
                }
                setShowSettings(false)
              } catch (err) { console.error(err) }
            }}
          />
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
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {formTitle || "Untitled"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-1.5" /> Settings
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreviewMode(true)}
            >
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
      <div
        className="max-w-2xl mx-auto py-12 px-4 relative"
        onClick={(e) => {
          // Click on canvas background deselects field
          if (e.target === e.currentTarget) setSelectedField(null)
        }}
      >
        {/* Form Title & Description */}
        <div className="mb-8">
          <AutoTextarea
            ref={titleRef as any}
            value={formTitle}
            onChange={(e) => setFormTitle((e.target as HTMLTextAreaElement).value)}
            placeholder="Untitled form"
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 leading-tight"
          />
          <AutoTextarea
            value={formDescription}
            onChange={(e) => setFormDescription((e.target as HTMLTextAreaElement).value)}
            placeholder="Add a description..."
            className="w-full mt-2 text-base text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 leading-relaxed"
          />
        </div>

        {/* Sections — reference map computed once so each field can flag
            whether its answer drives logic elsewhere (e.g. CS4 → paths). */}
        {(() => {
          const referenceMap = buildReferenceMap(sections as any[])
          return sections.map((section, sectionIndex) => {
          const pathTheme = getSectionPathTheme(section)
          return (
          <div
            key={section.id}
            className={`mb-10 border-l-4 ${pathTheme.border} ${pathTheme.bg} pl-4 rounded-sm transition-colors`}
          >
            {/* Section Header */}
            {sections.length > 1 && (
              <div className="flex items-center gap-2 mb-4 group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {pathTheme.label && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${pathTheme.badgeClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pathTheme.dot}`} />
                        {pathTheme.label}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">Section {sectionIndex + 1}</span>
                  </div>
                  <AutoTextarea
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, { title: (e.target as HTMLTextAreaElement).value })
                    }
                    className="text-lg font-semibold bg-transparent border-none outline-none w-full leading-tight"
                  />
                  <AutoTextarea
                    value={section.description || ""}
                    onChange={(e) =>
                      updateSection(section.id, {
                        description: (e.target as HTMLTextAreaElement).value,
                      })
                    }
                    placeholder="Section description..."
                    className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full leading-relaxed"
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

            {/* Section-level logic: always visible so authors can see and edit the rules */}
            {(() => {
              const actions = Array.isArray((section as any).actions) ? (section as any).actions as ActionRule[] : []
              const hasActions = actions.length > 0
              return (
                <div className="mb-4 rounded-md border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Section logic
                      </span>
                      {hasActions && (
                        <Badge variant="secondary" className="text-[10px]">{actions.length} rule{actions.length === 1 ? '' : 's'}</Badge>
                      )}
                    </div>
                    {!hasActions && sectionIndex > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSection(section.id, {
                            actions: [{ action: 'HIDE', when: { type: 'all', clauses: [] } }],
                          } as any)
                        }
                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add rule
                      </button>
                    )}
                  </div>
                  {hasActions ? (
                    <ActionsBuilder
                      allSections={sections}
                      currentSectionIndex={sectionIndex}
                      target="section"
                      value={actions}
                      onChange={(next) => updateSection(section.id, { actions: next } as any)}
                    />
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      {sectionIndex === 0
                        ? 'The first section is always shown to everyone.'
                        : 'No logic yet. This section is always shown. Add a rule to show / hide / jump based on earlier answers.'}
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Add block at top of section */}
            <AddBlockButton
              onClick={(e?: any) =>
                openSlashPalette(section.id, 0, e?.currentTarget)
              }
            />

            {/* Fields */}
            {section.fields.map((field, fieldIndex) => (
              <React.Fragment key={field.id}>
                <div className="relative">
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
                    allSections={sections}
                    currentSectionIndex={sectionIndex}
                    referencedBy={referenceMap.get(field.name) || []}
                  />
                  {/* Delete confirmation badge */}
                  {deleteConfirm === field.id && (
                    <div className="absolute -top-2 right-2 z-10">
                      <Badge
                        variant="destructive"
                        className="text-[10px] animate-pulse"
                      >
                        Press again to delete
                      </Badge>
                    </div>
                  )}
                </div>
                <AddBlockButton
                  onClick={(e?: any) =>
                    openSlashPalette(
                      section.id,
                      fieldIndex + 1,
                      e?.currentTarget
                    )
                  }
                />
              </React.Fragment>
            ))}

            {/* Empty state */}
            {section.fields.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm mb-1">
                  No fields yet
                </p>
                <p className="text-muted-foreground/60 text-xs mb-4">
                  Click the + button above or press{" "}
                  <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-muted border font-mono">
                    /
                  </kbd>{" "}
                  to add blocks
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) =>
                    openSlashPalette(section.id, 0, e.currentTarget)
                  }
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add first block
                </Button>
              </div>
            )}

            {/* Add section button between sections */}
            {sectionIndex < sections.length - 1 && (
              <div className="flex items-center gap-3 mt-6">
                <div className="flex-1 border-t border-dashed border-border" />
                <button
                  type="button"
                  onClick={addSection}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add section
                </button>
                <div className="flex-1 border-t border-dashed border-border" />
              </div>
            )}
          </div>
          )
        })
        })()}

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
            onSelect={(type) =>
              addFieldAt(
                slashCommand.sectionId,
                slashCommand.insertIndex,
                type
              )
            }
            onClose={() => setSlashCommand(null)}
          />
        )}
      </div>
    </div>
  )
}
