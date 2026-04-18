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
