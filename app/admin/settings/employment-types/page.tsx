"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Briefcase, ArrowLeft } from "lucide-react"
import { AdminOnly } from "@/components/auth-guard"
import Link from "next/link"

interface EmploymentType {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  isActive: boolean
  order: number
  _count?: {
    opportunities: number
  }
}

function EmploymentTypesContent() {
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "job",
    icon: "💼",
    color: "#3B82F6",
    order: 0
  })

  useEffect(() => {
    fetchEmploymentTypes()
  }, [])

  const fetchEmploymentTypes = async () => {
    try {
      const response = await fetch('/api/admin/employment-types')
      if (response.ok) {
        const data = await response.json()
        setEmploymentTypes(data)
      }
    } catch (error) {
      console.error('Error fetching employment types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employmentType: EmploymentType) => {
    setEditingId(employmentType.id)
    setFormData({
      name: employmentType.name,
      description: employmentType.description,
      category: employmentType.category,
      icon: employmentType.icon,
      color: employmentType.color,
      order: employmentType.order
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      category: "job",
      icon: "💼",
      color: "#3B82F6",
      order: 0
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId 
        ? `/api/admin/employment-types/${editingId}`
        : '/api/admin/employment-types'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchEmploymentTypes()
        handleCancel()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save employment type')
      }
    } catch (error) {
      console.error('Error saving employment type:', error)
      alert('Failed to save employment type')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employment type?')) return

    try {
      const response = await fetch(`/api/admin/employment-types/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEmploymentTypes()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete employment type')
      }
    } catch (error) {
      console.error('Error deleting employment type:', error)
      alert('Failed to delete employment type')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job': return 'bg-blue-100 text-blue-800'
      case 'gig': return 'bg-green-100 text-green-800'
      case 'other': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'job': return 'Jobs'
      case 'gig': return 'Gigs'
      case 'other': return 'Other'
      default: return category
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading employment types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Employment Types</h1>
        <p className="text-muted-foreground">
          Manage employment types for different opportunity categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit Employment Type' : 'Add New Employment Type'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update the employment type details' : 'Create a new employment type'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Permanent Drone Operator"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job">Jobs</SelectItem>
                      <SelectItem value="gig">Gigs</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full-time permanent position for drone operations"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="💼"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Employment Type' : 'Create Employment Type'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Employment Types List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Existing Employment Types
            </CardTitle>
            <CardDescription>
              {employmentTypes.length} employment types • {employmentTypes.reduce((sum, type) => sum + (type._count?.opportunities || 0), 0)} total opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employmentTypes.map((employmentType) => (
                <div
                  key={employmentType.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{employmentType.icon}</span>
                    <div>
                      <div className="font-medium">{employmentType.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employmentType.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getCategoryColor(employmentType.category)}>
                          {getCategoryLabel(employmentType.category)}
                        </Badge>
                        <Badge variant="outline">
                          {employmentType._count?.opportunities || 0} opportunities
                        </Badge>
                        <Badge variant="secondary">
                          Order: {employmentType.order}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(employmentType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(employmentType.id)}
                      disabled={(employmentType._count?.opportunities || 0) > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {employmentTypes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No employment types found. Create your first employment type to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EmploymentTypesPage() {
  return (
    <AdminOnly>
      <EmploymentTypesContent />
    </AdminOnly>
  )
}
