"use client"

import { useState, useEffect } from "react"
import { FileText, Save, Eye, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

const PAGES = [
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms",   label: "Terms of Use" },
]

export default function AdminPagesSettings() {
  const [activeSlug, setActiveSlug] = useState("privacy")
  const [pages, setPages] = useState<Record<string, { title: string; content: string; updatedAt: string | null }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    Promise.all(PAGES.map(p => fetch(`/api/pages/${p.slug}`).then(r => r.json())))
      .then(results => {
        const map: Record<string, any> = {}
        results.forEach((d, i) => { map[PAGES[i].slug] = d })
        setPages(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const current = pages[activeSlug]

  function update(field: "title" | "content", value: string) {
    setPages(prev => ({ ...prev, [activeSlug]: { ...prev[activeSlug], [field]: value } }))
    setStatus("idle")
  }

  async function save() {
    if (!current) return
    setSaving(true)
    setStatus("idle")
    try {
      const r = await fetch(`/api/admin/pages/${activeSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: current.title, content: current.content }),
      })
      setStatus(r.ok ? "saved" : "error")
      if (r.ok) setTimeout(() => setStatus("idle"), 3000)
    } catch {
      setStatus("error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#002674", margin: "0 0 4px" }}>Legal Pages</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Edit the content of your Privacy Policy and Terms of Use pages.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(0,38,116,0.08)", paddingBottom: 0 }}>
        {PAGES.map(p => (
          <button
            key={p.slug}
            onClick={() => { setActiveSlug(p.slug); setPreview(false); setStatus("idle") }}
            style={{
              padding: "9px 20px", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer",
              borderBottom: activeSlug === p.slug ? "2px solid #002674" : "2px solid transparent",
              background: "none",
              color: activeSlug === p.slug ? "#002674" : "#64748b",
              marginBottom: -1,
            }}
          >
            <FileText size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 64 }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "#0058dd" }} />
        </div>
      ) : current ? (
        <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap: 20 }}>
          {/* Editor */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Page Title</label>
              <input
                value={current.title}
                onChange={e => update("title", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", fontSize: 14, color: "#0f172a", outline: "none" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>Content (Markdown)</label>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Supports **bold**, *italic*, # headings, - lists</span>
              </div>
              <textarea
                value={current.content}
                onChange={e => update("content", e.target.value)}
                rows={28}
                style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", fontSize: 13, color: "#0f172a", fontFamily: "monospace", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Action bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={save}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 22px", borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer", background: "linear-gradient(135deg,#002674,#0058dd)", color: "#fff", fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>

              <button
                onClick={() => setPreview(p => !p)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(0,38,116,0.15)", cursor: "pointer", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14 }}
              >
                <Eye size={15} /> {preview ? "Hide preview" : "Preview"}
              </button>

              <Link
                href={`/${activeSlug}`}
                target="_blank"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#0058dd", textDecoration: "none" }}
              >
                View live page ↗
              </Link>

              {status === "saved" && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#16a34a" }}>
                  <CheckCircle size={15} /> Saved successfully
                </span>
              )}
              {status === "error" && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#ef4444" }}>
                  <AlertCircle size={15} /> Save failed — try again
                </span>
              )}
            </div>

            {current.updatedAt && (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                Last saved {new Date(current.updatedAt).toLocaleString("en-GB")}
              </p>
            )}
          </div>

          {/* Live preview */}
          {preview && (
            <div style={{ border: "1px solid rgba(0,38,116,0.08)", borderRadius: 12, padding: "28px 32px", background: "#fff", overflow: "auto", maxHeight: 720 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#002674", marginBottom: 24 }}>{current.title}</h1>
              <div className="prose-page" dangerouslySetInnerHTML={{ __html: markdownToHtml(current.content) }} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function markdownToHtml(md: string): string {
  return md
    .split("\n\n")
    .map(block => {
      const lines = block.split("\n")
      if (/^#{1,3} /.test(lines[0])) {
        const level = lines[0].match(/^(#+)/)![1].length
        const text = inlineFormat(lines[0].replace(/^#+\s*/, ""))
        return `<h${level} class="prose-h${level}">${text}</h${level}>`
      }
      if (lines.every(l => /^[-*] /.test(l.trim()))) {
        const items = lines.map(l => `<li>${inlineFormat(l.replace(/^[-*]\s*/, ""))}</li>`).join("")
        return `<ul class="prose-ul">${items}</ul>`
      }
      return `<p class="prose-p">${inlineFormat(lines.join("<br/>"))}</p>`
    })
    .join("")
}

function inlineFormat(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}
