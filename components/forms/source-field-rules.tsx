'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ACTION_LABELS, type ActionRule, type ActionType, type ConditionClause, type ConditionGroup } from '@/lib/form-actions'
import { Plus, Trash2, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type Owner =
  | { kind: 'section'; sectionId: string; sectionTitle: string }
  | { kind: 'field'; sectionId: string; sectionTitle: string; fieldId: string; fieldLabel: string }

interface ConsumerRule {
  owner: Owner
  ruleIndex: number
  rule: ActionRule
  /** path of clause indices inside rule.when that target the source field, e.g. [0] or [1, 2] */
  clausePath: number[]
  clause: ConditionClause
}

interface SourceFieldRulesProps {
  sourceField: { id: string; name: string; label: string; type: string; options?: string[] }
  allSections: any[]
  updateSection: (id: string, updates: any) => void
  updateField: (id: string, updates: any) => void
}

/** Walks a condition group and returns the paths of all direct clauses matching a given field name. */
function findClausePaths(group: ConditionGroup, sourceName: string, prefix: number[] = []): Array<{ path: number[]; clause: ConditionClause }> {
  const out: Array<{ path: number[]; clause: ConditionClause }> = []
  if (!group || !Array.isArray(group.clauses)) return out
  group.clauses.forEach((node, i) => {
    if ('field' in node && 'operator' in node) {
      if ((node as ConditionClause).field === sourceName) {
        out.push({ path: [...prefix, i], clause: node as ConditionClause })
      }
    } else {
      out.push(...findClausePaths(node as ConditionGroup, sourceName, [...prefix, i]))
    }
  })
  return out
}

function setClauseInGroup(group: ConditionGroup, path: number[], newClause: ConditionClause): ConditionGroup {
  if (path.length === 0) return group
  const idx = path[0]
  const nextClauses = [...(group.clauses || [])]
  if (path.length === 1) {
    nextClauses[idx] = newClause
  } else {
    nextClauses[idx] = setClauseInGroup(nextClauses[idx] as ConditionGroup, path.slice(1), newClause)
  }
  return { ...group, clauses: nextClauses }
}

function collectConsumers(sourceName: string, sections: any[]): ConsumerRule[] {
  const out: ConsumerRule[] = []
  for (const s of sections) {
    const sectionActions: any[] = Array.isArray(s.actions) ? s.actions : []
    sectionActions.forEach((rule: ActionRule, ruleIndex: number) => {
      const paths = findClausePaths(rule.when, sourceName)
      for (const p of paths) {
        out.push({
          owner: { kind: 'section', sectionId: s.id, sectionTitle: s.title || 'Untitled section' },
          ruleIndex,
          rule,
          clausePath: p.path,
          clause: p.clause,
        })
      }
    })
    for (const f of s.fields || []) {
      const fieldActions: any[] = Array.isArray(f.actions) ? f.actions : []
      fieldActions.forEach((rule: ActionRule, ruleIndex: number) => {
        const paths = findClausePaths(rule.when, sourceName)
        for (const p of paths) {
          out.push({
            owner: {
              kind: 'field',
              sectionId: s.id,
              sectionTitle: s.title || 'Untitled section',
              fieldId: f.id,
              fieldLabel: f.label || f.name,
            },
            ruleIndex,
            rule,
            clausePath: p.path,
            clause: p.clause,
          })
        }
      })
    }
  }
  return out
}

// Map action + operator combo → a plain-English lead verb.
// The seed uses HIDE with a negative operator to express "show when X",
// so we translate back to the positive phrasing for the author.
function prettifyVerb(action: ActionType, operator: string): { verb: string; polarity: 'when' | 'unless' } {
  const showish = action === 'SHOW' || action === 'REQUIRE' || action === 'ENABLE'
  const hideish = action === 'HIDE' || action === 'NOT_REQUIRE' || action === 'DISABLE'
  const negOp = operator === 'not_equals' || operator === 'not_contains' || operator === 'not_in'
  // HIDE with a negative operator = SHOW with the matching positive value
  if (hideish && negOp) {
    if (action === 'HIDE') return { verb: 'Show', polarity: 'when' }
    if (action === 'NOT_REQUIRE') return { verb: 'Require', polarity: 'when' }
    if (action === 'DISABLE') return { verb: 'Enable', polarity: 'when' }
  }
  if (showish) return { verb: ACTION_LABELS[action].replace('Make ', '').replace(' (read-only)', ''), polarity: 'when' }
  if (hideish) return { verb: ACTION_LABELS[action].replace('Make ', '').replace(' (read-only)', ''), polarity: 'when' }
  return { verb: ACTION_LABELS[action] || action, polarity: 'when' }
}

// Convert a stored clause into the user-visible positive operator + values array.
function positiveValues(operator: string, value: any): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (value === undefined || value === null || value === '') return []
  return [String(value)]
}

export default function SourceFieldRules({ sourceField, allSections, updateSection, updateField }: SourceFieldRulesProps) {
  const [adding, setAdding] = useState(false)
  const consumers = collectConsumers(sourceField.name, allSections)

  const persistClauseChange = (c: ConsumerRule, nextClause: ConditionClause) => {
    const owner = c.owner
    const nextWhen = setClauseInGroup(c.rule.when, c.clausePath, nextClause)
    const updateAt = (arr: ActionRule[]) => {
      const next = [...arr]
      next[c.ruleIndex] = { ...c.rule, when: nextWhen }
      return next
    }
    if (owner.kind === 'section') {
      const section = allSections.find(s => s.id === owner.sectionId)
      if (!section) return
      const nextActions = updateAt(section.actions || [])
      updateSection(owner.sectionId, { actions: nextActions })
    } else {
      const section = allSections.find(s => s.id === owner.sectionId)
      const field = section?.fields.find((f: any) => f.id === owner.fieldId)
      if (!field) return
      const nextActions = updateAt(field.actions || [])
      updateField(owner.fieldId, { actions: nextActions })
    }
  }

  const removeRule = (c: ConsumerRule) => {
    if (c.owner.kind === 'section') {
      const section = allSections.find(s => s.id === c.owner.sectionId)
      if (!section) return
      const nextActions = (section.actions || []).filter((_: any, i: number) => i !== c.ruleIndex)
      updateSection(c.owner.sectionId, { actions: nextActions })
    } else {
      const section = allSections.find(s => s.id === c.owner.sectionId)
      const field = section?.fields.find((f: any) => f.id === c.owner.fieldId)
      if (!field) return
      const nextActions = (field.actions || []).filter((_: any, i: number) => i !== c.ruleIndex)
      updateField(c.owner.fieldId, { actions: nextActions })
    }
  }

  const options = Array.isArray(sourceField.options) ? sourceField.options : []

  const [panelExpanded, setPanelExpanded] = useState(consumers.length <= 3)
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50/80 dark:bg-blue-950/30 dark:border-blue-900 p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setPanelExpanded(v => !v)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-expanded={panelExpanded}
        >
          {panelExpanded ? <ChevronDown className="h-3.5 w-3.5 text-blue-700" /> : <ChevronRight className="h-3.5 w-3.5 text-blue-700" />}
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
            Rules driven by this answer
          </span>
          <Badge className="text-[10px] bg-blue-600 hover:bg-blue-600">
            {consumers.length}
          </Badge>
        </button>
        {panelExpanded && (
          <button
            type="button"
            onClick={() => setAdding(a => !a)}
            className="text-[11px] text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add rule
          </button>
        )}
      </div>

      {panelExpanded && consumers.length === 0 && !adding && (
        <p className="text-[11px] text-blue-900/70 italic">
          No other sections or fields depend on this answer yet.
        </p>
      )}

      {panelExpanded && (
      <div className="space-y-2">
        {consumers.map((c, i) => {
          const { verb } = prettifyVerb(c.rule.action, c.clause.operator)
          const values = positiveValues(c.clause.operator, c.clause.value)
          const negOp = c.clause.operator === 'not_equals' || c.clause.operator === 'not_contains' || c.clause.operator === 'not_in'
          const targetLabel = c.owner.kind === 'section'
            ? `Section: ${c.owner.sectionTitle}`
            : `Field: ${c.owner.fieldLabel} (in ${c.owner.sectionTitle})`
          return (
            <ConsumerCard
              key={i}
              verb={verb}
              targetLabel={targetLabel}
              negated={negOp}
              values={values}
              sourceOptions={options}
              onValuesChange={(nextValues) => {
                // Choose the cleanest operator based on action and value count
                const multi = nextValues.length > 1
                const hideish = c.rule.action === 'HIDE' || c.rule.action === 'NOT_REQUIRE' || c.rule.action === 'DISABLE'
                const nextOperator: any = hideish
                  ? (multi ? 'not_in' : 'not_equals')
                  : (multi ? 'in' : 'equals')
                const nextClause: ConditionClause = {
                  field: sourceField.name,
                  operator: nextOperator,
                  value: multi ? nextValues : (nextValues[0] ?? ''),
                }
                persistClauseChange(c, nextClause)
              }}
              onRemove={() => removeRule(c)}
            />
          )
        })}
      </div>
      )}

      {panelExpanded && adding && (
        <AddRuleForm
          sourceField={sourceField}
          allSections={allSections}
          onCancel={() => setAdding(false)}
          onSave={(action, targetSectionId, values) => {
            const multi = values.length > 1
            const hideish = action === 'HIDE' || action === 'NOT_REQUIRE' || action === 'DISABLE'
            const operator: any = hideish ? (multi ? 'not_in' : 'not_equals') : (multi ? 'in' : 'equals')
            const newRule: ActionRule = {
              action,
              when: {
                type: 'all',
                clauses: [{ field: sourceField.name, operator, value: multi ? values : (values[0] ?? '') }],
              },
            }
            const section = allSections.find(s => s.id === targetSectionId)
            if (!section) return
            const nextActions = [...(section.actions || []), newRule]
            updateSection(targetSectionId, { actions: nextActions })
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}

function ConsumerCard({
  verb, targetLabel, negated, values, sourceOptions, onValuesChange, onRemove,
}: {
  verb: string
  targetLabel: string
  negated: boolean
  values: string[]
  sourceOptions: string[]
  onValuesChange: (next: string[]) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const whenLabel = negated ? 'is NOT' : 'is'
  const hasOptions = sourceOptions.length > 0
  // Build the collapsed summary: e.g. "Upstream: Training... + 2 more"
  const summary = (() => {
    if (values.length === 0) return <span className="italic text-muted-foreground">No values</span>
    if (values.length === 1) return <span className="truncate">{values[0]}</span>
    return (
      <span className="truncate">
        {values[0]} <span className="text-muted-foreground">+ {values.length - 1} more</span>
      </span>
    )
  })()

  return (
    <div className="rounded-md border bg-background">
      {/* Collapsed / always-visible header — clicking toggles expand */}
      <div className="flex items-start gap-2 p-2.5">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="flex-1 min-w-0 text-left hover:bg-muted/30 -m-1 p-1 rounded transition-colors"
        >
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {expanded ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{verb}</Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium truncate">{targetLabel}</span>
          </div>
          <div className="mt-1 pl-5 text-[11px] text-muted-foreground truncate">
            When answer {whenLabel}: {summary}
          </div>
        </button>
        <button type="button" onClick={onRemove} className="shrink-0 p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600" aria-label="Remove rule">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t px-2.5 py-2 bg-muted/20 space-y-1">
          <div className="text-[11px] text-muted-foreground pb-1">
            Pick the answer values that trigger this rule:
          </div>
          {hasOptions ? (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1 min-h-[28px] rounded border bg-background p-1">
                {values.length === 0 && (
                  <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground italic">Pick at least one value</span>
                )}
                {values.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onValuesChange(values.filter(x => x !== v))}
                    className="inline-flex items-center gap-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-1.5 py-0.5 text-[11px] hover:bg-blue-200"
                    title="Remove"
                  >
                    {v}
                    <span>×</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {sourceOptions.filter(o => !values.includes(o)).map(o => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => onValuesChange([...values, o])}
                    className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px] hover:bg-muted"
                  >
                    <Plus className="h-2.5 w-2.5" /> <span className="truncate max-w-[260px]">{o}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Input
              value={values.join(', ')}
              onChange={(e) => onValuesChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Comma-separated values"
              className="h-7 text-xs"
            />
          )}
        </div>
      )}
    </div>
  )
}

function AddRuleForm({
  sourceField, allSections, onCancel, onSave,
}: {
  sourceField: SourceFieldRulesProps['sourceField']
  allSections: any[]
  onCancel: () => void
  onSave: (action: ActionType, targetSectionId: string, values: string[]) => void
}) {
  const [action, setAction] = useState<ActionType>('HIDE')
  const [targetSectionId, setTargetSectionId] = useState<string>('')
  const [values, setValues] = useState<string[]>([])
  const options = Array.isArray(sourceField.options) ? sourceField.options : []
  const hideish = action === 'HIDE' || action === 'NOT_REQUIRE' || action === 'DISABLE'
  const verb = hideish ? 'Hide' : action === 'SHOW' ? 'Show' : ACTION_LABELS[action]

  return (
    <div className="mt-3 rounded-md border border-blue-300 bg-background p-3 space-y-2">
      <p className="text-xs font-semibold">New rule</p>
      <div className="grid gap-2">
        <div>
          <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionType)}
            className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
          >
            <option value="HIDE">Hide</option>
            <option value="SHOW">Show</option>
            <option value="JUMP_TO">Jump to</option>
            <option value="END_FORM">End form</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-muted-foreground">Target section</label>
          <select
            value={targetSectionId}
            onChange={(e) => setTargetSectionId(e.target.value)}
            className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
          >
            <option value="">Pick a section…</option>
            {allSections.map((s, i) => (
              <option key={s.id} value={s.id}>{s.title || `Section ${i + 1}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wide text-muted-foreground">When answer is one of</label>
          {options.length > 0 ? (
            <div className="mt-0.5 space-y-1">
              <div className="flex flex-wrap gap-1 min-h-[28px] rounded border bg-background p-1">
                {values.length === 0 && <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground italic">No values picked</span>}
                {values.map(v => (
                  <button key={v} type="button" onClick={() => setValues(values.filter(x => x !== v))}
                    className="inline-flex items-center gap-1 rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[11px]"
                  >
                    {v} <span>×</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {options.filter(o => !values.includes(o)).map(o => (
                  <button key={o} type="button" onClick={() => setValues([...values, o])}
                    className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px] hover:bg-muted"
                  >
                    <Plus className="h-2.5 w-2.5" /> <span className="truncate max-w-[240px]">{o}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Input value={values.join(', ')} onChange={(e) => setValues(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Comma-separated values" className="h-8 text-xs mt-0.5" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button type="button" size="sm" disabled={!targetSectionId || values.length === 0}
          onClick={() => onSave(action, targetSectionId, values)}
        >
          {verb} when this answer is picked
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}
