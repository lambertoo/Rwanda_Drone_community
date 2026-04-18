/**
 * Form-input sanitisation + type-aware validation.
 *
 * SQL injection is already prevented by Prisma's parameterised queries — we
 * never concatenate user input into a raw SQL string. This layer is about
 * everything else: stripping HTML/script tags from stored values, enforcing
 * length limits, validating that a value matches its declared field type, and
 * preventing oversized payloads.
 */

export const MAX_TEXT_LENGTH = 5000
export const MAX_LONG_TEXT_LENGTH = 20000
export const MAX_URL_LENGTH = 2048
export const MAX_ARRAY_ITEMS = 200

// Minimal HTML stripper — removes all tags and collapses whitespace. Keeps
// plain text readable for downstream reporting. We do NOT sanitise for
// display here (that's the rendering layer's job via React's auto-escaping).
export function stripHtml(input: string): string {
  return String(input)
    .replace(/<!--[\s\S]*?-->/g, '')              // comments
    .replace(/<script[\s\S]*?<\/script>/gi, '')   // <script>
    .replace(/<style[\s\S]*?<\/style>/gi, '')     // <style>
    .replace(/<[^>]*>/g, '')                       // any remaining tags
    .replace(/\s+/g, ' ')                          // collapse whitespace
    .trim()
}

// Truncate a string to a max length (keeps trailing whitespace trimmed).
export function clampLength(input: string, max: number): string {
  return input.length > max ? input.slice(0, max) : input
}

// Valid field types that accept scalar/text values.
type ScalarType =
  | 'SHORT_TEXT' | 'LONG_TEXT' | 'EMAIL' | 'PHONE' | 'URL'
  | 'NUMBER' | 'DATE' | 'TIME' | 'LINEAR_SCALE' | 'RATING'
  | 'MULTIPLE_CHOICE' | 'DROPDOWN' | 'RADIO' | 'HIDDEN_FIELD'
type ArrayType = 'CHECKBOXES' | 'MULTI_SELECT' | 'MATRIX' | 'FILE_UPLOAD'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Very permissive phone: digits + optional + - ( ) spaces; at least 5 digits.
const PHONE_RE = /^\+?[\d\s().-]{5,30}$/

export interface SanitizeResult {
  value: string | null
  error?: string
}

/**
 * Sanitise a single submitted value against its field definition.
 * Returns the value to store (or null if unanswered) plus an optional error
 * string if the input is rejected outright.
 */
export function sanitizeFieldValue(field: { type: string; options?: any; validation?: any }, raw: unknown): SanitizeResult {
  if (raw === undefined || raw === null || raw === '') return { value: null }

  const t = (field.type || '').toUpperCase()
  const v: any = field.validation || {}

  // File uploads arrive as string URLs or arrays of URLs. Accept those unchanged
  // but clamp to a sensible max size.
  if (t === 'FILE_UPLOAD') {
    if (Array.isArray(raw)) {
      const items = raw.slice(0, MAX_ARRAY_ITEMS).map(x => clampLength(String(x), MAX_URL_LENGTH))
      return { value: JSON.stringify(items) }
    }
    return { value: clampLength(String(raw), MAX_URL_LENGTH) }
  }

  // Array-style answers → JSON stringified array of sanitised strings.
  if (['CHECKBOXES', 'MULTI_SELECT', 'MATRIX'].includes(t)) {
    if (!Array.isArray(raw) && typeof raw !== 'object') {
      // A single value was sent for a multi field — coerce to one-element array.
      return { value: JSON.stringify([clampLength(stripHtml(String(raw)), MAX_TEXT_LENGTH)]) }
    }
    if (Array.isArray(raw)) {
      const cleaned = raw
        .slice(0, MAX_ARRAY_ITEMS)
        .map(x => (typeof x === 'string' ? clampLength(stripHtml(x), MAX_TEXT_LENGTH) : x))
      return { value: JSON.stringify(cleaned) }
    }
    // Matrix answer is usually an object keyed by row; stringify after
    // stripping each string value.
    const obj = raw as Record<string, any>
    const cleaned: Record<string, any> = {}
    for (const [k, val] of Object.entries(obj)) {
      cleaned[clampLength(stripHtml(k), 200)] =
        typeof val === 'string' ? clampLength(stripHtml(val), 500) : val
    }
    return { value: JSON.stringify(cleaned) }
  }

  // Scalars from here on.
  let str = typeof raw === 'string' ? raw : String(raw)

  switch (t as ScalarType) {
    case 'EMAIL': {
      str = str.trim().toLowerCase()
      str = clampLength(stripHtml(str), 320)
      if (!EMAIL_RE.test(str)) return { value: null, error: `"${field.validation?.label || 'Email'}" is not a valid email address` }
      return { value: str }
    }
    case 'PHONE': {
      str = clampLength(stripHtml(str), 30).trim()
      if (!PHONE_RE.test(str)) return { value: null, error: 'Phone number must contain 5–30 digits' }
      return { value: str }
    }
    case 'URL': {
      str = clampLength(stripHtml(str), MAX_URL_LENGTH).trim()
      try {
        // new URL() rejects obviously invalid ones
        if (str && !/^https?:\/\//i.test(str)) str = 'https://' + str
        new URL(str)
      } catch {
        return { value: null, error: 'Enter a valid URL' }
      }
      return { value: str }
    }
    case 'NUMBER':
    case 'LINEAR_SCALE':
    case 'RATING': {
      const n = Number(str)
      if (!Number.isFinite(n)) return { value: null, error: v.message || 'Enter a number' }
      if (v.integer && !Number.isInteger(n)) return { value: null, error: v.message || 'Enter a whole number' }
      if (typeof v.min === 'number' && n < v.min) return { value: null, error: v.message || `Value must be at least ${v.min}` }
      if (typeof v.max === 'number' && n > v.max) return { value: null, error: v.message || `Value must be at most ${v.max}` }
      return { value: String(n) }
    }
    case 'DATE':
    case 'TIME': {
      str = clampLength(stripHtml(str), 50).trim()
      return { value: str }
    }
    case 'LONG_TEXT': {
      const cleaned = clampLength(stripHtml(str), MAX_LONG_TEXT_LENGTH)
      return { value: cleaned }
    }
    case 'MULTIPLE_CHOICE':
    case 'DROPDOWN':
    case 'RADIO': {
      // Allow only values from the declared options set (if provided). Unknown
      // values are rejected to stop attackers from injecting arbitrary text
      // into what's supposed to be a constrained field.
      const cleaned = clampLength(stripHtml(str), MAX_TEXT_LENGTH)
      const options: any[] = Array.isArray(field.options) ? field.options : []
      if (options.length > 0 && !options.map(String).includes(cleaned)) {
        // Accept "Other" free-text sibling semantics by still storing the raw
        // value if validation is lenient. But for safety we reject.
        return { value: null, error: 'Choose one of the available options' }
      }
      return { value: cleaned }
    }
    case 'HIDDEN_FIELD':
    case 'SHORT_TEXT':
    default: {
      return { value: clampLength(stripHtml(str), MAX_TEXT_LENGTH) }
    }
  }
}

/**
 * Apply sanitizeFieldValue to every field in a form. Returns values keyed by
 * fieldId (for the DB write) and any first error encountered so the caller
 * can return 400.
 */
export function sanitizeSubmission(
  fields: Array<{ id: string; name: string; type: string; options?: any; validation?: any }>,
  body: Record<string, any>,
) {
  const out: Array<{ fieldId: string; value: string | null }> = []
  for (const f of fields) {
    const raw = body[f.name]
    const { value, error } = sanitizeFieldValue(f, raw)
    if (error) return { error, field: f.name }
    out.push({ fieldId: f.id, value })
  }
  return { values: out, error: null as string | null, field: null as string | null }
}

export const MAX_BODY_BYTES = 2 * 1024 * 1024 // 2 MB cap on full JSON payload

// ─── Form-structure sanitisation (for form authoring) ─────────
// When admins save a form definition, their inputs flow straight into
// the DB and later into public-form HTML. Strip HTML/script tags from
// every human-visible string so a malicious form author can't inject
// into the renderer or into submission emails.

export function cleanText(input: any, max: number = MAX_TEXT_LENGTH): string {
  if (input === undefined || input === null) return ''
  return clampLength(stripHtml(String(input)), max)
}

export function cleanLongText(input: any): string {
  return cleanText(input, MAX_LONG_TEXT_LENGTH)
}

export function sanitizeFormStructure(form: any) {
  if (!form || typeof form !== 'object') return form
  const out: any = { ...form }
  if (out.title !== undefined) out.title = cleanText(out.title, 500)
  if (out.description !== undefined) out.description = cleanLongText(out.description)
  if (out.slug !== undefined) out.slug = cleanText(out.slug, 200).replace(/[^a-z0-9-_]/gi, '-').toLowerCase()
  if (out.settings && typeof out.settings === 'object') {
    out.settings = sanitizeSettings(out.settings)
  }
  if (Array.isArray(out.sections)) {
    out.sections = out.sections.map(sanitizeSection)
  }
  return out
}

function sanitizeSettings(s: any) {
  const out: any = { ...s }
  if (out.submitButtonText !== undefined) out.submitButtonText = cleanText(out.submitButtonText, 100)
  if (out.thankYouHeading !== undefined) out.thankYouHeading = cleanText(out.thankYouHeading, 200)
  if (out.confirmationMessage !== undefined) out.confirmationMessage = cleanLongText(out.confirmationMessage)
  if (out.closedMessage !== undefined) out.closedMessage = cleanLongText(out.closedMessage)
  if (out.redirectUrl !== undefined) out.redirectUrl = cleanText(out.redirectUrl, MAX_URL_LENGTH)
  if (out.coverImage !== undefined) out.coverImage = cleanText(out.coverImage, MAX_URL_LENGTH)
  if (out.logo !== undefined) out.logo = cleanText(out.logo, MAX_URL_LENGTH)
  if (out.backgroundImage !== undefined) out.backgroundImage = cleanText(out.backgroundImage, MAX_URL_LENGTH)
  if (out.backgroundGradient !== undefined) out.backgroundGradient = cleanText(out.backgroundGradient, 500)
  if (out.fontFamily !== undefined) out.fontFamily = cleanText(out.fontFamily, 200)
  if (out.notifyEmails !== undefined) out.notifyEmails = cleanText(out.notifyEmails, 1000)
  if (Array.isArray(out.webhooks)) out.webhooks = out.webhooks.map((u: any) => cleanText(u, MAX_URL_LENGTH)).filter(Boolean).slice(0, 50)
  if (Array.isArray(out.allowedIPs)) out.allowedIPs = out.allowedIPs.map((u: any) => cleanText(u, 64)).filter(Boolean).slice(0, 200)
  if (Array.isArray(out.branchColors)) {
    out.branchColors = out.branchColors.map((r: any) => ({
      match: cleanText(r?.match, 200),
      label: cleanText(r?.label, 200),
      color: cleanText(r?.color, 32),
    })).filter((r: any) => r.match || r.label)
  }
  return out
}

function sanitizeSection(s: any) {
  if (!s || typeof s !== 'object') return s
  const out: any = { ...s }
  if (out.title !== undefined) out.title = cleanText(out.title, 500)
  if (out.description !== undefined) out.description = cleanLongText(out.description)
  if (Array.isArray(out.fields)) out.fields = out.fields.map(sanitizeField)
  // actions is a nested JSON — leave it structured but strip text inside clauses
  if (Array.isArray(out.actions)) out.actions = out.actions.map(sanitizeActionRule)
  return out
}

function sanitizeField(f: any) {
  if (!f || typeof f !== 'object') return f
  const out: any = { ...f }
  if (out.label !== undefined) out.label = cleanText(out.label, 1000)
  if (out.name !== undefined) out.name = cleanText(out.name, 200).replace(/[^a-z0-9_-]/gi, '_')
  if (out.placeholder !== undefined) out.placeholder = cleanText(out.placeholder, 500)
  if (Array.isArray(out.options)) out.options = out.options.map((o: any) => cleanText(o, 500)).slice(0, 500)
  if (Array.isArray(out.matrixRows)) out.matrixRows = out.matrixRows.map((o: any) => cleanText(o, 500)).slice(0, 200)
  if (Array.isArray(out.matrixColumns)) out.matrixColumns = out.matrixColumns.map((o: any) => cleanText(o, 300)).slice(0, 50)
  if (out.leftLabel !== undefined) out.leftLabel = cleanText(out.leftLabel, 200)
  if (out.centerLabel !== undefined) out.centerLabel = cleanText(out.centerLabel, 200)
  if (out.rightLabel !== undefined) out.rightLabel = cleanText(out.rightLabel, 200)
  if (Array.isArray(out.actions)) out.actions = out.actions.map(sanitizeActionRule)
  return out
}

function sanitizeActionRule(r: any) {
  if (!r || typeof r !== 'object') return r
  const out: any = { ...r }
  if (out.target !== undefined) out.target = cleanText(out.target, MAX_URL_LENGTH)
  if (out.when) out.when = sanitizeGroup(out.when)
  return out
}

function sanitizeGroup(g: any): any {
  if (!g || typeof g !== 'object') return g
  const out: any = { type: g.type === 'any' ? 'any' : 'all', clauses: [] }
  if (Array.isArray(g.clauses)) {
    out.clauses = g.clauses.map((c: any) => {
      if (!c) return c
      if ('field' in c && 'operator' in c) {
        return {
          field: cleanText(c.field, 200),
          operator: cleanText(c.operator, 40),
          value: Array.isArray(c.value)
            ? c.value.map((x: any) => cleanText(x, 500)).slice(0, 200)
            : (c.value !== undefined ? cleanText(c.value, 500) : undefined),
        }
      }
      return sanitizeGroup(c)
    })
  }
  return out
}
