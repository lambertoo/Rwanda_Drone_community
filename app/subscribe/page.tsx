"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Link from "next/link"

const TOPICS = [
  { id: "events",        label: "Events & Programmes",    emoji: "📅" },
  { id: "opportunities", label: "Opportunities & Jobs",   emoji: "💼" },
  { id: "projects",      label: "Projects",               emoji: "📁" },
  { id: "resources",     label: "Resources & Guides",     emoji: "📚" },
  { id: "forum",         label: "Forum Highlights",       emoji: "💬" },
  { id: "news",          label: "Platform News",          emoji: "📢" },
]

type State = "idle" | "loading" | "success" | "update"

export default function SubscribePage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<string[]>(["events", "opportunities", "news"])
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState("")
  const [token, setToken] = useState("")
  const [wasUpdated, setWasUpdated] = useState(false)

  const allSelected = selected.length === TOPICS.length

  function toggleTopic(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    setSelected(allSelected ? [] : TOPICS.map(t => t.id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!email) { setError("Email address is required."); return }
    if (selected.length === 0) { setError("Please select at least one topic."); return }

    setState("loading")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, topics: selected }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong."); setState("idle"); return }
      setToken(data.token)
      setWasUpdated(data.updated === true)
      setState("success")
    } catch {
      setError("Network error. Please try again.")
      setState("idle")
    }
  }

  if (state === "success") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "48px 40px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 8px 40px rgba(0,38,116,0.10)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h1 style={{ color: "#002674", fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
            {wasUpdated ? "Preferences updated!" : "You're subscribed!"}
          </h1>
          <p style={{ color: "#444", lineHeight: 1.6, marginBottom: "24px" }}>
            {wasUpdated
              ? `Your preferences for ${email} have been updated.`
              : `Welcome to the Rwanda Drone Community mailing list! We'll send relevant updates to ${email}.`
            }
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href={`/unsubscribe?token=${token}`}
              style={{ fontSize: "13px", color: "#666", textDecoration: "underline" }}
            >
              Manage preferences / Unsubscribe
            </Link>
          </div>
          <div style={{ marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg,#002674,#0058dd)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "48px 40px",
        maxWidth: "540px",
        width: "100%",
        boxShadow: "0 8px 40px rgba(0,38,116,0.10)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg,#002674,#0058dd)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "12px",
                letterSpacing: "-0.5px",
              }}>RDC</div>
              <span style={{ fontWeight: 700, fontSize: "15px", color: "#002674" }}>Rwanda Drone Community</span>
            </div>
          </Link>
          <h1 style={{ color: "#002674", fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>
            Stay in the loop
          </h1>
          <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.5 }}>
            Get the latest from Rwanda's drone community — news, events, opportunities and more.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#002674", marginBottom: "6px" }}>
              Email address <span style={{ color: "#e53e3e" }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#0058dd")}
              onBlur={e => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Name */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#002674", marginBottom: "6px" }}>
              Your name <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jean-Paul Uwimana"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1.5px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#0058dd")}
              onBlur={e => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Topics */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#002674" }}>
                What interests you? <span style={{ color: "#e53e3e" }}>*</span>
              </label>
              <button
                type="button"
                onClick={toggleAll}
                style={{
                  fontSize: "12px",
                  color: "#0058dd",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: "2px 0",
                }}
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}>
              {TOPICS.map(topic => (
                <label
                  key={topic.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${selected.includes(topic.id) ? "#0058dd" : "#e5e7eb"}`,
                    background: selected.includes(topic.id) ? "#eff6ff" : "#fafafa",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontSize: "13px",
                    fontWeight: selected.includes(topic.id) ? 600 : 400,
                    color: selected.includes(topic.id) ? "#002674" : "#374151",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(topic.id)}
                    onChange={() => toggleTopic(topic.id)}
                    style={{ accentColor: "#0058dd", width: "15px", height: "15px", flexShrink: 0 }}
                  />
                  <span>{topic.emoji}</span>
                  <span style={{ lineHeight: 1.3 }}>{topic.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "#dc2626",
              fontSize: "13px",
              marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={state === "loading"}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: state === "loading" ? "#94a3b8" : "linear-gradient(135deg,#002674,#0058dd)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              cursor: state === "loading" ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {state === "loading" ? "Subscribing…" : "Subscribe →"}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link href="/unsubscribe" style={{ fontSize: "12px", color: "#888", textDecoration: "underline" }}>
            Unsubscribe or manage preferences
          </Link>
          <span style={{ color: "#ccc", margin: "0 8px" }}>·</span>
          <Link href="/" style={{ fontSize: "12px", color: "#888", textDecoration: "underline" }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
