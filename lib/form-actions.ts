/**
 * Shared action-logic types + evaluator for UniversalForm.
 *
 * An action rule says "when <condition group> is true, apply <action> to this
 * section or field". Condition groups are AND/OR trees whose leaves are plain
 * clauses like "{field} equals {value}". This powers show/hide, require,
 * enable/disable, jump-to, end-form and redirect.
 */

export type ClauseOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'

export interface ConditionClause {
  field: string
  operator: ClauseOperator
  value?: string | string[] | number
}

export interface ConditionGroup {
  type: 'all' | 'any'
  clauses: Array<ConditionClause | ConditionGroup>
}

export type ActionType =
  | 'SHOW'
  | 'HIDE'
  | 'REQUIRE'
  | 'NOT_REQUIRE'
  | 'ENABLE'
  | 'DISABLE'
  | 'JUMP_TO'
  | 'END_FORM'
  | 'REDIRECT'

export interface ActionRule {
  id?: string
  action: ActionType
  when: ConditionGroup
  /** JUMP_TO: target section id. REDIRECT: target URL. */
  target?: string
}

// ─── Evaluator ────────────────────────────────────────────────

function isClause(node: ConditionClause | ConditionGroup): node is ConditionClause {
  return 'field' in node && 'operator' in node
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String)
  if (v === undefined || v === null) return []
  return [String(v)]
}

function asString(v: unknown): string {
  return Array.isArray(v) ? v.map(String).join(', ') : String(v ?? '')
}

function asNumber(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v)
  return NaN
}

export function evaluateClause(clause: ConditionClause, answers: Record<string, any>): boolean {
  const fieldValue = answers[clause.field]
  const list = asArray(fieldValue)
  const asStr = asString(fieldValue)
  const condArr = asArray(clause.value)
  const condSingle = typeof clause.value === 'string' || typeof clause.value === 'number'
    ? String(clause.value)
    : condArr[0] ?? ''
  const lcStr = asStr.toLowerCase()
  const lcCond = condSingle.toLowerCase()

  switch (clause.operator) {
    case 'equals': return asStr === condSingle
    case 'not_equals': return asStr !== condSingle
    case 'contains': return lcStr.includes(lcCond)
    case 'not_contains': return !lcStr.includes(lcCond)
    case 'in': return list.some(v => condArr.includes(v))
    case 'not_in': return list.length > 0 && list.some(v => v !== '') && !list.some(v => condArr.includes(v))
    case 'is_empty': return !fieldValue || asStr === '' || (Array.isArray(fieldValue) && fieldValue.length === 0)
    case 'is_not_empty': return !!fieldValue && asStr !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0)
    case 'greater_than': return asNumber(fieldValue) > asNumber(clause.value)
    case 'less_than': return asNumber(fieldValue) < asNumber(clause.value)
    case 'greater_or_equal': return asNumber(fieldValue) >= asNumber(clause.value)
    case 'less_or_equal': return asNumber(fieldValue) <= asNumber(clause.value)
    default: return false
  }
}

export function evaluateGroup(group: ConditionGroup, answers: Record<string, any>): boolean {
  if (!group || !Array.isArray(group.clauses) || group.clauses.length === 0) return true
  const results = group.clauses.map(node =>
    isClause(node) ? evaluateClause(node, answers) : evaluateGroup(node, answers),
  )
  return group.type === 'all' ? results.every(Boolean) : results.some(Boolean)
}

export function evaluateActions(actions: ActionRule[] | undefined | null, answers: Record<string, any>) {
  const active: ActionRule[] = []
  if (!Array.isArray(actions)) return active
  for (const rule of actions) {
    if (!rule || !rule.when) continue
    if (evaluateGroup(rule.when, answers)) active.push(rule)
  }
  return active
}

/**
 * Reduce a list of active actions into a set of effects for a single target
 * (section or field). Later rules win on conflicts — the last SHOW/HIDE wins,
 * last REQUIRE/NOT_REQUIRE wins, etc.
 */
export interface EffectState {
  visible?: boolean
  required?: boolean
  enabled?: boolean
  jumpTo?: string
  endForm?: boolean
  redirect?: string
}

export function reduceEffects(actions: ActionRule[]): EffectState {
  const s: EffectState = {}
  for (const rule of actions) {
    switch (rule.action) {
      case 'SHOW': s.visible = true; break
      case 'HIDE': s.visible = false; break
      case 'REQUIRE': s.required = true; break
      case 'NOT_REQUIRE': s.required = false; break
      case 'ENABLE': s.enabled = true; break
      case 'DISABLE': s.enabled = false; break
      case 'JUMP_TO': s.jumpTo = rule.target; break
      case 'END_FORM': s.endForm = true; break
      case 'REDIRECT': s.redirect = rule.target; break
    }
  }
  return s
}

// ─── UI helpers ──────────────────────────────────────────────

export const OPERATOR_LABELS: Record<ClauseOperator, string> = {
  equals: 'is',
  not_equals: 'is not',
  contains: 'contains',
  not_contains: 'does not contain',
  in: 'is one of',
  not_in: 'is none of',
  is_empty: 'is empty',
  is_not_empty: 'is filled in',
  greater_than: 'is greater than',
  less_than: 'is less than',
  greater_or_equal: 'is at least',
  less_or_equal: 'is at most',
}

export const ACTION_LABELS: Record<ActionType, string> = {
  SHOW: 'Show',
  HIDE: 'Hide',
  REQUIRE: 'Make required',
  NOT_REQUIRE: 'Make optional',
  ENABLE: 'Enable',
  DISABLE: 'Disable (read-only)',
  JUMP_TO: 'Jump to section',
  END_FORM: 'End form',
  REDIRECT: 'Redirect to URL',
}

export function emptyGroup(): ConditionGroup {
  return { type: 'all', clauses: [] }
}

export function emptyClause(field = ''): ConditionClause {
  return { field, operator: 'equals', value: '' }
}

export function newAction(action: ActionType = 'HIDE'): ActionRule {
  return { action, when: emptyGroup() }
}

// ─── Value piping ────────────────────────────────────────────
// Replaces {{field_name}} tokens in arbitrary text with the current answer
// for that field. Missing answers become an empty string.
const TOKEN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g

export function pipeValues(text: string | undefined | null, answers: Record<string, any>): string {
  if (!text) return ''
  return String(text).replace(TOKEN, (_m, key) => {
    const v = answers[key]
    if (v === undefined || v === null) return ''
    if (Array.isArray(v)) return v.map(String).join(', ')
    if (typeof v === 'object') return JSON.stringify(v)
    return String(v)
  })
}
