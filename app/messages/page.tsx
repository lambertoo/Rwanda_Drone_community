"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import {
  ArrowLeft, Send, Search, Plus, MessageSquare, Users,
  MoreVertical, VolumeX, Volume2, ShieldBan, Flag, ShieldAlert
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface OtherUser {
  id: string
  fullName: string
  avatar?: string
  username: string
}

interface ConversationItem {
  id: string
  otherUser: OtherUser
  lastMessage: { content: string; createdAt: string; isOwn: boolean } | null
  unreadCount: number
  lastMessageAt: string
}

interface MessageItem {
  id: string
  content: string
  senderId: string
  isOwn: boolean
  isRead: boolean
  createdAt: string
}

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConvoId, setActiveConvoId] = useState<string | null>(searchParams.get("c"))
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [userResults, setUserResults] = useState<OtherUser[]>([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [reportDetails, setReportDetails] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch conversations
  const fetchConversations = useCallback(() => {
    fetch("/api/messages/conversations", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setConversations(d.conversations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 15000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  // Fetch messages for active conversation
  const fetchMessages = useCallback(() => {
    if (!activeConvoId) return
    fetch(`/api/messages/conversations/${activeConvoId}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setMessages(d.messages || [])
        setOtherUser(d.otherUser || null)
      })
      .catch(() => {})
  }, [activeConvoId])

  useEffect(() => {
    fetchMessages()
    if (!activeConvoId) return
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [activeConvoId, fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opening a conversation
  useEffect(() => {
    if (activeConvoId) setTimeout(() => inputRef.current?.focus(), 100)
  }, [activeConvoId])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvoId || sending) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage("")

    // Optimistic add
    const optimistic: MessageItem = {
      id: `temp-${Date.now()}`,
      content,
      senderId: "",
      isOwn: true,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch(`/api/messages/conversations/${activeConvoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => prev.map(m => m.id === optimistic.id ? data.message : m))
        fetchConversations()
      }
    } catch {}
    setSending(false)
  }

  // Search users for new conversation
  useEffect(() => {
    if (!userSearch.trim()) { setUserResults([]); return }
    const t = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(userSearch)}&limit=8`, { credentials: "include" })
        .then(r => r.json())
        .then(d => setUserResults(d.users || []))
        .catch(() => {})
    }, 300)
    return () => clearTimeout(t)
  }, [userSearch])

  const startConversation = async (recipientId: string) => {
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientId }),
      })
      if (res.ok) {
        const data = await res.json()
        setActiveConvoId(data.conversationId)
        setShowNewChat(false)
        setUserSearch("")
        fetchConversations()
      }
    } catch {}
  }

  const toggleMute = async () => {
    if (!activeConvoId) return
    try {
      const res = await fetch(`/api/messages/conversations/${activeConvoId}/mute`, { method: "POST", credentials: "include" })
      if (res.ok) { const d = await res.json(); setIsMuted(d.muted) }
    } catch {}
    setShowMenu(false)
  }

  const toggleBlock = async () => {
    if (!otherUser) return
    const action = isBlocked ? "unblock" : "block"
    if (!isBlocked && !confirm(`Block ${otherUser.fullName}? They won't be able to message you.`)) return
    try {
      const res = await fetch(`/api/users/${otherUser.username}/block`, { method: "POST", credentials: "include" })
      if (res.ok) { const d = await res.json(); setIsBlocked(d.blocked) }
    } catch {}
    setShowMenu(false)
  }

  const submitReport = async () => {
    if (!otherUser || !reportReason) return
    try {
      await fetch(`/api/users/${otherUser.username}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: reportReason, details: reportDetails }),
      })
      alert("Report submitted. Our team will review it.")
    } catch {}
    setShowReport(false)
    setReportReason("")
    setReportDetails("")
    setShowMenu(false)
  }

  const filteredConversations = conversations.filter(c =>
    !search || c.otherUser.fullName.toLowerCase().includes(search.toLowerCase())
  )

  // Mobile: show either list or thread
  const showThread = !!activeConvoId

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-4 py-0 sm:py-4">
      <div className="flex bg-background border rounded-none sm:rounded-xl overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>

        {/* ── Left: Conversation List ── */}
        <div className={`w-full sm:w-80 lg:w-96 border-r flex flex-col shrink-0 ${showThread ? "hidden sm:flex" : "flex"}`}>
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowNewChat(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* New Chat Dialog (inline) */}
          {showNewChat && (
            <div className="px-3 py-2 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">New message to:</span>
                <button onClick={() => { setShowNewChat(false); setUserSearch("") }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
              <Input
                placeholder="Search by name..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              {userResults.length > 0 && (
                <div className="mt-1 max-h-40 overflow-y-auto">
                  {userResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => startConversation(u.id)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-left"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={u.avatar || ""} />
                        <AvatarFallback className="text-[10px]">{u.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight">{u.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowNewChat(true)}>
                  Start a conversation
                </Button>
              </div>
            ) : (
              filteredConversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvoId(c.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left ${activeConvoId === c.id ? "bg-muted/70" : ""}`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.otherUser.avatar || ""} />
                      <AvatarFallback>{c.otherUser.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${c.unreadCount > 0 ? "font-semibold" : "font-medium"}`}>
                        {c.otherUser.fullName}
                      </span>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatDistanceToNow(new Date(c.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    {c.lastMessage && (
                      <p className={`text-xs truncate mt-0.5 ${c.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {c.lastMessage.isOwn ? "You: " : ""}{c.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {c.unreadCount > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px] rounded-full shrink-0">
                      {c.unreadCount}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Right: Message Thread ── */}
        <div className={`flex-1 flex flex-col ${!showThread ? "hidden sm:flex" : "flex"}`}>
          {activeConvoId && otherUser ? (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 border-b flex items-center gap-3">
                <button
                  onClick={() => { setActiveConvoId(null); setOtherUser(null); setMessages([]); setShowMenu(false) }}
                  className="sm:hidden p-1 rounded hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.avatar || ""} />
                  <AvatarFallback>{otherUser.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{otherUser.fullName}</p>
                  <p className="text-[11px] text-muted-foreground">@{otherUser.username}</p>
                </div>
                {/* Safety menu */}
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded hover:bg-muted">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-52 bg-background border rounded-lg shadow-lg z-50 py-1">
                      <button onClick={toggleMute} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left">
                        {isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        {isMuted ? "Unmute conversation" : "Mute conversation"}
                      </button>
                      <button onClick={toggleBlock} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left text-red-600">
                        <ShieldBan className="h-4 w-4" />
                        {isBlocked ? "Unblock user" : "Block user"}
                      </button>
                      <button onClick={() => { setShowReport(true); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left text-red-600">
                        <Flag className="h-4 w-4" />
                        Report user
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Report dialog */}
              {showReport && (
                <div className="px-4 py-3 border-b bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Report {otherUser.fullName}
                    </span>
                    <button onClick={() => setShowReport(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full h-8 text-sm border rounded-md px-2 mb-2 bg-background"
                  >
                    <option value="">Select a reason...</option>
                    <option value="harassment">Harassment or bullying</option>
                    <option value="spam">Spam or scam</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="impersonation">Impersonation</option>
                    <option value="other">Other</option>
                  </select>
                  <Input
                    placeholder="Additional details (optional)"
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    className="h-8 text-sm mb-2"
                  />
                  <Button size="sm" variant="destructive" onClick={submitReport} disabled={!reportReason}>
                    Submit Report
                  </Button>
                </div>
              )}

              {/* Blocked banner */}
              {isBlocked && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-950/20 border-b text-center">
                  <p className="text-xs text-red-600">This user is blocked. <button onClick={toggleBlock} className="underline font-medium">Unblock</button></p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Users className="h-10 w-10 text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                          m.isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t">
                <form
                  onSubmit={e => { e.preventDefault(); sendMessage() }}
                  className="flex items-center gap-2"
                >
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 h-10"
                    maxLength={5000}
                    disabled={sending || isBlocked}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="shrink-0 h-10 w-10">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/20 mb-3" />
              <h3 className="text-lg font-semibold mb-1">Your messages</h3>
              <p className="text-sm text-muted-foreground mb-4">Send private messages to other community members</p>
              <Button onClick={() => setShowNewChat(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <AuthGuard>
      <MessagesContent />
    </AuthGuard>
  )
}
