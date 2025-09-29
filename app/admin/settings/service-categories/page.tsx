'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AdminOnly } from '@/components/auth-guard'
import { Plus, Wrench, Edit, Trash2, X } from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  description: string
  createdAt: string
  _count: {
    services: number
  }
}

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/service-categories', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching service categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/service-categories/${editingCategory.id}`
        : '/api/admin/service-categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCategories()
        resetForm()
      } else {
        console.error('Failed to save service category')
      }
    } catch (error) {
      console.error('Error saving service category:', error)
    }
  }

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      const response = await fetch(`/api/admin/service-categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        console.error('Failed to delete service category')
      }
    } catch (error) {
      console.error('Error deleting service category:', error)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingCategory(null)
    setShowForm(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <AdminOnly>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Service Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage service categories for organizing platform services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      Service Categories
                    </CardTitle>
                    <CardDescription>
                      {categories.length} categories created
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No service categories found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold">{category.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {category.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {category._count.services} services
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Created {new Date(category.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter category name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter category description"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          {editingCategory ? 'Update' : 'Create'}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminOnly>
  )
}
