import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertTriangle, FileText, X, CloudUpload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { detectFileType, formatFileSize } from "@/lib/file-upload"
import { useAuth } from "@/lib/auth-context"

interface NewResourceFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewResourceForm({ onSuccess, onCancel }: NewResourceFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    fileType: "",
    fileSize: "",
    category: "",
    isRegulation: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 100MB",
          variant: "destructive"
        })
        return
      }

      setUploadedFile(file)
      
      // Auto-detect file type and size
      const fileType = detectFileType(file.name)
      const fileSize = formatFileSize(file.size)
      
      setFormData(prev => ({
        ...prev,
        fileType,
        fileSize,
        fileUrl: file.name // Use filename as temporary URL
      }))
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} (${fileSize})`,
      })
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error uploading file",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFormData(prev => ({
      ...prev,
      fileType: "",
      fileSize: "",
      fileUrl: ""
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to share resources",
        variant: "destructive"
      })
      return
    }

    // Validate required fields
    if (!formData.title || !formData.category || (!uploadedFile && !formData.fileUrl)) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Check regulation resource permissions
    if (formData.isRegulation && !["admin", "regulator"].includes(currentUser.role)) {
      toast({
        title: "Permission denied",
        description: "Only admins and regulators can upload regulation resources",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare form data
      const submitData = {
        ...formData,
        fileUrl: uploadedFile ? uploadedFile.name : formData.fileUrl,
        fileUpload: uploadedFile ? uploadedFile.name : undefined
      }

      const response = await fetch("/api/resources", {
        method: "POST",
        credentials: 'include', // Include cookies for JWT authentication
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Resource shared successfully!",
          description: "Your resource is now available to the community",
        })
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          fileUrl: "",
          fileType: "",
          fileSize: "",
          category: "",
          isRegulation: false
        })
        setUploadedFile(null)
        
        onSuccess?.()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to share resource")
      }
    } catch (error) {
      console.error("Error sharing resource:", error)
      toast({
        title: "Error sharing resource",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canUploadRegulation = currentUser && ["admin", "regulator"].includes(currentUser.role)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Resource Title *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter resource title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe the resource content"
            rows={3}
          />
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-2">
            File *
          </label>
          
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {uploadedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText className="h-8 w-8" />
                  <span className="font-medium">{uploadedFile.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatFileSize(uploadedFile.size)} • {detectFileType(uploadedFile.name)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <CloudUpload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, Excel, Video, Audio, Images (Max 100MB)
                  </p>
                </div>
                <Input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.wmv,.mp3,.wav,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Or use URL */}
          <div className="text-center">
            <span className="text-sm text-gray-500">— or —</span>
          </div>
          
          <div>
            <label htmlFor="fileUrl" className="block text-sm font-medium mb-2">
              File URL
            </label>
            <Input
              id="fileUrl"
              type="url"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange("fileUrl", e.target.value)}
              placeholder="https://example.com/file.pdf"
              disabled={!!uploadedFile}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this if you have a file hosted elsewhere
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fileType" className="block text-sm font-medium mb-2">
              File Type
            </label>
            <Select
              value={formData.fileType}
              onValueChange={(value) => handleInputChange("fileType", value)}
              disabled={!!uploadedFile}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Word">Word</SelectItem>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="PowerPoint">PowerPoint</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Archive">Archive</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="fileSize" className="block text-sm font-medium mb-2">
              File Size
            </label>
            <Input
              id="fileSize"
              value={formData.fileSize}
              onChange={(e) => handleInputChange("fileSize", e.target.value)}
              placeholder="Auto-calculated"
              disabled={!!uploadedFile}
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category *
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REGULATIONS">Regulations</SelectItem>
              <SelectItem value="SAFETY">Safety</SelectItem>
              <SelectItem value="TEMPLATES">Templates</SelectItem>
              <SelectItem value="TUTORIALS">Tutorials</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canUploadRegulation && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRegulation"
              checked={formData.isRegulation}
              onCheckedChange={(checked) => handleInputChange("isRegulation", checked as boolean)}
            />
            <label htmlFor="isRegulation" className="text-sm font-medium">
              This is a regulation resource
            </label>
          </div>
        )}

        {!canUploadRegulation && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only admins and regulators can upload regulation resources.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !currentUser}
        >
          {isSubmitting ? "Sharing..." : "Share Resource"}
        </Button>
      </div>
    </form>
  )
} 