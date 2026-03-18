"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Newspaper, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Article { id: string; title: string; slug: string; summary: string; category: string; isPublished: boolean; isFeatured: boolean; viewsCount: number; publishedAt?: string; createdAt: string; author: { fullName: string } }

export default function AdminNewsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState({ title: "", summary: "", content: "", category: "community", thumbnail: "", isPublished: false, isFeatured: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!loading && user?.role !== "admin") router.push("/") }, [user, loading, router])

  useEffect(() => {
    if (user?.role !== "admin") return
    fetch("/api/news?admin=true", { credentials: "include" })
      .then(r => r.json()).then(d => setArticles(d.articles || []))
  }, [user])

  const save = async () => {
    if (!form.title || !form.summary || !form.content) { toast.error("Title, summary, and content required"); return }
    setSaving(true)
    try {
      const url = editing ? `/api/news/${editing.slug}` : "/api/news"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (editing) { setArticles(prev => prev.map(a => a.id === editing.id ? data.article : a)) } else { setArticles(prev => [data.article, ...prev]) }
      toast.success(editing ? "Article updated" : "Article created")
      setOpen(false); setEditing(null); setForm({ title: "", summary: "", content: "", category: "community", thumbnail: "", isPublished: false, isFeatured: false })
    } catch { toast.error("Failed to save") } finally { setSaving(false) }
  }

  const deleteArticle = async (slug: string) => {
    if (!confirm("Delete this article?")) return
    try {
      await fetch(`/api/news/${slug}`, { method: "DELETE", credentials: "include" })
      setArticles(prev => prev.filter(a => a.slug !== slug))
      toast.success("Deleted")
    } catch { toast.error("Failed") }
  }

  const openEdit = (a: Article) => {
    setEditing(a)
    setForm({ title: a.title, summary: a.summary, content: "", category: a.category, thumbnail: "", isPublished: a.isPublished, isFeatured: a.isFeatured })
    setOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Newspaper className="h-6 w-6 text-primary" /> News Management</h1>
          <p className="text-muted-foreground mt-1">{articles.length} articles · {articles.filter(a => a.isPublished).length} published</p>
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", summary: "", content: "", category: "community", thumbnail: "", isPublished: false, isFeatured: false }) } }}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Article</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Title <span className="text-red-500">*</span></Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Article title" /></div>
              <div><Label>Summary <span className="text-red-500">*</span></Label><Textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} rows={2} placeholder="Brief summary shown in listings" /></div>
              <div><Label>Content <span className="text-red-500">*</span></Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={8} placeholder="Full article content (Markdown supported)" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="community">Community</SelectItem><SelectItem value="industry">Industry</SelectItem><SelectItem value="regulatory">Regulatory</SelectItem><SelectItem value="technology">Technology</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Thumbnail URL</Label><Input value={form.thumbnail} onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))} placeholder="https://..." /></div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.isPublished} onCheckedChange={v => setForm(p => ({ ...p, isPublished: v }))} /><Label>Published</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.isFeatured} onCheckedChange={v => setForm(p => ({ ...p, isFeatured: v }))} /><Label>Featured</Label></div>
              </div>
              <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Saving..." : editing ? "Update Article" : "Create Article"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {articles.map(a => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold">{a.title}</p>
                    <Badge variant="outline" className="text-xs capitalize">{a.category}</Badge>
                    {a.isFeatured && <Badge className="text-xs bg-yellow-100 text-yellow-800">Featured</Badge>}
                    <Badge variant={a.isPublished ? "default" : "secondary"} className="text-xs">{a.isPublished ? "Published" : "Draft"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.author.fullName} · {a.viewsCount} views · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteArticle(a.slug)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {articles.length === 0 && <div className="text-center py-12 text-muted-foreground"><Newspaper className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No articles yet. Create your first news article.</p></div>}
      </div>
    </div>
  )
}
