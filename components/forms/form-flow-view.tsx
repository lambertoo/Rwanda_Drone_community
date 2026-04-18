'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ChevronDown, GitBranch, Layers, Lock, CornerDownRight } from 'lucide-react'

type Conditional = { dependsOn: string; operator: string; value: string | string[] } | null

interface FlowField {
  name: string
  label: string
  type: string
  options?: any
  conditional?: Conditional
  validation?: { required?: boolean }
}

interface FlowSection {
  title: string
  description?: string | null
  order: number
  conditional?: Conditional
  fields: FlowField[]
}

interface FormFlowViewProps {
  form: {
    title: string
    description?: string | null
    sections: FlowSection[]
  }
}

// Humanise a conditional into plain English
function describeCondition(c: Conditional, fieldLabels: Map<string, string>): string {
  if (!c) return 'always shown'
  const label = fieldLabels.get(c.dependsOn) || c.dependsOn
  const values = Array.isArray(c.value) ? c.value : [c.value]
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

// Group sections by their top-level branching rule.
// Our form convention: conditionals depend on a single field (CS4 for the main
// branch). Sections with no conditional are common (entry/closing). We split
// entry vs closing by section order: entries come before the first branched
// section, closers come after the last.
function groupSections(sections: FlowSection[]) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)
  const firstBranchedIdx = sorted.findIndex(s => !!s.conditional)
  const lastBranchedIdx = (() => {
    for (let i = sorted.length - 1; i >= 0; i--) if (sorted[i].conditional) return i
    return -1
  })()

  const entry: FlowSection[] = []
  const closing: FlowSection[] = []
  const branched: FlowSection[] = []

  sorted.forEach((s, idx) => {
    if (!s.conditional && (firstBranchedIdx === -1 || idx < firstBranchedIdx)) entry.push(s)
    else if (!s.conditional && idx > lastBranchedIdx) closing.push(s)
    else branched.push(s)
  })

  // Group branched sections by their top-level conditional signature
  const groups = new Map<string, { label: string; condition: Conditional; sections: FlowSection[] }>()
  branched.forEach(s => {
    const c = s.conditional!
    const key = `${c.dependsOn}::${c.operator}::${Array.isArray(c.value) ? c.value.join('|') : c.value}`
    if (!groups.has(key)) groups.set(key, { label: key, condition: c, sections: [] })
    groups.get(key)!.sections.push(s)
  })

  return { entry, closing, groups: [...groups.values()] }
}

// Build a map of field name → human label across all sections
function buildFieldLabelMap(sections: FlowSection[]): Map<string, string> {
  const m = new Map<string, string>()
  sections.forEach(s => s.fields.forEach(f => m.set(f.name, f.label)))
  return m
}

// Pick a colour theme per branch based on its condition value
function branchTheme(condition: Conditional): { ring: string; bg: string; text: string; dot: string } {
  const s = condition ? (Array.isArray(condition.value) ? condition.value.join(' ') : String(condition.value)) : ''
  const key = s.toLowerCase()
  if (key.includes('upstream')) return { ring: 'border-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-900 dark:text-indigo-200', dot: 'bg-indigo-500' }
  if (key.includes('midstream')) return { ring: 'border-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-900 dark:text-emerald-200', dot: 'bg-emerald-500' }
  if (key.includes('downstream') && key.includes('investor')) return { ring: 'border-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-200', dot: 'bg-amber-500' }
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
  const hasNestedCondition = depth > 0
  return (
    <div
      className={`relative rounded-md border bg-background p-3 ${hasNestedCondition ? 'border-dashed' : ''}`}
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
          {hasNestedCondition && section.conditional && (
            <div className="mt-1.5 flex items-start gap-1 rounded bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground">
              <CornerDownRight className="h-3 w-3 shrink-0 mt-0.5" />
              <span>Only {describeCondition(section.conditional, fieldLabels)}</span>
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

  // Identify the branching field (usually CS4)
  const branchField = groups[0]?.condition?.dependsOn
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

      {/* Entry block */}
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

      {/* Branching decision */}
      {groups.length > 0 && branchFieldLabel && (
        <div className="mx-auto mb-2 max-w-xl rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ChevronDown className="h-3.5 w-3.5" />
            Path depends on: <span className="text-foreground">{branchFieldLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      )}

      {/* Branch groups: grid of path columns */}
      {groups.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group, gi) => {
            const theme = branchTheme(group.condition)
            const condText = describeCondition(group.condition, fieldLabels)
            // Find a short branch label from the condition value
            const branchLabel = (() => {
              const v = group.condition ? (Array.isArray(group.condition.value) ? group.condition.value[0] : group.condition.value) : ''
              const s = String(v)
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
                  {group.sections.map(s => (
                    <SectionNode
                      key={s.order}
                      section={s}
                      fieldLabels={fieldLabels}
                      accentDot={theme.dot}
                      // Treat nested conditions (conditional field that is NOT the top-level branch
                      // field itself) as "nested" visually. This catches e.g. UP-3 which branches
                      // on up11_primary_role rather than cs4_value_chain.
                      depth={s.conditional && s.conditional.dependsOn !== branchField ? 1 : 0}
                    />
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Closing block */}
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

      {/* Stats footer */}
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
