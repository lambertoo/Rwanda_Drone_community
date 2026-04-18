'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ChevronDown, GitBranch, Layers, Lock, CornerDownRight } from 'lucide-react'
import type { ActionRule, ConditionClause, ConditionGroup } from '@/lib/form-actions'

interface FlowField {
  name: string
  label: string
  type: string
  options?: any
  actions?: ActionRule[]
  validation?: { required?: boolean }
}

interface FlowSection {
  title: string
  description?: string | null
  order: number
  actions?: ActionRule[]
  fields: FlowField[]
}

interface FormFlowViewProps {
  form: {
    title: string
    description?: string | null
    sections: FlowSection[]
  }
}

// Extract the primary gating clause from a section's actions. We look for the
// first SHOW/HIDE rule whose `when` group has at least one leaf clause — that's
// usually the path-branching decision. Returns null if the section is always shown.
function primaryGate(actions?: ActionRule[]): ConditionClause | null {
  if (!Array.isArray(actions) || actions.length === 0) return null
  const first = actions.find(a => a.action === 'HIDE' || a.action === 'SHOW') ?? actions[0]
  const walk = (g: ConditionGroup | undefined | null): ConditionClause | null => {
    if (!g || !Array.isArray(g.clauses)) return null
    for (const c of g.clauses) {
      if ('field' in c && 'operator' in c) return c as ConditionClause
      const nested = walk(c as ConditionGroup)
      if (nested) return nested
    }
    return null
  }
  return walk(first.when)
}

function describeClause(c: ConditionClause | null, fieldLabels: Map<string, string>): string {
  if (!c) return 'always shown'
  const label = fieldLabels.get(c.field) || c.field
  const values = Array.isArray(c.value) ? c.value : c.value !== undefined && c.value !== '' ? [c.value] : []
  const niceValues = values.map(v => `"${v}"`).join(' or ')
  switch (c.operator) {
    case 'equals': return `when "${label}" is ${niceValues}`
    case 'not_equals': return `when "${label}" is not ${niceValues}`
    case 'contains': return `when "${label}" contains ${niceValues}`
    case 'not_contains': return `when "${label}" does not contain ${niceValues}`
    case 'in': return `when "${label}" is one of ${niceValues}`
    case 'not_in': return `when "${label}" is not one of ${niceValues}`
    case 'is_empty': return `when "${label}" is empty`
    case 'is_not_empty': return `when "${label}" is filled`
    default: return `when "${label}" ${c.operator} ${niceValues}`
  }
}

function groupSections(sections: FlowSection[]) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  const withGate = sorted.map(s => ({ s, gate: primaryGate(s.actions) }))

  const firstGatedIdx = withGate.findIndex(x => x.gate)
  const lastGatedIdx = (() => {
    for (let i = withGate.length - 1; i >= 0; i--) if (withGate[i].gate) return i
    return -1
  })()

  const entry: FlowSection[] = []
  const closing: FlowSection[] = []
  const gated: Array<{ s: FlowSection; gate: ConditionClause }> = []

  withGate.forEach(({ s, gate }, idx) => {
    if (!gate && (firstGatedIdx === -1 || idx < firstGatedIdx)) entry.push(s)
    else if (!gate && idx > lastGatedIdx) closing.push(s)
    else if (gate) gated.push({ s, gate })
  })

  // Group gated sections by their primary clause signature
  const groups = new Map<string, { clause: ConditionClause; sections: FlowSection[] }>()
  gated.forEach(({ s, gate }) => {
    const key = `${gate.field}::${gate.operator}::${Array.isArray(gate.value) ? (gate.value as string[]).join('|') : String(gate.value ?? '')}`
    if (!groups.has(key)) groups.set(key, { clause: gate, sections: [] })
    groups.get(key)!.sections.push(s)
  })

  return { entry, closing, groups: [...groups.values()] }
}

function buildFieldLabelMap(sections: FlowSection[]): Map<string, string> {
  const m = new Map<string, string>()
  sections.forEach(s => s.fields.forEach(f => m.set(f.name, f.label)))
  return m
}

function branchTheme(clause: ConditionClause): { ring: string; bg: string; text: string; dot: string } {
  const s = Array.isArray(clause.value) ? (clause.value as string[]).join(' ') : String(clause.value ?? '')
  const key = s.toLowerCase()
  if (key.includes('upstream')) return { ring: 'border-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-900 dark:text-indigo-200', dot: 'bg-indigo-500' }
  if (key.includes('midstream')) return { ring: 'border-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-200', dot: 'bg-emerald-500' }
  if (key.includes('investor')) return { ring: 'border-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-200', dot: 'bg-amber-500' }
  if (key.includes('downstream') || key.includes('end-user') || key.includes('advocacy')) return { ring: 'border-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-900 dark:text-rose-200', dot: 'bg-rose-500' }
  return { ring: 'border-slate-300', bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-slate-900 dark:text-slate-200', dot: 'bg-slate-500' }
}

function SectionNode({
  section,
  fieldLabels,
  accentDot,
  depth = 0,
}: {
  section: FlowSection
  fieldLabels: Map<string, string>
  accentDot: string
  depth?: number
}) {
  const isNested = depth > 0
  const gate = primaryGate(section.actions)
  return (
    <div
      className={`relative rounded-md border bg-background p-3 ${isNested ? 'border-dashed' : ''}`}
      style={{ marginLeft: depth * 16 }}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${accentDot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">
            {section.order}. {section.title}
          </p>
          {section.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{section.description}</p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {section.fields.length} field{section.fields.length === 1 ? '' : 's'}
          </p>
          {isNested && gate && (
            <div className="mt-1.5 flex items-start gap-1 rounded bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground">
              <CornerDownRight className="h-3 w-3 shrink-0 mt-0.5" />
              <span>Only {describeClause(gate, fieldLabels)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FormFlowView({ form }: FormFlowViewProps) {
  const sections = form.sections || []
  const fieldLabels = useMemo(() => buildFieldLabelMap(sections), [sections])
  const { entry, closing, groups } = useMemo(() => groupSections(sections), [sections])

  const branchField = groups[0]?.clause.field
  const branchFieldLabel = branchField ? fieldLabels.get(branchField) || branchField : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="h-3.5 w-3.5" />
          <span>Flow preview — how respondents will see this form based on their answers</span>
        </div>
        <h2 className="mt-1 text-xl font-semibold">{form.title}</h2>
        {form.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{form.description}</p>
        )}
      </div>

      {entry.length > 0 && (
        <>
          <Card className="border-slate-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-600" />
                  <CardTitle className="text-base">Everyone starts here</CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" /> Always shown
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {entry.map(s => (
                <SectionNode key={s.order} section={s} fieldLabels={fieldLabels} accentDot="bg-slate-500" />
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-center py-2 text-muted-foreground">
            <ArrowDown className="h-5 w-5" />
          </div>
        </>
      )}

      {groups.length > 0 && branchFieldLabel && (
        <div className="mx-auto mb-2 max-w-xl rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ChevronDown className="h-3.5 w-3.5" />
            Path depends on: <span className="text-foreground">{branchFieldLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group, gi) => {
            const theme = branchTheme(group.clause)
            const condText = describeClause(group.clause, fieldLabels)
            const branchLabel = (() => {
              const v = Array.isArray(group.clause.value) ? (group.clause.value as string[])[0] : group.clause.value
              const s = String(v ?? '')
              if (/upstream/i.test(s)) return 'Upstream'
              if (/midstream/i.test(s)) return 'Midstream'
              if (/investor/i.test(s)) return 'Downstream — Investor / Funder'
              if (/end-user|advocacy|downstream/i.test(s)) return 'Downstream — End-user / Advocacy'
              return 'Branch ' + (gi + 1)
            })()
            return (
              <Card key={gi} className={`${theme.ring} ${theme.bg}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`} />
                      <CardTitle className={`truncate text-sm ${theme.text}`}>{branchLabel}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{group.sections.length} sections</Badge>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Shown {condText}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {group.sections.map(s => {
                    const gate = primaryGate(s.actions)
                    const nested = gate && gate.field !== branchField
                    return (
                      <SectionNode
                        key={s.order}
                        section={s}
                        fieldLabels={fieldLabels}
                        accentDot={theme.dot}
                        depth={nested ? 1 : 0}
                      />
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {closing.length > 0 && (
        <>
          <div className="flex justify-center py-2 text-muted-foreground">
            <ArrowDown className="h-5 w-5" />
          </div>
          <Card className="border-slate-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-600" />
                  <CardTitle className="text-base">Everyone finishes here</CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" /> Always shown
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {closing.map(s => (
                <SectionNode key={s.order} section={s} fieldLabels={fieldLabels} accentDot="bg-slate-500" />
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <div className="mt-8 grid gap-3 text-center text-xs text-muted-foreground sm:grid-cols-4">
        <div className="rounded border bg-muted/40 px-3 py-2">
          <div className="font-semibold text-foreground">{sections.length}</div>
          Total sections
        </div>
        <div className="rounded border bg-muted/40 px-3 py-2">
          <div className="font-semibold text-foreground">{entry.length + closing.length}</div>
          Shown to everyone
        </div>
        <div className="rounded border bg-muted/40 px-3 py-2">
          <div className="font-semibold text-foreground">{groups.length}</div>
          Path branches
        </div>
        <div className="rounded border bg-muted/40 px-3 py-2">
          <div className="font-semibold text-foreground">
            {sections.reduce((n, s) => n + s.fields.length, 0)}
          </div>
          Total fields
        </div>
      </div>
    </div>
  )
}
