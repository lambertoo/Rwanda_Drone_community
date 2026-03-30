"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ALLOWED_TOPICS = ["events", "opportunities", "projects", "resources", "forum", "news"]

const TOPIC_LABELS: Record<string, string> = {
  events: "Events",
  opportunities: "Jobs",
  projects: "Projects",
  resources: "Resources",
  forum: "Forum",
  news: "News",
}

const TOPIC_COLORS: Record<string, string> = {
  events: "bg-blue-100 text-blue-800",
  opportunities: "bg-green-100 text-green-800",
  projects: "bg-purple-100 text-purple-800",
  resources: "bg-yellow-100 text-yellow-800",
  forum: "bg-pink-100 text-pink-800",
  news: "bg-gray-100 text-gray-800",
}

interface Subscriber {
  id: string
  email: string
  name: string | null
  topics: string[]
  isActive: boolean
  confirmedAt: string | null
  createdAt: string
  token: string
}

interface StatsData {
  subscribers: Subscriber[]
  total: number
  active: number
  byTopic: Record<string, number>
}

export default function AdminSubscribersPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [topicFilter, setTopicFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [actionMsg, setActionMsg] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (topicFilter) params.set("topic", topicFilter)
      if (activeFilter) params.set("active", activeFilter)
      const res = await fetch(`/api/admin/subscribers?${params}`, { credentials: "include" })
      if (!res.ok) { setError("Failed to load subscribers."); setLoading(false); return }
      const json = await res.json()
      setData(json)
    } catch {
      setError("Network error.")
    }
    setLoading(false)
  }, [search, topicFilter, activeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleUnsubscribe(subscriber: Subscriber) {
    if (!confirm(`Unsubscribe ${subscriber.email}?`)) return
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: subscriber.token }),
      })
      if (res.ok) {
        setActionMsg(`${subscriber.email} unsubscribed.`)
        fetchData()
        setTimeout(() => setActionMsg(""), 3000)
      }
    } catch {
      setActionMsg("Action failed.")
    }
  }

  function exportCSV() {
    if (!data?.subscribers.length) return
    const header = ["Email", "Name", "Topics", "Status", "Subscribed At"]
    const rows = data.subscribers.map(s => [
      s.email,
      s.name || "",
      s.topics.join(";"),
      s.isActive ? "active" : "inactive",
      new Date(s.createdAt).toLocaleDateString(),
    ])
    const csv = [header, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rdc-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#003366", marginBottom: "6px" }}>
          Mailing List Subscribers
        </h1>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Manage newsletter subscribers and topic preferences.
        </p>
      </div>

      {/* Stats row */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <Card>
            <CardContent style={{ padding: "20px" }}>
              <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Total</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#003366" }}>{data.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent style={{ padding: "20px" }}>
              <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>Active</p>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a" }}>{data.active}</p>
            </CardContent>
          </Card>
          {ALLOWED_TOPICS.map(t => (
            <Card key={t}>
              <CardContent style={{ padding: "20px" }}>
                <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>{TOPIC_LABELS[t]}</p>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "#0066B3" }}>{data.byTopic[t] ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters + export */}
      <Card style={{ marginBottom: "20px" }}>
        <CardContent style={{ padding: "16px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by email or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: "1 1 200px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1.5px solid #d1d5db",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={e => (e.target.style.borderColor = "#0066B3")}
              onBlur={e => (e.target.style.borderColor = "#d1d5db")}
            />
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1.5px solid #d1d5db",
                fontSize: "13px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">All Topics</option>
              {ALLOWED_TOPICS.map(t => (
                <option key={t} value={t}>{TOPIC_LABELS[t]}</option>
              ))}
            </select>
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1.5px solid #d1d5db",
                fontSize: "13px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Button onClick={exportCSV} variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionMsg && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: "8px", padding: "10px 16px",
          color: "#15803d", fontSize: "13px", marginBottom: "16px",
        }}>
          {actionMsg}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader style={{ padding: "20px 24px 12px" }}>
          <CardTitle style={{ fontSize: "16px" }}>
            {data ? `${data.subscribers.length} subscribers` : "Subscribers"}
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: "0 0 4px" }}>
          {loading && (
            <div style={{ padding: "48px", textAlign: "center", color: "#888" }}>Loading…</div>
          )}
          {error && (
            <div style={{ padding: "24px", color: "#dc2626" }}>{error}</div>
          )}
          {!loading && !error && data && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                    {["Email", "Name", "Topics", "Subscribed", "Status", "Action"].map(h => (
                      <th key={h} style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#555",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.subscribers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#888" }}>
                        No subscribers found.
                      </td>
                    </tr>
                  )}
                  {data.subscribers.map((sub, i) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: "1px solid #f5f5f5",
                        background: i % 2 === 0 ? "#fff" : "#fafafa",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111" }}>{sub.email}</td>
                      <td style={{ padding: "12px 16px", color: "#555" }}>{sub.name || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {sub.topics.length === 0 && <span style={{ color: "#aaa" }}>—</span>}
                          {sub.topics.map(t => (
                            <span
                              key={t}
                              className={TOPIC_COLORS[t] || "bg-gray-100 text-gray-700"}
                              style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "99px", fontWeight: 600 }}
                            >
                              {TOPIC_LABELS[t] || t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#666", whiteSpace: "nowrap" }}>
                        {new Date(sub.createdAt).toLocaleDateString("en-RW", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "99px",
                          fontWeight: 600,
                          background: sub.isActive ? "#dcfce7" : "#fee2e2",
                          color: sub.isActive ? "#15803d" : "#dc2626",
                        }}>
                          {sub.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {sub.isActive && (
                          <button
                            onClick={() => handleUnsubscribe(sub)}
                            style={{
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#dc2626",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            Unsubscribe
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
