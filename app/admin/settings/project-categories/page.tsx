"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Briefcase,
  Save,
  X
} from "lucide-react"
import Link from "next/link"
import { AdminOnly } from "@/components/auth-guard"

interface ProjectCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
  _count?: {
    projects: number
  }
}

function ProjectCategoriesContent() {
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    icon: "",
    color: "#3B82F6"
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/project-categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/project-categories/${editingCategory.id}`
        : "/api/admin/project-categories"
      
      const method = editingCategory ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCategory(null)
        setFormData({
          name: "",
          description: "",
          slug: "",
          icon: "",
          color: "#3B82F6"
        })
        fetchCategories()
      }
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleEdit = (category: ProjectCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
      icon: category.icon,
      color: category.color
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    
    try {
      const response = await fetch(`/api/admin/project-categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      slug: "",
      icon: "",
      color: "#3B82F6"
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Project Categories</h1>
        <p className="text-muted-foreground">
          Manage project categories and their settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    {categories.length} project categories
                  </CardDescription>
                </div>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon || "🚁"}
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{category.slug}</Badge>
                          {category._count && (
                            <Badge variant="outline">
                              {category._count.projects} projects
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No categories yet. Create your first one!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </CardTitle>
                <CardDescription>
                  {editingCategory ? "Update category details" : "Create a new project category"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Agriculture"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Drone projects related to agriculture"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="agriculture"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🌾"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProjectCategoriesPage() {
  return (
    <AdminOnly>
      <ProjectCategoriesContent />
    </AdminOnly>
  )
} 