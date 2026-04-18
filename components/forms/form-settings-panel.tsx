'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Palette, Webhook, Award, Globe, Shield, Sparkles, Mail, Check, Code, Plus, X, Copy, Loader2,
} from 'lucide-react'

type Tab = 'theme' | 'behavior' | 'webhooks' | 'quiz' | 'access' | 'languages' | 'embed' | 'ai'

interface FormSettingsPanelProps {
  formId?: string
  settings: any
  setSettings: (next: any) => void
  fields: Array<{ id: string; name: string; label: string; type: string; options?: string[]; sectionTitle: string }>
  onImportDraft?: (draft: any) => void
}

const TABS: Array<{ id: Tab; label: string; icon: any }> = [
  { id: 'behavior', label: 'Behaviour', icon: Check },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'quiz', label: 'Quiz', icon: Award },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'access', label: 'Access', icon: Shield },
  { id: 'embed', label: 'Embed', icon: Code },
  { id: 'ai', label: 'AI draft', icon: Sparkles },
]

export default function FormSettingsPanel({ formId, settings, setSettings, fields, onImportDraft }: FormSettingsPanelProps) {
  const [tab, setTab] = useState<Tab>('behavior')
  const update = (patch: any) => setSettings({ ...settings, ...patch })

  return (
    <div className="grid md:grid-cols-[180px_1fr] gap-4">
      {/* Sidebar */}
      <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="rounded-lg border bg-background p-5 space-y-5">
        {tab === 'behavior' && <BehaviorTab settings={settings} update={update} fields={fields} />}
        {tab === 'theme' && <ThemeTab settings={settings} update={update} />}
        {tab === 'webhooks' && <WebhooksTab settings={settings} update={update} />}
        {tab === 'quiz' && <QuizTab settings={settings} update={update} />}
        {tab === 'languages' && <LanguagesTab settings={settings} update={update} />}
        {tab === 'access' && <AccessTab settings={settings} update={update} />}
        {tab === 'embed' && <EmbedTab formId={formId} />}
        {tab === 'ai' && <AIDraftTab onImportDraft={onImportDraft} />}
      </div>
    </div>
  )
}

// ─── Behaviour ──────────────────────────────────────────

function BehaviorTab({ settings, update, fields }: any) {
  const emailFields = (fields as any[]).filter((f: any) => f.type === 'EMAIL')
  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm font-semibold mb-3">Submission</h3>
        <div className="space-y-3">
          <ToggleRow label="Accept multiple responses from the same person" value={settings.allowMultipleSubmissions} onChange={(v) => update({ allowMultipleSubmissions: v })} />
          <ToggleRow label="Show progress bar on multi-page forms" value={settings.showProgressBar} onChange={(v) => update({ showProgressBar: v })} />
          <ToggleRow label="Show review step before submit" value={settings.reviewStep} onChange={(v) => update({ reviewStep: v })} />
          <ToggleRow
            label="Email a summary to the respondent after submit"
            value={settings.emailSummaryToApplicant}
            onChange={(v) => update({ emailSummaryToApplicant: v })}
          />
          {settings.emailSummaryToApplicant && (
            <FieldRow label="Which field holds the respondent's email?">
              <select
                value={settings.applicantEmailField || ''}
                onChange={(e) => update({ applicantEmailField: e.target.value })}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              >
                <option value="">Auto-detect first EMAIL field</option>
                {emailFields.map((f: any) => (
                  <option key={f.name} value={f.name}>{f.label} ({f.sectionTitle})</option>
                ))}
              </select>
            </FieldRow>
          )}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="text-sm font-semibold mb-3">Button + messages</h3>
        <div className="space-y-3">
          <FieldRow label="Submit button text">
            <Input value={settings.submitButtonText || ''} onChange={(e) => update({ submitButtonText: e.target.value })} />
          </FieldRow>
          <FieldRow label="Thank-you heading">
            <Input value={settings.thankYouHeading || ''} onChange={(e) => update({ thankYouHeading: e.target.value })} placeholder="Thank you!" />
          </FieldRow>
          <FieldRow label="Thank-you message">
            <Textarea
              value={settings.confirmationMessage || ''}
              onChange={(e) => update({ confirmationMessage: e.target.value })}
              rows={3}
              placeholder="Your response has been recorded."
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Use {'{{field_name}}'} to pipe in a respondent's answer.</p>
          </FieldRow>
          <FieldRow label="Redirect URL after submit (optional)">
            <Input value={settings.redirectUrl || ''} onChange={(e) => update({ redirectUrl: e.target.value })} placeholder="https://example.com/thanks" />
          </FieldRow>
          <FieldRow label="Closed message (shown when form is closed)">
            <Textarea value={settings.closedMessage || ''} onChange={(e) => update({ closedMessage: e.target.value })} rows={2} />
          </FieldRow>
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="text-sm font-semibold mb-3">Notifications</h3>
        <FieldRow label="Notify these emails on every submission (comma-separated)">
          <Input
            value={settings.notifyEmails || ''}
            onChange={(e) => update({ notifyEmails: e.target.value })}
            placeholder="admin@example.com, editor@example.com"
          />
        </FieldRow>
      </section>

      <Separator />

      <section>
        <h3 className="text-sm font-semibold mb-3">Closing conditions</h3>
        <div className="space-y-3">
          <FieldRow label="Close the form on">
            <Input type="datetime-local" value={settings.closeDate || ''} onChange={(e) => update({ closeDate: e.target.value })} />
          </FieldRow>
          <FieldRow label="Maximum responses">
            <Input
              type="number"
              min={1}
              value={settings.maxResponses ?? ''}
              onChange={(e) => update({ maxResponses: e.target.value ? Number(e.target.value) : null })}
              placeholder="Unlimited"
            />
          </FieldRow>
        </div>
      </section>
    </div>
  )
}

// ─── Theme ──────────────────────────────────────────────

function ThemeTab({ settings, update }: any) {
  const presets = [
    { name: 'Navy', color: '#1e3a5f' },
    { name: 'Blue', color: '#2563eb' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Rose', color: '#f43f5e' },
    { name: 'Violet', color: '#7c3aed' },
    { name: 'Slate', color: '#334155' },
    { name: 'Black', color: '#0f172a' },
  ]
  const fonts = [
    { name: 'System default', value: '' },
    { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
    { name: 'Roboto', value: 'Roboto, system-ui, sans-serif' },
    { name: 'Poppins', value: 'Poppins, system-ui, sans-serif' },
    { name: 'Merriweather', value: 'Merriweather, Georgia, serif' },
    { name: 'Source Serif', value: '"Source Serif Pro", Georgia, serif' },
    { name: 'Mono', value: '"JetBrains Mono", monospace' },
  ]
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold mb-3">Colour</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.primaryColor || '#2563eb'}
            onChange={(e) => update({ primaryColor: e.target.value })}
            className="h-10 w-14 rounded border cursor-pointer"
          />
          <Input value={settings.primaryColor || ''} onChange={(e) => update({ primaryColor: e.target.value })} className="w-32 font-mono text-sm" />
        </div>
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-8 gap-2">
          {presets.map(p => (
            <button
              key={p.color}
              type="button"
              onClick={() => update({ primaryColor: p.color })}
              className="h-9 rounded-md border flex items-center justify-center text-[10px] font-medium text-white shadow-sm"
              style={{ backgroundColor: p.color }}
              title={p.name}
            >
              {settings.primaryColor === p.color && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-3">Typography</h3>
        <select
          value={settings.fontFamily || ''}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
        >
          {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
        </select>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-3">Branding</h3>
        <div className="space-y-3">
          <FieldRow label="Logo URL (shown above the form)">
            <Input value={settings.logo || ''} onChange={(e) => update({ logo: e.target.value })} placeholder="https://example.com/logo.svg" />
          </FieldRow>
          <FieldRow label="Cover image URL">
            <Input value={settings.coverImage || ''} onChange={(e) => update({ coverImage: e.target.value })} placeholder="https://example.com/cover.jpg" />
          </FieldRow>
          <FieldRow label="Background image URL">
            <Input value={settings.backgroundImage || ''} onChange={(e) => update({ backgroundImage: e.target.value })} />
          </FieldRow>
          <FieldRow label="Background gradient (CSS)">
            <Input
              value={settings.backgroundGradient || ''}
              onChange={(e) => update({ backgroundGradient: e.target.value })}
              placeholder="linear-gradient(135deg, #e0f2fe, #ede9fe)"
            />
          </FieldRow>
        </div>
      </section>
    </div>
  )
}

// ─── Webhooks ───────────────────────────────────────────

function WebhooksTab({ settings, update }: any) {
  const list: string[] = Array.isArray(settings.webhooks) ? settings.webhooks : []
  const addOne = () => update({ webhooks: [...list, ''] })
  const setAt = (i: number, v: string) => {
    const next = [...list]; next[i] = v; update({ webhooks: next })
  }
  const removeAt = (i: number) => update({ webhooks: list.filter((_, j) => j !== i) })
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Each URL receives a JSON POST with the submission payload every time the form is submitted. Non-blocking and fire-and-forget.
      </p>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-xs italic text-muted-foreground">No webhooks configured.</p>}
        {list.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={url}
              onChange={(e) => setAt(i, e.target.value)}
              placeholder="https://hooks.zapier.com/..."
              className="font-mono text-xs"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeAt(i)} aria-label="Remove">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addOne}>
        <Plus className="h-4 w-4 mr-1.5" /> Add webhook
      </Button>
    </div>
  )
}

// ─── Quiz ───────────────────────────────────────────────

function QuizTab({ settings, update }: any) {
  return (
    <div className="space-y-4">
      <ToggleRow
        label="Enable quiz mode"
        value={!!settings.quizMode}
        onChange={(v) => update({ quizMode: v })}
        description="Score each submission using per-field correct answers and points."
      />
      <div className="rounded-md bg-muted/40 border p-3 text-sm space-y-2">
        <p className="font-medium">How to score a field</p>
        <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1">
          <li>Select the field you want to score in the editor.</li>
          <li>Open its advanced validation (click Settings on the field).</li>
          <li>Set <code>correctAnswer</code> (string or array of strings) and <code>points</code> (default 1).</li>
          <li>On submit, the respondent's total score is saved on the entry.</li>
        </ol>
      </div>
    </div>
  )
}

// ─── Languages ──────────────────────────────────────────

function LanguagesTab({ settings, update }: any) {
  const langs: string[] = Array.isArray(settings.languages) ? settings.languages : []
  const addOne = (code: string) => {
    const c = code.trim().toLowerCase()
    if (!c || langs.includes(c)) return
    update({ languages: [...langs, c] })
  }
  const removeOne = (code: string) => update({ languages: langs.filter(l => l !== code) })
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Respondents can switch language via <code>?lang=xx</code>. Edit translations directly in the form JSON under <code>settings.translations[lang]</code>.
      </p>
      <FieldRow label="Default language">
        <Input
          value={settings.defaultLanguage || ''}
          onChange={(e) => update({ defaultLanguage: e.target.value })}
          placeholder="en"
          className="w-24"
        />
      </FieldRow>
      <div>
        <p className="text-sm font-medium mb-2">Available languages</p>
        <div className="flex flex-wrap gap-2">
          {langs.map(l => (
            <Badge key={l} variant="secondary" className="gap-1">
              {l}
              <button type="button" onClick={() => removeOne(l)}><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {langs.length === 0 && <span className="text-xs italic text-muted-foreground">None.</span>}
        </div>
        <div className="flex gap-2 mt-3">
          <AddLangInput onAdd={addOne} />
        </div>
      </div>
    </div>
  )
}
function AddLangInput({ onAdd }: { onAdd: (code: string) => void }) {
  const [v, setV] = useState('')
  return (
    <>
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="fr, rw, sw…" className="w-32" />
      <Button type="button" size="sm" onClick={() => { onAdd(v); setV('') }}>Add</Button>
    </>
  )
}

// ─── Access control ─────────────────────────────────────

function AccessTab({ settings, update }: any) {
  const ips: string[] = Array.isArray(settings.allowedIPs) ? settings.allowedIPs : []
  const setIP = (i: number, v: string) => { const next = [...ips]; next[i] = v; update({ allowedIPs: next }) }
  const removeIP = (i: number) => update({ allowedIPs: ips.filter((_, j) => j !== i) })
  return (
    <div className="space-y-4">
      <ToggleRow label="Require respondents to be signed in" value={!!settings.requireLogin} onChange={(v) => update({ requireLogin: v })} />
      <ToggleRow
        label="Require a CAPTCHA on submit"
        value={!!settings.requireCaptcha}
        onChange={(v) => update({ requireCaptcha: v })}
        description="Integrator must attach the CAPTCHA token as _captchaToken in the submission payload."
      />
      <FieldRow label="Password (leave blank to disable)">
        <Input type="text" value={settings.passwordProtect || ''} onChange={(e) => update({ passwordProtect: e.target.value })} />
      </FieldRow>
      <div>
        <p className="text-sm font-medium mb-2">Allowed IPs (empty = allow all)</p>
        <div className="space-y-2">
          {ips.map((ip, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={ip} onChange={(e) => setIP(i, e.target.value)} placeholder="203.0.113.5" className="font-mono text-xs" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeIP(i)} aria-label="Remove">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => update({ allowedIPs: [...ips, ''] })}>
          <Plus className="h-4 w-4 mr-1.5" /> Add IP
        </Button>
      </div>
    </div>
  )
}

// ─── Embed ──────────────────────────────────────────────

function EmbedTab({ formId }: { formId?: string }) {
  if (!formId) return <p className="text-sm text-muted-foreground">Save the form first to get embed codes.</p>
  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const iframeSrc = `${appUrl}/forms/public/${formId}`
  const iframeHtml = `<iframe src="${iframeSrc}" width="100%" height="720" frameborder="0" style="border:0" title="Form"></iframe>`
  const popupHtml = `<button data-uavrw-form="${formId}">Open form</button>\n<script src="${appUrl}/api/forms/embed/${formId}?mode=popup" async></script>`
  const sliderHtml = `<button data-uavrw-form="${formId}">Open form</button>\n<script src="${appUrl}/api/forms/embed/${formId}?mode=slider" async></script>`
  return (
    <div className="space-y-5">
      <EmbedBlock title="Direct link" subtitle="Share this URL so respondents land on the form." value={iframeSrc} />
      <EmbedBlock title="Inline iframe" subtitle="Paste anywhere in your site to embed the form." value={iframeHtml} multiline />
      <EmbedBlock title="Popup on button click" subtitle="Trigger from any element with data-uavrw-form attribute." value={popupHtml} multiline />
      <EmbedBlock title="Slider from the right" subtitle="Same trigger, slides in from the page edge." value={sliderHtml} multiline />
    </div>
  )
}
function EmbedBlock({ title, subtitle, value, multiline }: { title: string; subtitle: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <section>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={copy}>
          {copied ? <><Check className="h-3.5 w-3.5 mr-1.5" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>}
        </Button>
      </div>
      {multiline ? (
        <Textarea value={value} readOnly rows={3} className="font-mono text-[11px]" />
      ) : (
        <Input value={value} readOnly className="font-mono text-[11px]" />
      )}
    </section>
  )
}

// ─── AI draft ───────────────────────────────────────────

function AIDraftTab({ onImportDraft }: { onImportDraft?: (draft: any) => void }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<any | null>(null)

  const run = async () => {
    setLoading(true); setError(null); setDraft(null)
    try {
      const r = await fetch('/api/forms/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'AI draft failed')
      setDraft(data.draft)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Describe the form you want and Claude will propose sections and fields. You can import the draft into the editor as a starting point.
      </p>
      <Textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="e.g. A drone pilot training sign-up form for a 3-day BVLOS course, capturing pilot details, experience level, medical clearance, and payment preference."
        rows={4}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={run} disabled={loading || brief.trim().length < 10}>
          {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Drafting…</> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Draft with Claude</>}
        </Button>
        {draft && onImportDraft && (
          <Button type="button" size="sm" variant="outline" onClick={() => onImportDraft(draft)}>
            Import into editor
          </Button>
        )}
      </div>
      {draft && (
        <div className="rounded-md border bg-muted/40 p-3 text-xs">
          <p className="font-semibold">{draft.title}</p>
          <p className="text-muted-foreground">{draft.description}</p>
          <ul className="mt-2 list-disc list-inside">
            {(draft.sections || []).map((s: any, i: number) => (
              <li key={i}>{s.title} — {s.fields?.length || 0} fields</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Shared rows ────────────────────────────────────────

function ToggleRow({ label, value, onChange, description }: { label: string; value: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <Label className="text-sm cursor-pointer">{label}</Label>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch checked={!!value} onCheckedChange={onChange} />
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
