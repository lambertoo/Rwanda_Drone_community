/**
 * Per-form branch colour theming.
 *
 * A form's author can define `settings.branchColors`: a list of
 *   { match: string, label?: string, color: PaletteKey }
 * entries. The first entry whose `match` is a case-insensitive substring of
 * the branching condition's value wins, and its colour is used for the flow
 * view card and the path accent in the editor.
 *
 * Without any configuration the form falls back to a generic slate/violet
 * palette so new forms still render cleanly.
 */

export type PaletteKey =
  | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate'
  | 'blue' | 'purple' | 'teal' | 'cyan' | 'pink' | 'orange' | 'lime'

export interface BranchTheme {
  ring: string      // border / ring class for flow cards
  bg: string        // subtle background tint
  text: string      // heading text colour
  dot: string       // bg colour for dot/bullet marker
  border: string    // left-border class for edit-mode section accent
  accentBg: string  // subtle bg for edit-mode section
  badgeClass: string // badge pill background + text colour
}

export interface BranchColorRule {
  /** Case-insensitive substring match on the condition value */
  match: string
  /** Optional nicer label for the branch when rendered in flow view */
  label?: string
  /** Palette key */
  color: PaletteKey
}

// Tailwind class bundles. Kept as string literals so the JIT picker always
// emits them into the production CSS.
const PALETTE: Record<PaletteKey, BranchTheme> = {
  indigo: {
    ring: 'border-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-900 dark:text-indigo-200',
    dot: 'bg-indigo-500',
    border: 'border-l-indigo-400',
    accentBg: 'bg-indigo-50/30 dark:bg-indigo-950/10',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  },
  emerald: {
    ring: 'border-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-900 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    border: 'border-l-emerald-400',
    accentBg: 'bg-emerald-50/30 dark:bg-emerald-950/10',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  amber: {
    ring: 'border-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-900 dark:text-amber-200',
    dot: 'bg-amber-500',
    border: 'border-l-amber-400',
    accentBg: 'bg-amber-50/30 dark:bg-amber-950/10',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  rose: {
    ring: 'border-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-900 dark:text-rose-200',
    dot: 'bg-rose-500',
    border: 'border-l-rose-400',
    accentBg: 'bg-rose-50/30 dark:bg-rose-950/10',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  },
  violet: {
    ring: 'border-violet-300',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-900 dark:text-violet-200',
    dot: 'bg-violet-500',
    border: 'border-l-violet-400',
    accentBg: 'bg-violet-50/30 dark:bg-violet-950/10',
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  },
  slate: {
    ring: 'border-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-900/40',
    text: 'text-slate-900 dark:text-slate-200',
    dot: 'bg-slate-500',
    border: 'border-l-slate-300',
    accentBg: '',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  blue: {
    ring: 'border-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-900 dark:text-blue-200',
    dot: 'bg-blue-500',
    border: 'border-l-blue-400',
    accentBg: 'bg-blue-50/30 dark:bg-blue-950/10',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  },
  purple: {
    ring: 'border-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-900 dark:text-purple-200',
    dot: 'bg-purple-500',
    border: 'border-l-purple-400',
    accentBg: 'bg-purple-50/30 dark:bg-purple-950/10',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  },
  teal: {
    ring: 'border-teal-300',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-900 dark:text-teal-200',
    dot: 'bg-teal-500',
    border: 'border-l-teal-400',
    accentBg: 'bg-teal-50/30 dark:bg-teal-950/10',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  },
  cyan: {
    ring: 'border-cyan-300',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-900 dark:text-cyan-200',
    dot: 'bg-cyan-500',
    border: 'border-l-cyan-400',
    accentBg: 'bg-cyan-50/30 dark:bg-cyan-950/10',
    badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  },
  pink: {
    ring: 'border-pink-300',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    text: 'text-pink-900 dark:text-pink-200',
    dot: 'bg-pink-500',
    border: 'border-l-pink-400',
    accentBg: 'bg-pink-50/30 dark:bg-pink-950/10',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
  },
  orange: {
    ring: 'border-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-900 dark:text-orange-200',
    dot: 'bg-orange-500',
    border: 'border-l-orange-400',
    accentBg: 'bg-orange-50/30 dark:bg-orange-950/10',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  },
  lime: {
    ring: 'border-lime-300',
    bg: 'bg-lime-50 dark:bg-lime-950/40',
    text: 'text-lime-900 dark:text-lime-200',
    dot: 'bg-lime-500',
    border: 'border-l-lime-400',
    accentBg: 'bg-lime-50/30 dark:bg-lime-950/10',
    badgeClass: 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200',
  },
}

export const PALETTE_KEYS = Object.keys(PALETTE) as PaletteKey[]

export function paletteTheme(color: PaletteKey | string | undefined): BranchTheme {
  return PALETTE[(color as PaletteKey) || 'slate'] || PALETTE.slate
}

/**
 * Default palette used when a form has no branchColors configured. Matches
 * the original UAS survey look so nothing breaks.
 */
const DEFAULT_RULES: BranchColorRule[] = [
  { match: 'upstream', color: 'indigo', label: 'Upstream' },
  { match: 'midstream', color: 'emerald', label: 'Midstream' },
  { match: 'investor', color: 'amber', label: 'Investor' },
  { match: 'end-user', color: 'rose', label: 'End-user' },
  { match: 'advocacy', color: 'rose', label: 'Advocacy' },
  { match: 'downstream', color: 'rose', label: 'Downstream' },
]

/**
 * Find the matching branch colour rule for a condition value. Iterates user
 * rules first (case-insensitive substring match), then defaults, then slate.
 */
export function pickBranchTheme(value: string | string[] | undefined, rules?: BranchColorRule[] | null): {
  theme: BranchTheme
  label: string | null
  color: PaletteKey
} {
  const v = Array.isArray(value) ? value.join(' ') : String(value ?? '')
  const key = v.toLowerCase()
  const merged = [...(Array.isArray(rules) ? rules : []), ...DEFAULT_RULES]
  for (const r of merged) {
    if (r.match && key.includes(r.match.toLowerCase())) {
      return { theme: paletteTheme(r.color), label: r.label ?? null, color: r.color }
    }
  }
  return { theme: paletteTheme('slate'), label: null, color: 'slate' }
}
