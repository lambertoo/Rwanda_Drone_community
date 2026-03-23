"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle, XCircle, ExternalLink, Mail, RefreshCw, Loader2,
  Copy, AlertTriangle, Send, Unlink, Eye, EyeOff, ChevronRight,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const DC_OPTIONS = [
  { value: "com", label: "Global (United States)" },
  { value: "eu",  label: "Europe" },
  { value: "in",  label: "India" },
  { value: "au",  label: "Australia" },
]

interface ZohoStatus {
  isConnected: boolean
  hasCredentials: boolean
  fromEmail: string | null
  fromName: string
  dc: string
  accountId: string | null
  clientIdPreview: string | null
  authUrl: string | null
}

export default function ZohoMailSettingsPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ZohoStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  // Form state
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [dc, setDc] = useState("com")
  const [fromName, setFromName] = useState("Rwanda Drone Community")
  const [testEmail, setTestEmail] = useState("")

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings/zoho-mail")
      const data = await res.json()
      setStatus(data)
      if (data.dc) setDc(data.dc)
      if (data.fromName) setFromName(data.fromName)
    } catch {
      toast({ title: "Error", description: "Failed to load Zoho settings", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
    // Handle redirects from Zoho callback
    if (searchParams.get("connected") === "1") {
      toast({ title: "Zoho Mail connected!", description: "OAuth authorization successful." })
    }
    if (searchParams.get("error")) {
      toast({
        title: "Connection failed",
        description: decodeURIComponent(searchParams.get("error") || "Unknown error"),
        variant: "destructive",
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveCredentials() {
    if (!clientId || !clientSecret) {
      toast({ title: "Missing fields", description: "Client ID and Client Secret are required.", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings/zoho-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_credentials", clientId, clientSecret, dc, fromName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus(data)
      setClientId("")
      setClientSecret("")
      toast({ title: "Credentials saved", description: "Now click 'Connect with Zoho' to authorize." })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function updateFromName() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings/zoho-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_from_name", fromName }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: "Updated", description: "Sender name updated." })
      await loadStatus()
    } catch {
      toast({ title: "Error", description: "Could not update sender name", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect Zoho Mail? Email sending will stop until you reconnect.")) return
    try {
      await fetch("/api/admin/settings/zoho-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      })
      toast({ title: "Disconnected", description: "Zoho Mail has been disconnected." })
      await loadStatus()
    } catch {
      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" })
    }
  }

  async function sendTest() {
    if (!testEmail) { toast({ title: "Enter an email address", variant: "destructive" }); return }
    setTestLoading(true)
    try {
      const res = await fetch("/api/admin/settings/zoho-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_email", to: testEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast({ title: "Test email sent!", description: data.message })
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message, variant: "destructive" })
    } finally {
      setTestLoading(false)
    }
  }

  function copyRedirectUri() {
    const uri = `${window.location.origin}/api/auth/zoho/callback`
    navigator.clipboard.writeText(uri)
    toast({ title: "Copied!", description: uri })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const redirectUri = typeof window !== "undefined"
    ? `${window.location.origin}/api/auth/zoho/callback`
    : `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoho/callback`

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6" /> Zoho Mail — Email Integration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect via OAuth 2.0 to send password reset emails, notifications, and transactional mail.
        </p>
      </div>

      {/* Status card */}
      <Card className={status?.isConnected ? "border-green-500/40 bg-green-500/5" : "border-orange-400/40 bg-orange-400/5"}>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {status?.isConnected
                ? <CheckCircle className="h-6 w-6 text-green-500" />
                : <XCircle className="h-6 w-6 text-orange-500" />}
              <div>
                <p className="font-semibold">
                  {status?.isConnected ? "Connected" : "Not connected"}
                </p>
                {status?.isConnected && status.fromEmail && (
                  <p className="text-sm text-muted-foreground">Sending from {status.fromEmail}</p>
                )}
                {!status?.isConnected && (
                  <p className="text-sm text-muted-foreground">
                    {status?.hasCredentials ? "Credentials saved — complete OAuth authorization below" : "Complete setup below"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status?.hasCredentials && (
                <Badge variant="outline" className="text-xs">{DC_OPTIONS.find(d => d.value === status.dc)?.label}</Badge>
              )}
              {status?.isConnected && (
                <Button variant="outline" size="sm" onClick={disconnect} className="text-red-600 border-red-200 hover:bg-red-50">
                  <Unlink className="h-4 w-4 mr-1.5" /> Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Step 1: Create Zoho App ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            Create a Zoho API Client
          </CardTitle>
          <CardDescription>Register your app in the Zoho API Console to get credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="text-sm space-y-2 text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Go to <a href="https://api-console.zoho.com/" target="_blank" rel="noopener" className="text-primary underline font-medium">api-console.zoho.com <ExternalLink className="inline h-3 w-3" /></a> and sign in with your Zoho account</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Click <strong>Add Client</strong> → choose <strong>Server-based Applications</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Fill in any name (e.g. <em>Rwanda Drone Community</em>) and homepage URL</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <div>
                Set the <strong>Authorized Redirect URI</strong> to:
                <div className="flex items-center gap-2 mt-1.5 bg-muted rounded px-3 py-2">
                  <code className="text-xs flex-1 font-mono break-all">{redirectUri}</code>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copyRedirectUri}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Click <strong>Create</strong>. Copy the <strong>Client ID</strong> and <strong>Client Secret</strong> shown.</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* ── Step 2: Enter credentials ───────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            Enter API Credentials
          </CardTitle>
          <CardDescription>
            {status?.hasCredentials && status.clientIdPreview
              ? `Current Client ID: ${status.clientIdPreview} — enter new values to replace.`
              : "Paste the credentials from the Zoho API Console."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data Center</Label>
              <Select value={dc} onValueChange={setDc}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DC_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Match your Zoho account's data center</p>
            </div>

            <div className="space-y-1.5">
              <Label>Sender Name</Label>
              <Input
                placeholder="Rwanda Drone Community"
                value={fromName}
                onChange={e => setFromName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shown as the "From" name in emails</p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                placeholder="1000.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={clientId}
                onChange={e => setClientId(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••••••••••••••"
                  value={clientSecret}
                  onChange={e => setClientSecret(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowSecret(v => !v)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Credentials are stored encrypted in your database. Never share your Client Secret.
            </AlertDescription>
          </Alert>

          <Button onClick={saveCredentials} disabled={saving || !clientId || !clientSecret}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Credentials
          </Button>
        </CardContent>
      </Card>

      {/* ── Step 3: Authorize ───────────────────────────────── */}
      <Card className={!status?.hasCredentials ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
            Authorize with Zoho
          </CardTitle>
          <CardDescription>
            Click the button below to grant your app permission to send emails via your Zoho account.
            You'll be redirected to Zoho and back automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              asChild={!!status?.authUrl}
              disabled={!status?.authUrl}
              className="gap-2"
            >
              {status?.authUrl ? (
                <a href={status.authUrl}>
                  <ExternalLink className="h-4 w-4" /> Connect with Zoho
                </a>
              ) : (
                <span>
                  <ExternalLink className="h-4 w-4 mr-2" /> Connect with Zoho
                </span>
              )}
            </Button>

            {status?.isConnected && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Authorized
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Zoho will ask you to allow <strong>ZohoMail.messages.CREATE</strong> and <strong>ZohoMail.accounts.READ</strong>.
            An offline refresh token is requested so the platform can send emails without requiring repeated logins.
          </p>
        </CardContent>
      </Card>

      {/* ── Step 4: Test & sender settings ─────────────────── */}
      {status?.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">4</span>
              Test &amp; Manage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection info */}
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/40 px-3 py-2 space-y-0.5">
                <p className="text-xs text-muted-foreground">Sending from</p>
                <p className="font-medium">{status.fromEmail}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-2 space-y-0.5">
                <p className="text-xs text-muted-foreground">Account ID</p>
                <p className="font-mono text-xs">{status.accountId}</p>
              </div>
            </div>

            <Separator />

            {/* Update sender name */}
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <div className="flex gap-2">
                <Input
                  value={fromName}
                  onChange={e => setFromName(e.target.value)}
                  placeholder="Rwanda Drone Community"
                  className="flex-1"
                />
                <Button variant="outline" onClick={updateFromName} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Test email */}
            <div className="space-y-2">
              <Label>Send Test Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={sendTest} disabled={testLoading || !testEmail}>
                  {testLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />}
                  <span className="ml-2">Send</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Sends a test email to verify the integration is working end-to-end.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center">
        Powered by{" "}
        <a href="https://www.zoho.com/mail/help/api/" target="_blank" rel="noopener" className="underline">
          Zoho Mail API v1
        </a>
        {" · "}OAuth 2.0 · Tokens auto-refreshed every hour
      </p>
    </div>
  )
}
