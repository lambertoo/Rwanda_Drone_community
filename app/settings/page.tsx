"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"

interface ForumCategory {
  id: string
  name: string
  description: string
  slug: string
  color: string
  postCount: number
}

interface ProjectCategory {
  id: string
  name: string
  description: string
  slug: string
  color: string
  projectCount: number
}

export default function SettingsPage() {
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([])
  const [projectCategories, setProjectCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingForum, setEditingForum] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [newForum, setNewForum] = useState({ name: "", description: "", color: "#3b82f6" })
  const [newProject, setNewProject] = useState({ name: "", description: "", color: "#10b981" })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const [forumRes, projectRes] = await Promise.all([
        fetch('/api/settings/forum-categories'),
        fetch('/api/settings/project-categories')
      ])
      
      if (forumRes.ok) {
        const forumData = await forumRes.json()
        setForumCategories(forumData.categories)
      }
      
      if (projectRes.ok) {
        const projectData = await projectRes.json()
        setProjectCategories(projectData.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const createForumCategory = async () => {
    try {
      const response = await fetch('/api/settings/forum-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForum)
      })
      
      if (response.ok) {
        setNewForum({ name: "", description: "", color: "#3b82f6" })
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating forum category:', error)
    }
  }

  const createProjectCategory = async () => {
    try {
      const response = await fetch('/api/settings/project-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })
      
      if (response.ok) {
        setNewProject({ name: "", description: "", color: "#10b981" })
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating project category:', error)
    }
  }

  const updateForumCategory = async (id: string, data: Partial<ForumCategory>) => {
    try {
      const response = await fetch(`/api/settings/forum-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        setEditingForum(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error updating forum category:', error)
    }
  }

  const updateProjectCategory = async (id: string, data: Partial<ProjectCategory>) => {
    try {
      const response = await fetch(`/api/settings/project-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        setEditingProject(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error updating project category:', error)
    }
  }

  const deleteForumCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all posts in this category.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/settings/forum-categories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting forum category:', error)
    }
  }

  const deleteProjectCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all projects in this category.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/settings/project-categories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting project category:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage categories for forum posts and projects</p>
      </div>

      <Tabs defaultValue="forum" className="space-y-6">
        <TabsList>
          <TabsTrigger value="forum">Forum Categories</TabsTrigger>
          <TabsTrigger value="projects">Project Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="forum" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Forum Category</CardTitle>
              <CardDescription>Create a new category for forum posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Category name"
                  value={newForum.name}
                  onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newForum.description}
                  onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                />
                <Input
                  placeholder="Icon (emoji)"
                />
                <Input
                  type="color"
                  value={newForum.color}
                  onChange={(e) => setNewForum({ ...newForum, color: e.target.value })}
                  className="w-full h-10"
                />
              </div>
              <Button onClick={createForumCategory} disabled={!newForum.name}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {forumCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  {editingForum === category.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Category name"
                          defaultValue={category.name}
                          id={`forum-name-${category.id}`}
                        />
                        <Input
                          placeholder="Description"
                          defaultValue={category.description}
                          id={`forum-desc-${category.id}`}
                        />
                        <Input
                          type="color"
                          defaultValue={category.color}
                          id={`forum-color-${category.id}`}
                          className="w-full h-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateForumCategory(category.id, {
                            name: (document.getElementById(`forum-name-${category.id}`) as HTMLInputElement)?.value,
                            description: (document.getElementById(`forum-desc-${category.id}`) as HTMLInputElement)?.value,
                            color: (document.getElementById(`forum-color-${category.id}`) as HTMLInputElement)?.value,
                          })}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingForum(null)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{category.postCount} posts</Badge>
                            <Badge variant="outline">{category.slug}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingForum(category.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteForumCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Project Category</CardTitle>
              <CardDescription>Create a new category for projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Category name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <Input
                  placeholder="Icon (emoji)"
                />
                <Input
                  type="color"
                  value={newProject.color}
                  onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                  className="w-full h-10"
                />
              </div>
              <Button onClick={createProjectCategory} disabled={!newProject.name}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {projectCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  {editingProject === category.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Category name"
                          defaultValue={category.name}
                          id={`project-name-${category.id}`}
                        />
                        <Input
                          placeholder="Description"
                          defaultValue={category.description}
                          id={`project-desc-${category.id}`}
                        />
                        <Input
                          type="color"
                          defaultValue={category.color}
                          id={`project-color-${category.id}`}
                          className="w-full h-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateProjectCategory(category.id, {
                            name: (document.getElementById(`project-name-${category.id}`) as HTMLInputElement)?.value,
                            description: (document.getElementById(`project-desc-${category.id}`) as HTMLInputElement)?.value,
                            color: (document.getElementById(`project-color-${category.id}`) as HTMLInputElement)?.value,
                          })}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingProject(null)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{category.projectCount} projects</Badge>
                            <Badge variant="outline">{category.slug}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProject(category.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProjectCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 