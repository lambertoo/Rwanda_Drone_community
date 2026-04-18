'use client'

import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  ActionRule,
  ActionType,
  ACTION_LABELS,
  ClauseOperator,
  ConditionClause,
  ConditionGroup,
  OPERATOR_LABELS,
  emptyClause,
  newAction,
} from '@/lib/form-actions'
import { GitBranch, Plus, X, ChevronDown, ChevronRight } from 'lucide-react'

interface FieldDescriptor {
  name: string
  label: string
  type: string
  options?: string[]
  sectionTitle: string
}

interface SectionLike {
  id?: string
  title: string
  fields: Array<{ name: string; label: string; type: string; options?: any }>
}

interface ActionsBuilderProps {
  allSections: SectionLike[]
  /** Index of the section/field currently being edited. Only earlier sections are valid sources for clauses. */
  currentSectionIndex: number
  /** For field actions: name of the field being edited. It cannot be used as a source clause. */
  currentFieldName?: string
  /** Which set of actions this builder offers: a section can't be required, a field can't jump. */
  target: 'section' | 'field'
  value: ActionRule[] | undefined
  onChange: (next: ActionRule[]) => void
}

const OPS_BY_TYPE: Record<string, ClauseOperator[]> = {
  MULTIPLE_CHOICE: ['equals', 'not_equals', 'in', 'not_in'],
  DROPDOWN: ['equals', 'not_equals', 'in', 'not_in'],
  RADIO: ['equals', 'not_equals', 'in', 'not_in'],
  CHECKBOXES: ['contains', 'not_contains', 'is_not_empty', 'is_empty'],
  MULTI_SELECT: ['contains', 'not_contains', 'is_not_empty', 'is_empty'],
  SHORT_TEXT: ['equals', 'not_equals', 'contains', 'not_contains', 'is_not_empty', 'is_empty'],
  LONG_TEXT: ['contains', 'not_contains', 'is_not_empty', 'is_empty'],
  EMAIL: ['equals', 'not_equals', 'contains', 'is_not_empty', 'is_empty'],
  PHONE: ['contains', 'is_not_empty', 'is_empty'],
  URL: ['contains', 'is_not_empty', 'is_empty'],
  NUMBER: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'is_not_empty', 'is_empty'],
  DATE: ['equals', 'not_equals', 'is_not_empty', 'is_empty'],
  LINEAR_SCALE: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'],
  RATING: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'],
}

const FALLBACK_OPS: ClauseOperator[] = ['equals', 'not_equals', 'is_empty', 'is_not_empty']

function opsFor(type: string): ClauseOperator[] {
  return OPS_BY_TYPE[type] || FALLBACK_OPS
}

const OP_NEEDS_VALUE: Record<ClauseOperator, 'single' | 'multi' | 'none'> = {
  equals: 'single', not_equals: 'single', contains: 'single', not_contains: 'single',
  in: 'multi', not_in: 'multi',
  is_empty: 'none', is_not_empty: 'none',
  greater_than: 'single', less_than: 'single', greater_or_equal: 'single', less_or_equal: 'single',
}

function buildSourceFields(allSections: SectionLike[], upToSection: number, excludeName?: string): FieldDescriptor[] {
  const out: FieldDescriptor[] = []
  allSections.forEach((s, si) => {
    if (si > upToSection) return
    s.fields.forEach(f => {
      if (!f.name) return
      if (si === upToSection && f.name === excludeName) return
      out.push({
        name: f.name,
        label: f.label || f.name,
        type: f.type,
        options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
        sectionTitle: s.title || `Section ${si + 1}`,
      })
    })
  })
  return out
}

function actionsForTarget(target: 'section' | 'field'): ActionType[] {
  return target === 'section'
    ? ['SHOW', 'HIDE', 'JUMP_TO', 'END_FORM', 'REDIRECT']
    : ['SHOW', 'HIDE', 'REQUIRE', 'NOT_REQUIRE', 'ENABLE', 'DISABLE']
}

// ─── Clause editor ──────────────────────────────────────────

function ClauseRow({
  clause,
  sourceFields,
  onChange,
  onRemove,
}: {
  clause: ConditionClause
  sourceFields: FieldDescriptor[]
  onChange: (next: ConditionClause) => void
  onRemove: () => void
}) {
  const source = sourceFields.find(f => f.name === clause.field)
  const ops = source ? opsFor(source.type) : FALLBACK_OPS
  const needs = OP_NEEDS_VALUE[clause.operator] ?? 'single'

  const selectedValues: string[] = Array.isArray(clause.value)
    ? (clause.value as string[])
    : clause.value !== undefined && clause.value !== ''
      ? [String(clause.value)]
      : []

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-start">
      {/* Field picker */}
      <select
        value={clause.field || ''}
        onChange={(e) => {
          const nf = sourceFields.find(x => x.name === e.target.value)
          const nextOp = nf ? opsFor(nf.type)[0] : 'equals'
          const nextNeeds = OP_NEEDS_VALUE[nextOp] ?? 'single'
          onChange({
            field: e.target.value,
            operator: nextOp,
            value: nextNeeds === 'multi' ? [] : '',
          })
        }}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        <option value="">Pick a question…</option>
        {(() => {
          const grouped = new Map<string, FieldDescriptor[]>()
          sourceFields.forEach(f => {
            if (!grouped.has(f.sectionTitle)) grouped.set(f.sectionTitle, [])
            grouped.get(f.sectionTitle)!.push(f)
          })
          return Array.from(grouped.entries()).map(([sectionTitle, fields]) => (
            <optgroup key={sectionTitle} label={sectionTitle}>
              {fields.map(f => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))
        })()}
      </select>

      {/* Operator */}
      <select
        value={clause.operator}
        onChange={(e) => {
          const nextOp = e.target.value as ClauseOperator
          const nextNeeds = OP_NEEDS_VALUE[nextOp] ?? 'single'
          let nextValue: any = clause.value
          if (nextNeeds === 'multi' && !Array.isArray(nextValue)) nextValue = nextValue ? [String(nextValue)] : []
          else if (nextNeeds !== 'multi' && Array.isArray(nextValue)) nextValue = nextValue[0] ?? ''
          else if (nextNeeds === 'none') nextValue = ''
          onChange({ ...clause, operator: nextOp, value: nextValue })
        }}
        className="rounded-md border bg-background px-2 py-1 text-xs"
      >
        {ops.map(op => (
          <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
        ))}
      </select>

      {/* Value input (adapts to source + operator) */}
      {needs === 'none' ? (
        <span className="text-[11px] text-muted-foreground italic py-1.5">no value needed</span>
      ) : source?.options && source.options.length > 0 ? (
        needs === 'multi' ? (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1 min-h-[28px] rounded-md border bg-background p-1">
              {selectedValues.length === 0 && (
                <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground italic">No values picked</span>
              )}
              {selectedValues.map(v => (
                <span key={v} className="inline-flex items-center gap-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-1.5 py-0.5 text-[11px]">
                  {v}
                  <button type="button" onClick={() => onChange({ ...clause, value: selectedValues.filter(x => x !== v) })} className="hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {source.options.filter(o => !selectedValues.includes(o)).map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => onChange({ ...clause, value: [...selectedValues, o] })}
                  className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px] hover:bg-muted"
                >
                  <Plus className="h-2.5 w-2.5" />
                  <span className="truncate max-w-[180px]">{o}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <select
            value={typeof clause.value === 'string' ? clause.value : (selectedValues[0] || '')}
            onChange={(e) => onChange({ ...clause, value: e.target.value })}
            className="rounded-md border bg-background px-2 py-1 text-xs"
          >
            <option value="">Pick a value…</option>
            {source.options.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        )
      ) : (
        <Input
          value={typeof clause.value === 'string' || typeof clause.value === 'number' ? String(clause.value) : ''}
          onChange={(e) => onChange({ ...clause, value: e.target.value })}
          placeholder="Type a value"
          className="h-7 text-xs"
          type={source?.type === 'NUMBER' ? 'number' : 'text'}
        />
      )}

      {/* Remove */}
      <button type="button" onClick={onRemove} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Group editor ───────────────────────────────────────────

function isClauseNode(n: ConditionClause | ConditionGroup): n is ConditionClause {
  return 'field' in n && 'operator' in n
}

function GroupEditor({
  group,
  sourceFields,
  onChange,
  depth = 0,
}: {
  group: ConditionGroup
  sourceFields: FieldDescriptor[]
  onChange: (next: ConditionGroup) => void
  depth?: number
}) {
  const isEmpty = !group.clauses || group.clauses.length === 0

  const updateClauseAt = (index: number, node: ConditionClause | ConditionGroup) => {
    const next = [...group.clauses]
    next[index] = node
    onChange({ ...group, clauses: next })
  }
  const removeAt = (index: number) => {
    const next = [...group.clauses]
    next.splice(index, 1)
    onChange({ ...group, clauses: next })
  }

  return (
    <div
      className={`rounded-md border bg-background/60 p-2 ${depth > 0 ? 'ml-3 mt-1 border-dashed' : ''}`}
    >
      <div className="flex items-center gap-2 pb-2">
        <span className="text-[11px] text-muted-foreground">When</span>
        <select
          value={group.type}
          onChange={(e) => onChange({ ...group, type: e.target.value as 'all' | 'any' })}
          className="rounded border bg-background px-1.5 py-0.5 text-[11px] font-medium"
        >
          <option value="all">all of</option>
          <option value="any">any of</option>
        </select>
        <span className="text-[11px] text-muted-foreground">
          {group.type === 'all' ? 'the following are true (AND)' : 'the following are true (OR)'}
        </span>
      </div>

      {isEmpty ? (
        <p className="px-1 pb-2 text-[11px] italic text-muted-foreground">No clauses yet. Add one below.</p>
      ) : (
        <div className="space-y-2">
          {group.clauses.map((node, i) => (
            <div key={i}>
              {isClauseNode(node) ? (
                <ClauseRow
                  clause={node}
                  sourceFields={sourceFields}
                  onChange={(next) => updateClauseAt(i, next)}
                  onRemove={() => removeAt(i)}
                />
              ) : (
                <GroupEditor
                  group={node}
                  sourceFields={sourceFields}
                  onChange={(next) => updateClauseAt(i, next)}
                  depth={depth + 1}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onChange({ ...group, clauses: [...group.clauses, emptyClause(sourceFields[0]?.name)] })}
          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Add condition
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...group, clauses: [...group.clauses, { type: 'all', clauses: [] } as ConditionGroup] })}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Add nested group
        </button>
      </div>
    </div>
  )
}

// ─── Main builder ───────────────────────────────────────────

export default function ActionsBuilder({
  allSections,
  currentSectionIndex,
  currentFieldName,
  target,
  value,
  onChange,
}: ActionsBuilderProps) {
  const sourceFields = useMemo(
    () => buildSourceFields(allSections, currentSectionIndex, currentFieldName),
    [allSections, currentSectionIndex, currentFieldName],
  )

  const actions = value ?? []
  const actionTypes = actionsForTarget(target)

  const updateAction = (index: number, next: ActionRule) => {
    const arr = [...actions]
    arr[index] = next
    onChange(arr)
  }
  const removeAction = (index: number) => {
    const arr = [...actions]
    arr.splice(index, 1)
    onChange(arr)
  }
  const addAction = () => onChange([...actions, newAction('HIDE')])

  if (sourceFields.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        There are no earlier fields this {target} can depend on. Add fields to a previous section first.
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Logic
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-[11px] text-muted-foreground hover:text-red-600 inline-flex items-center gap-1"
        >
          <X className="h-3 w-3" /> Remove all
        </button>
      </div>

      {actions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No rules yet.</p>
      ) : (
        <div className="space-y-3">
          {actions.map((rule, i) => (
            <div key={i} className="rounded-md border bg-background p-2 space-y-2">
              {/* Action selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={rule.action}
                  onChange={(e) => updateAction(i, { ...rule, action: e.target.value as ActionType })}
                  className="rounded border bg-background px-2 py-1 text-xs font-medium"
                >
                  {actionTypes.map(a => (
                    <option key={a} value={a}>{ACTION_LABELS[a]}</option>
                  ))}
                </select>
                <span className="text-[11px] text-muted-foreground">this {target}</span>

                {/* Target input for JUMP_TO / REDIRECT */}
                {rule.action === 'JUMP_TO' && (
                  <select
                    value={rule.target || ''}
                    onChange={(e) => updateAction(i, { ...rule, target: e.target.value })}
                    className="rounded border bg-background px-2 py-1 text-xs"
                  >
                    <option value="">Pick a section…</option>
                    {allSections.map((s, si) => (
                      <option key={s.id || si} value={s.id || String(si)}>
                        {s.title || `Section ${si + 1}`}
                      </option>
                    ))}
                  </select>
                )}
                {rule.action === 'REDIRECT' && (
                  <Input
                    value={rule.target || ''}
                    onChange={(e) => updateAction(i, { ...rule, target: e.target.value })}
                    placeholder="https://example.com/thanks"
                    className="h-7 text-xs max-w-[260px]"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeAction(i)}
                  className="ml-auto p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
                  aria-label="Remove rule"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Condition group */}
              <GroupEditor
                group={rule.when}
                sourceFields={sourceFields}
                onChange={(nextGroup) => updateAction(i, { ...rule, when: nextGroup })}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addAction}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Plus className="h-3 w-3" /> Add rule
      </button>
    </div>
  )
}
