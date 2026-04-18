'use client'

import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Check, X, Plus, GitBranch } from 'lucide-react'

type Conditional = { dependsOn: string; operator: string; value: string | string[] } | null | undefined

interface FieldDescriptor {
  name: string
  label: string
  type: string
  options?: string[]
  sectionTitle: string
  sectionIndex: number
}

interface SectionLike {
  title: string
  fields: Array<{ name: string; label: string; type: string; options?: any }>
}

interface ConditionalBuilderProps {
  allSections: SectionLike[]
  /** Index of the section/field currently being edited. Only fields from earlier sections are valid sources. */
  currentSectionIndex: number
  /** Current field's name — excluded from the source picker to prevent self-reference. */
  currentFieldName?: string
  value: Conditional
  onChange: (next: Conditional) => void
  /** "section" for section-level gating, "field" for field-level. Used in labels only. */
  target: 'section' | 'field'
}

// Operators available to each field type. Labels are plain English.
// Keys must match the operator strings evaluated by form-renderer.
const OPERATORS_BY_TYPE: Record<string, Array<{ op: string; label: string; supports: 'single' | 'multi' | 'none' }>> = {
  MULTIPLE_CHOICE: [
    { op: 'equals', label: 'is', supports: 'single' },
    { op: 'not_equals', label: 'is not', supports: 'single' },
    { op: 'in', label: 'is one of', supports: 'multi' },
    { op: 'not_in', label: 'is none of', supports: 'multi' },
  ],
  DROPDOWN: [
    { op: 'equals', label: 'is', supports: 'single' },
    { op: 'not_equals', label: 'is not', supports: 'single' },
    { op: 'in', label: 'is one of', supports: 'multi' },
    { op: 'not_in', label: 'is none of', supports: 'multi' },
  ],
  RADIO: [
    { op: 'equals', label: 'is', supports: 'single' },
    { op: 'not_equals', label: 'is not', supports: 'single' },
    { op: 'in', label: 'is one of', supports: 'multi' },
    { op: 'not_in', label: 'is none of', supports: 'multi' },
  ],
  CHECKBOXES: [
    { op: 'contains', label: 'includes', supports: 'single' },
    { op: 'not_contains', label: 'does not include', supports: 'single' },
    { op: 'is_not_empty', label: 'has any selection', supports: 'none' },
    { op: 'is_empty', label: 'has no selection', supports: 'none' },
  ],
  MULTI_SELECT: [
    { op: 'contains', label: 'includes', supports: 'single' },
    { op: 'not_contains', label: 'does not include', supports: 'single' },
    { op: 'is_not_empty', label: 'has any selection', supports: 'none' },
    { op: 'is_empty', label: 'has no selection', supports: 'none' },
  ],
  SHORT_TEXT: [
    { op: 'equals', label: 'equals', supports: 'single' },
    { op: 'not_equals', label: 'does not equal', supports: 'single' },
    { op: 'contains', label: 'contains', supports: 'single' },
    { op: 'not_contains', label: 'does not contain', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  LONG_TEXT: [
    { op: 'contains', label: 'contains', supports: 'single' },
    { op: 'not_contains', label: 'does not contain', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  EMAIL: [
    { op: 'equals', label: 'equals', supports: 'single' },
    { op: 'not_equals', label: 'does not equal', supports: 'single' },
    { op: 'contains', label: 'contains', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  PHONE: [
    { op: 'contains', label: 'contains', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  URL: [
    { op: 'contains', label: 'contains', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  NUMBER: [
    { op: 'equals', label: 'equals', supports: 'single' },
    { op: 'not_equals', label: 'does not equal', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  DATE: [
    { op: 'equals', label: 'is', supports: 'single' },
    { op: 'not_equals', label: 'is not', supports: 'single' },
    { op: 'is_not_empty', label: 'is filled in', supports: 'none' },
    { op: 'is_empty', label: 'is empty', supports: 'none' },
  ],
  LINEAR_SCALE: [
    { op: 'equals', label: 'equals', supports: 'single' },
    { op: 'not_equals', label: 'does not equal', supports: 'single' },
  ],
  RATING: [
    { op: 'equals', label: 'equals', supports: 'single' },
    { op: 'not_equals', label: 'does not equal', supports: 'single' },
  ],
}

const FALLBACK_OPERATORS = OPERATORS_BY_TYPE.SHORT_TEXT

function getOperatorsForType(type: string) {
  return OPERATORS_BY_TYPE[type] || FALLBACK_OPERATORS
}

// Build the list of source fields available as a dependsOn target.
// Only fields in sections before the current one are valid — you cannot gate a
// section on an answer the respondent has not been asked yet.
function buildSourceFields(allSections: SectionLike[], currentSectionIndex: number, excludeName?: string): FieldDescriptor[] {
  const out: FieldDescriptor[] = []
  allSections.forEach((s, si) => {
    if (si > currentSectionIndex) return
    s.fields.forEach(f => {
      if (!f.name) return
      if (si === currentSectionIndex && f.name === excludeName) return
      out.push({
        name: f.name,
        label: f.label || f.name,
        type: f.type,
        options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
        sectionTitle: s.title || `Section ${si + 1}`,
        sectionIndex: si,
      })
    })
  })
  return out
}

function labelForOperator(op: string | undefined): string {
  for (const ops of Object.values(OPERATORS_BY_TYPE)) {
    const match = ops.find(x => x.op === op)
    if (match) return match.label
  }
  return op || '—'
}

export default function ConditionalBuilder({
  allSections,
  currentSectionIndex,
  currentFieldName,
  value,
  onChange,
  target,
}: ConditionalBuilderProps) {
  const sourceFields = useMemo(
    () => buildSourceFields(allSections, currentSectionIndex, currentFieldName),
    [allSections, currentSectionIndex, currentFieldName],
  )

  const selected = value?.dependsOn ? sourceFields.find(f => f.name === value.dependsOn) : undefined
  const operators = selected ? getOperatorsForType(selected.type) : FALLBACK_OPERATORS
  const currentOpMeta = operators.find(o => o.op === value?.operator)
  const supports = currentOpMeta?.supports ?? 'single'

  const update = (patch: Partial<NonNullable<Conditional>>) => {
    const next = { ...(value || { dependsOn: '', operator: 'equals', value: '' }), ...patch } as NonNullable<Conditional>
    onChange(next)
  }

  // Pick sensible defaults when field changes
  const handleSourceChange = (newName: string) => {
    const newField = sourceFields.find(f => f.name === newName)
    const newOps = newField ? getOperatorsForType(newField.type) : FALLBACK_OPERATORS
    // Keep operator if still valid; otherwise reset to the first option
    const keepOp = newOps.find(o => o.op === value?.operator)?.op || newOps[0].op
    const keepOpSupports = newOps.find(o => o.op === keepOp)?.supports ?? 'single'
    const nextValue: string | string[] =
      keepOpSupports === 'multi' ? [] : keepOpSupports === 'none' ? '' : ''
    onChange({ dependsOn: newName, operator: keepOp, value: nextValue })
  }

  const handleOperatorChange = (newOp: string) => {
    const meta = operators.find(o => o.op === newOp)
    const nextSupports = meta?.supports ?? 'single'
    let nextValue: string | string[] = value?.value ?? ''
    if (nextSupports === 'multi' && !Array.isArray(nextValue)) nextValue = nextValue ? [String(nextValue)] : []
    else if (nextSupports !== 'multi' && Array.isArray(nextValue)) nextValue = nextValue[0] ?? ''
    else if (nextSupports === 'none') nextValue = ''
    update({ operator: newOp, value: nextValue })
  }

  const selectedValuesArray: string[] = Array.isArray(value?.value) ? (value!.value as string[]) : value?.value ? [String(value.value)] : []

  // Plain-English preview
  const previewSentence = (() => {
    if (!selected) return null
    const verb = labelForOperator(value?.operator)
    if (supports === 'none') return (
      <>Show this {target} when <strong>{selected.label}</strong> <strong>{verb}</strong>.</>
    )
    const vals = Array.isArray(value?.value)
      ? (value!.value as string[])
      : value?.value
        ? [String(value.value)]
        : []
    if (vals.length === 0) return (
      <>Show this {target} when <strong>{selected.label}</strong> <strong>{verb}</strong>… <span className="text-muted-foreground italic">(pick a value)</span></>
    )
    return (
      <>
        Show this {target} when <strong>{selected.label}</strong> <strong>{verb}</strong>{' '}
        {vals.map((v, i) => (
          <span key={i}>
            {i > 0 && <span className="text-muted-foreground"> or </span>}
            <span className="inline-flex items-center rounded bg-background px-1.5 py-0.5 border text-[11px] font-medium">{v}</span>
          </span>
        ))}
      </>
    )
  })()

  if (sourceFields.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        There are no earlier fields this {target} can depend on. Add fields to a previous section first.
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Conditional logic
        </p>
      </div>

      {/* Plain-English preview */}
      {previewSentence && (
        <p className="rounded bg-background border-l-2 border-blue-500 px-3 py-2 text-xs leading-relaxed">
          {previewSentence}
        </p>
      )}

      {/* Source field picker */}
      <div className="grid gap-2">
        <div>
          <Label className="text-[11px] text-muted-foreground">When the answer to this question</Label>
          <select
            value={value?.dependsOn || ''}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
          >
            <option value="">Select a question…</option>
            {(() => {
              const grouped = new Map<string, FieldDescriptor[]>()
              sourceFields.forEach(f => {
                const key = f.sectionTitle
                if (!grouped.has(key)) grouped.set(key, [])
                grouped.get(key)!.push(f)
              })
              return Array.from(grouped.entries()).map(([sectionTitle, fields]) => (
                <optgroup key={sectionTitle} label={sectionTitle}>
                  {fields.map(f => (
                    <option key={f.name} value={f.name}>
                      {f.label} ({f.type.toLowerCase().replace(/_/g, ' ')})
                    </option>
                  ))}
                </optgroup>
              ))
            })()}
          </select>
        </div>

        {/* Operator picker */}
        {selected && (
          <div>
            <Label className="text-[11px] text-muted-foreground">…is</Label>
            <select
              value={value?.operator || ''}
              onChange={(e) => handleOperatorChange(e.target.value)}
              className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              {operators.map(o => (
                <option key={o.op} value={o.op}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Value picker (adapts to source field + operator) */}
        {selected && supports !== 'none' && (
          <div>
            <Label className="text-[11px] text-muted-foreground">
              {supports === 'multi' ? 'Any of these values' : 'This value'}
            </Label>
            {selected.options && selected.options.length > 0 ? (
              supports === 'multi' ? (
                // Multi-select with chips
                <div className="mt-0.5 space-y-1">
                  <div className="flex flex-wrap gap-1 min-h-[28px] rounded-md border bg-background p-1">
                    {selectedValuesArray.length === 0 && (
                      <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground italic">No values picked</span>
                    )}
                    {selectedValuesArray.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-1.5 py-0.5 text-[11px]">
                        {v}
                        <button
                          type="button"
                          onClick={() => update({ value: selectedValuesArray.filter(x => x !== v) })}
                          className="hover:text-red-600"
                          aria-label="Remove value"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selected.options
                      .filter(o => !selectedValuesArray.includes(o))
                      .map(o => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => update({ value: [...selectedValuesArray, o] })}
                          className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px] hover:bg-muted transition-colors"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[200px]">{o}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                // Single-select dropdown from the source field's options
                <select
                  value={typeof value?.value === 'string' ? value.value : (selectedValuesArray[0] || '')}
                  onChange={(e) => update({ value: e.target.value })}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
                >
                  <option value="">Pick a value…</option>
                  {selected.options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              )
            ) : (
              // Free-text value for text/number/email etc.
              <Input
                value={supports === 'multi' ? selectedValuesArray.join(', ') : (typeof value?.value === 'string' ? value.value : '')}
                onChange={(e) => {
                  if (supports === 'multi') {
                    update({ value: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })
                  } else {
                    update({ value: e.target.value })
                  }
                }}
                placeholder={supports === 'multi' ? 'Value 1, Value 2, Value 3' : 'Type a value'}
                className="mt-0.5 h-8 text-xs"
                type={selected.type === 'NUMBER' ? 'number' : 'text'}
              />
            )}
          </div>
        )}
      </div>

      {/* Clear / cheat-sheet */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-muted-foreground">
          {target === 'section' ? 'Hide the whole section until the condition is true.' : 'Hide this field until the condition is true.'}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[11px] text-muted-foreground hover:text-red-600 inline-flex items-center gap-1"
        >
          <X className="h-3 w-3" /> Remove
        </button>
      </div>
    </div>
  )
}
