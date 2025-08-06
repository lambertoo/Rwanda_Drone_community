"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Hash, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { createForumPostAction } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface NewPostFormProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    description?: string
  }>
  onCancel?: () => void
}

interface FormState {
  title: string
  content: string
  selectedCategory: string
  tags: string[]
  tagInput: string
}

interface ValidationErrors {
  title?: string
  content?: string
  category?: string
  tags?: string
}

export function NewPostForm({ categories, onCancel }: NewPostFormProps) {
  const [formState, setFormState] = useState<FormState>({
    title: "",
    content: "",
    selectedCategory: "",
    tags: [],
    tagInput: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [user, setUser] = useState<any>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string, description?: string } | null>(null)
  const router = useRouter()

  // Check user authentication on mount
  useEffect(() => {
    // For now, use localStorage as the primary auth method
    // The server-side JWT authentication will handle the actual verification
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUser(user)
      } catch (error) {
        console.error("Error parsing user:", error)
        setUser(null)
      }
    }
  }, [])

  const showNotification = (type: 'success' | 'error' | 'info', message: string, description?: string) => {
    setNotification({ type, message, description })
    // Auto-hide after 5 seconds
    setTimeout(() => setNotification(null), 5000)
  }

  const handleInputChange = (field: keyof FormState, value: string | string[]) => {
    setFormState(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formState.title.trim()) {
      errors.title = "Post title is required"
    } else if (formState.title.length < 10) {
      errors.title = "Post title must be at least 10 characters long"
    } else if (formState.title.length > 200) {
      errors.title = "Post title must be less than 200 characters"
    }

    if (!formState.content.trim()) {
      errors.content = "Post content is required"
    } else if (formState.content.length < 20) {
      errors.content = "Post content must be at least 20 characters long"
    } else if (formState.content.length > 10000) {
      errors.content = "Post content must be less than 10,000 characters"
    }

    if (!formState.selectedCategory) {
      errors.category = "Please select a category"
    }

    if (formState.tags.length > 5) {
      errors.tags = "You can only add up to 5 tags"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddTag = () => {
    const tag = formState.tagInput.trim()
    if (tag && !formState.tags.includes(tag) && formState.tags.length < 5) {
      handleInputChange('tags', [...formState.tags, tag])
      handleInputChange('tagInput', '')
      showNotification('info', 'Tag added', `Added tag: ${tag}`)
    } else if (formState.tags.includes(tag)) {
      showNotification('error', 'Tag already exists', 'This tag has already been added')
    } else if (formState.tags.length >= 5) {
      showNotification('error', 'Too many tags', 'You can only add up to 5 tags')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formState.tags.filter(tag => tag !== tagToRemove))
    showNotification('info', 'Tag removed', `Removed tag: ${tagToRemove}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      showNotification('error', 'Authentication Required', 'You must be logged in to create a forum post. Please sign in and try again.')
      return
    }

    if (!validateForm()) {
      showNotification('error', 'Validation Error', 'Please fix the errors in the form before submitting.')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', formState.title)
      formData.append('content', formState.content)
      formData.append('categoryId', formState.selectedCategory)
      formData.append('tags', JSON.stringify(formState.tags))

      const result = await createForumPostAction(formData)

      if (result.success) {
        showNotification('success', 'Post Created Successfully!', 'Your forum post has been published. Redirecting...')
        
        // Redirect after a delay
        setTimeout(() => {
          if (result.redirectUrl) {
            router.push(result.redirectUrl)
          } else {
            router.push('/forum')
          }
        }, 2000)
      } else {
        showNotification('error', 'Failed to Create Post', result.error || 'An unexpected error occurred')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      showNotification('error', 'Network Error', 'Please check your connection and try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Create New Forum Post
        </CardTitle>
        <CardDescription>
          Share your thoughts, ask questions, or start a discussion in the community
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Notification Popup */}
        {notification && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-green-100 border-green-300 text-green-900 shadow-green-100' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {notification.type === 'info' && <div className="h-5 w-5 text-blue-400">ℹ</div>}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold">{notification.message}</p>
                  {notification.description && (
                    <p className="text-sm mt-1 opacity-90">{notification.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Warning */}
        {!user && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to create a forum post. Please sign in first.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Post Title *</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your post..."
              className={validationErrors.title ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-600">{validationErrors.title}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formState.title.length}/200 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formState.selectedCategory}
              onValueChange={(value) => handleInputChange('selectedCategory', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category for your post" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.category && (
              <p className="text-sm text-red-600">{validationErrors.category}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Post Content *</Label>
            <Textarea
              id="content"
              value={formState.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your post content here..."
              rows={8}
              className={validationErrors.content ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {validationErrors.content && (
              <p className="text-sm text-red-600">{validationErrors.content}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formState.content.length}/10,000 characters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={formState.tagInput}
                onChange={(e) => handleInputChange('tagInput', e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={isSubmitting || !formState.tagInput.trim() || formState.tags.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {validationErrors.tags && (
              <p className="text-sm text-red-600">{validationErrors.tags}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Press Enter or click + to add tags. Maximum 5 tags allowed.
            </p>
            
            {/* Display Tags */}
            {formState.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formState.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">* Required fields</div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => showNotification('success', 'Test Success!', 'This is a test success notification with green background')}
              >
                Test Success
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || !user}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Post...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
