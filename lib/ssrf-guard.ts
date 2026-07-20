import { lookup } from 'dns/promises'
import { isIP } from 'net'

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return true
  const [a, b] = parts
  if (a === 10) return true
  if (a === 127) return true
  if (a === 0) return true
  if (a === 169 && b === 254) return true // link-local + cloud metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  if (lower.startsWith('fe80')) return true // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true // unique-local
  if (lower.startsWith('::ffff:')) return isPrivateIPv4(lower.slice(7)) // mapped v4
  return false
}

function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip)
  if (kind === 4) return isPrivateIPv4(ip)
  if (kind === 6) return isPrivateIPv6(ip)
  return true
}

// Resolve the host and reject private/loopback/link-local/metadata targets.
// Re-checks the resolved IP (not just the literal) to blunt DNS-rebinding.
export async function isPublicWebhookUrl(rawUrl: string): Promise<boolean> {
  let host: string
  let port: string
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    host = parsed.hostname
    port = parsed.port
  } catch {
    return false
  }
  if (port && !['80', '443', '8080', '8443'].includes(port)) return false
  if (isIP(host)) return !isBlockedAddress(host)
  try {
    const results = await lookup(host, { all: true })
    if (results.length === 0) return false
    return results.every(r => !isBlockedAddress(r.address))
  } catch {
    return false
  }
}
