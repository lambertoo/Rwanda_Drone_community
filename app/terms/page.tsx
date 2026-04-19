"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default function TermsPage() {
  return <StaticPage slug="terms" />
}

function StaticPage({ slug }: { slug: string }) {
  const [data, setData] = useState<{ title: string; content: string; updatedAt: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ maxWidth: 760, margin: "64px auto", padding: "0 24px" }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-muted animate-pulse rounded" style={{ height: i === 0 ? 36 : 16, marginBottom: 14, width: i === 0 ? "60%" : `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  )

  if (!data) return null

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 64px" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", textDecoration: "none", marginBottom: 32 }}>
        <ArrowLeft size={14} /> Back to home
      </Link>

      <h1 style={{ fontSize: "clamp(26px,4vw,36px)", fontWeight: 800, color: "#003366", marginBottom: 8 }}>{data.title}</h1>

      {data.updatedAt && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#94a3b8", marginBottom: 36 }}>
          <Calendar size={13} />
          Last updated {new Date(data.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      )}

      <div className="prose-page" dangerouslySetInnerHTML={{ __html: markdownToHtml(data.content) }} />
    </div>
  )
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}
function safeHref(url: string): string {
  const u = url.trim()
  if (/^(https?:|mailto:|\/)/i.test(u)) return escapeHtml(u)
  return "#"
}

function markdownToHtml(md: string): string {
  return md
    .split("\n\n")
    .map(block => {
      const lines = block.split("\n")
      if (/^#{1,3} /.test(lines[0])) {
        const level = lines[0].match(/^(#+)/)![1].length
        const text = inlineFormat(escapeHtml(lines[0].replace(/^#+\s*/, "")))
        return `<h${level} class="prose-h${level}">${text}</h${level}>`
      }
      if (lines.every(l => /^[-*] /.test(l.trim()))) {
        const items = lines.map(l => `<li>${inlineFormat(escapeHtml(l.replace(/^[-*]\s*/, "")))}</li>`).join("")
        return `<ul class="prose-ul">${items}</ul>`
      }
      return `<p class="prose-p">${inlineFormat(escapeHtml(lines.join("\n"))).replace(/\n/g, "<br/>")}</p>`
    })
    .join("")
}

function inlineFormat(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, (_m, label, url) => `<a href="${safeHref(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
}
