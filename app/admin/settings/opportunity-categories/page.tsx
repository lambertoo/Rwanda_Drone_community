"use client"

import { useState, useEffect } from "react"
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
  Briefcase,
  ArrowLeft,
  Save,
  X
} from "lucide-react"
import { AdminOnly } from "@/components/auth-guard"
import { useRouter } from "next/navigation"

interface OpportunityCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  isActive: boolean
  opportunityCount: number
  createdAt: string
}

function OpportunityCategoriesPage() {
  const [categories, setCategories] = useState<OpportunityCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<OpportunityCategory | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "💼"
  })
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/opportunity-categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching opportunity categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/opportunity-categories/${editingCategory.id}`
        : "/api/admin/opportunity-categories"
      
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
        setFormData({ name: "", description: "", color: "#3B82F6", icon: "💼" })
        fetchCategories()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || "Failed to save category"}`)
      }
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Error saving category")
    }
  }

  const handleEdit = (category: OpportunityCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    
    try {
      const response = await fetch(`/api/admin/opportunity-categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || "Failed to delete category"}`)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Error deleting category")
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: "", description: "", color: "#3B82F6", icon: "💼" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Opportunity Categories</h1>
        <p className="text-muted-foreground">
          Manage categories for job opportunities and career postings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Current Categories
              </CardTitle>
              <CardDescription>
                {categories.length} categories available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No categories found. Create your first category to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: category.color + "20", color: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {category.opportunityCount} opportunities
                            </Badge>
                            {!category.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
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
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </CardTitle>
              <CardDescription>
                {editingCategory 
                  ? "Update the category information below"
                  : "Create a new opportunity category"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showForm ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Software Development"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this category"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="💼"
                      maxLength={2}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button 
                  onClick={() => setShowForm(true)} 
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Category
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function OpportunityCategoriesPageWrapper() {
  return (
    <AdminOnly>
      <OpportunityCategoriesPage />
    </AdminOnly>
  )
} 