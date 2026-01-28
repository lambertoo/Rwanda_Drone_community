/**
 * Safe parsing and clamping of pagination query params.
 * Prevents DoS from oversized limit/offset.
 */

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
export const MAX_OFFSET = 10_000;

export function parseLimit(value: string | null | undefined, defaultVal = DEFAULT_LIMIT): number {
  if (value == null || value === '') return defaultVal;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 1) return defaultVal;
  return Math.min(n, MAX_LIMIT);
}

export function parseOffset(value: string | null | undefined): number {
  if (value == null || value === '') return 0;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, MAX_OFFSET);
}
