"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type State = "idle" | "loading" | "unsubscribed" | "resubscribed" | "not_found" | "error"

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  )
}

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [state, setState] = useState<State>("idle")
  const [email, setEmail] = useState("")
  const [inputEmail, setInputEmail] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [manualToken, setManualToken] = useState("")

  const doUnsubscribeByToken = useCallback(async (t: string) => {
    setState("loading")
    try {
      const res = await fetch(`/api/unsubscribe?token=${encodeURIComponent(t)}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setEmail(data.email)
        setState("unsubscribed")
      } else if (res.status === 404) {
        setState("not_found")
      } else {
        setErrorMsg(data.error || "Something went wrong.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setState("error")
    }
  }, [])

  useEffect(() => {
    if (token) doUnsubscribeByToken(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleEmailUnsubscribe(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")
    if (!inputEmail) return
    setState("loading")
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setEmail(data.email)
        setManualToken(data.token || "")
        setState("unsubscribed")
      } else if (res.status === 404) {
        setState("not_found")
      } else {
        setErrorMsg(data.error || "Something went wrong.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setState("error")
    }
  }

  async function handleResubscribe() {
    const t = token || manualToken
    if (!t && !email) return
    setState("loading")
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setState("resubscribed")
      } else {
        setErrorMsg(data.error || "Something went wrong.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
      setState("error")
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "16px",
    padding: "48px 40px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(0,38,116,0.10)",
    textAlign: "center",
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  }

  const brandLink = (
    <Link href="/" style={{ textDecoration: "none" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: "linear-gradient(135deg,#002674,#0058dd)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: "12px",
        }}>RDC</div>
        <span style={{ fontWeight: 700, fontSize: "15px", color: "#002674" }}>Rwanda Drone Community</span>
      </div>
    </Link>
  )

  const backHome = (
    <div style={{ marginTop: "28px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
      <Link href="/" style={{
        display: "inline-block",
        background: "linear-gradient(135deg,#002674,#0058dd)",
        color: "#fff", padding: "10px 24px", borderRadius: "8px",
        textDecoration: "none", fontWeight: 600, fontSize: "14px",
      }}>
        Back to Home
      </Link>
    </div>
  )

  if (state === "loading") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {brandLink}
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#555" }}>Processing your request…</p>
        </div>
      </div>
    )
  }

  if (state === "unsubscribed") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {brandLink}
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👋</div>
          <h1 style={{ color: "#002674", fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>
            You've been unsubscribed
          </h1>
          <p style={{ color: "#555", lineHeight: 1.6, marginBottom: "24px" }}>
            <strong>{email}</strong> has been removed from the Rwanda Drone Community mailing list.
            You won't receive any more emails from us.
          </p>
          <button
            onClick={handleResubscribe}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1.5px solid #0058dd",
              background: "#fff",
              color: "#0058dd",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Re-subscribe
          </button>
          {backHome}
        </div>
      </div>
    )
  }

  if (state === "resubscribed") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {brandLink}
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h1 style={{ color: "#002674", fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>
            Welcome back!
          </h1>
          <p style={{ color: "#555", lineHeight: 1.6, marginBottom: "8px" }}>
            <strong>{email}</strong> has been re-subscribed to the Rwanda Drone Community mailing list.
          </p>
          <Link href="/subscribe" style={{ fontSize: "13px", color: "#0058dd" }}>
            Update your topic preferences →
          </Link>
          {backHome}
        </div>
      </div>
    )
  }

  if (state === "not_found") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {brandLink}
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h1 style={{ color: "#002674", fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>
            Not found
          </h1>
          <p style={{ color: "#555", lineHeight: 1.6, marginBottom: "24px" }}>
            We couldn't find that email in our mailing list. It may have already been removed, or the link may be invalid.
          </p>
          {backHome}
        </div>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {brandLink}
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h1 style={{ color: "#002674", fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#555", lineHeight: 1.6, marginBottom: "24px" }}>{errorMsg}</p>
          <button
            onClick={() => setState("idle")}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1.5px solid #0058dd",
              background: "#fff",
              color: "#0058dd",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {backHome}
        </div>
      </div>
    )
  }

  // Default: no token → show email form
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {brandLink}
        <h1 style={{ color: "#002674", fontSize: "22px", fontWeight: 700, marginBottom: "10px" }}>
          Unsubscribe
        </h1>
        <p style={{ color: "#555", lineHeight: 1.6, marginBottom: "28px" }}>
          Enter your email address below to unsubscribe from the Rwanda Drone Community mailing list.
        </p>

        <form onSubmit={handleEmailUnsubscribe} style={{ textAlign: "left" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#002674", marginBottom: "6px" }}>
            Email address
          </label>
          <input
            type="email"
            value={inputEmail}
            onChange={e => setInputEmail(e.target.value)}
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
              marginBottom: "16px",
            }}
            onFocus={e => (e.target.style.borderColor = "#0058dd")}
            onBlur={e => (e.target.style.borderColor = "#d1d5db")}
          />
          {errorMsg && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "8px", padding: "10px 14px",
              color: "#dc2626", fontSize: "13px", marginBottom: "12px",
            }}>
              {errorMsg}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg,#002674,#0058dd)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Unsubscribe →
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link href="/subscribe" style={{ fontSize: "12px", color: "#888", textDecoration: "underline" }}>
            Subscribe or update preferences
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
