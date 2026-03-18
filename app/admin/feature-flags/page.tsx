"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Radio, Info, CheckCircle, Lock } from "lucide-react"

interface FeatureFlag { id: string; key: string; name: string; description: string; isEnabled: boolean; config?: any; updatedAt: string }

const categoryMap: Record<string, string> = {
  weather_api: "Data & APIs",
  airspace_live_data: "Data & APIs",
  caa_integration: "Government",
  pilot_verification: "Government",
  payment_mtn_momo: "Payments",
  payment_stripe: "Payments",
  email_notifications: "Communications",
  sms_notifications: "Communications",
  analytics_tracking: "Analytics",
}

const envVarMap: Record<string, string> = {
  weather_api: "OPENWEATHER_API_KEY",
  airspace_live_data: "OPENAIP_API_KEY",
  caa_integration: "CAA_API_KEY",
  pilot_verification: "CAA_VERIFY_API_KEY",
  payment_mtn_momo: "MTN_MOMO_API_KEY",
  payment_stripe: "STRIPE_SECRET_KEY",
  email_notifications: "RESEND_API_KEY",
  sms_notifications: "AT_API_KEY",
  analytics_tracking: "PLAUSIBLE_SITE_ID",
}

export default function FeatureFlagsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [fetching, setFetching] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user?.role !== "admin") { if (!loading) router.push("/") }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role !== "admin") return
    fetch("/api/admin/feature-flags", { credentials: "include" })
      .then(r => r.json()).then(d => setFlags(d.flags || []))
      .catch(() => toast.error("Failed to load flags"))
      .finally(() => setFetching(false))
  }, [user])

  const toggle = async (flag: FeatureFlag) => {
    setToggling(flag.key)
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key: flag.key, isEnabled: !flag.isEnabled })
      })
      if (!res.ok) throw new Error()
      setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, isEnabled: !f.isEnabled } : f))
      toast.success(`${flag.name} ${!flag.isEnabled ? "enabled" : "disabled"}`)
    } catch { toast.error("Failed to update flag") } finally { setToggling(null) }
  }

  const grouped = flags.reduce((acc, f) => {
    const cat = categoryMap[f.key] || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(f)
    return acc
  }, {} as Record<string, FeatureFlag[]>)

  const enabledCount = flags.filter(f => f.isEnabled).length

  if (loading || fetching) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Radio className="h-6 w-6 text-primary" /> Feature Flags & Integrations</h1>
        <p className="text-muted-foreground mt-1">{enabledCount} of {flags.length} features enabled</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enabling a feature requires the corresponding environment variable to be set on your server. Disabled features show informational placeholders to users. Changes take effect immediately.
        </AlertDescription>
      </Alert>

      {Object.entries(grouped).map(([category, categoryFlags]) => (
        <div key={category} className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h2>
          <div className="space-y-3">
            {categoryFlags.map(flag => (
              <Card key={flag.key}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{flag.name}</p>
                        <Badge variant={flag.isEnabled ? "default" : "outline"} className={`text-xs ${flag.isEnabled ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}`}>
                          {flag.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{envVarMap[flag.key] || `${flag.key.toUpperCase()}`}</code>
                        <span className="text-xs text-muted-foreground">required in .env</span>
                      </div>
                    </div>
                    <Switch
                      checked={flag.isEnabled}
                      onCheckedChange={() => toggle(flag)}
                      disabled={toggling === flag.key}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {flags.length === 0 && !fetching && (
        <div className="text-center py-12 text-muted-foreground">
          <Radio className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No feature flags found. They will be created automatically.</p>
        </div>
      )}
    </div>
  )
}
