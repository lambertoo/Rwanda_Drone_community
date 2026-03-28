"use client"

import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileText,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Strikethrough,
  Minus,
  Eye,
  Edit,
  Loader,
  X,
} from "lucide-react"

interface DocumentEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  label?: string
  minHeight?: number
}

export default function DocumentEditor({
  value,
  onChange,
  placeholder = "Start typing or upload a document...",
  label,
  minHeight = 300,
}: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mode, setMode] = useState<"edit" | "preview">("edit")

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    syncContent()
  }, [])

  const syncContent = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/extract-document", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || "Failed to extract document")
        return
      }

      // Insert extracted HTML into editor
      if (editorRef.current) {
        if (!editorRef.current.innerHTML || editorRef.current.innerHTML === "<br>") {
          editorRef.current.innerHTML = data.html
        } else {
          // Append to existing content
          editorRef.current.innerHTML += "<hr>" + data.html
        }
        onChange(editorRef.current.innerHTML)
      }
    } catch {
      setUploadError("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow normal text paste, intercept files
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (file) handleUpload(file)
        return
      }
    }
    // For plain text paste, let it go through normally
    // Clean up after a tick
    setTimeout(syncContent, 0)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      const text = window.getSelection()?.toString() || url
      execCommand("insertHTML", `<a href="${url}" target="_blank" rel="noopener">${text}</a>`)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      execCommand("insertHTML", `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0;" />`)
    }
  }

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
    active,
  }: {
    onClick: () => void
    icon: any
    title: string
    active?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  const ToolbarSep = () => <div className="w-px h-5 bg-border mx-0.5" />

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {label && (
        <div className="px-3 py-2 border-b bg-muted/30">
          <span className="text-sm font-medium">{label}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/20 flex-wrap">
        {/* Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload document (.docx, .pdf, .txt)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors mr-1"
        >
          {uploading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Extracting..." : "Upload Doc"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf,.txt,.md,.doc"
          onChange={handleFileChange}
          className="hidden"
        />

        <ToolbarSep />

        {/* Text formatting */}
        <ToolbarButton onClick={() => execCommand("bold")} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => execCommand("italic")} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => execCommand("underline")} icon={UnderlineIcon} title="Underline" />
        <ToolbarButton onClick={() => execCommand("strikeThrough")} icon={Strikethrough} title="Strikethrough" />

        <ToolbarSep />

        {/* Headings */}
        <ToolbarButton onClick={() => execCommand("formatBlock", "h1")} icon={Heading1} title="Heading 1" />
        <ToolbarButton onClick={() => execCommand("formatBlock", "h2")} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => execCommand("formatBlock", "h3")} icon={Heading3} title="Heading 3" />
        <ToolbarButton onClick={() => execCommand("formatBlock", "p")} icon={FileText} title="Paragraph" />

        <ToolbarSep />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={List} title="Bullet list" />
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={ListOrdered} title="Numbered list" />
        <ToolbarButton onClick={() => execCommand("formatBlock", "blockquote")} icon={Quote} title="Quote" />

        <ToolbarSep />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={AlignLeft} title="Align left" />
        <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={AlignCenter} title="Align center" />
        <ToolbarButton onClick={() => execCommand("justifyRight")} icon={AlignRight} title="Align right" />

        <ToolbarSep />

        {/* Insert */}
        <ToolbarButton onClick={insertLink} icon={Link} title="Insert link" />
        <ToolbarButton onClick={insertImage} icon={Image} title="Insert image" />
        <ToolbarButton onClick={() => execCommand("insertHorizontalRule")} icon={Minus} title="Divider" />

        <ToolbarSep />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => execCommand("undo")} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => execCommand("redo")} icon={Redo} title="Redo" />

        {/* Preview toggle */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {mode === "edit" ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
            {mode === "edit" ? "Preview" : "Edit"}
          </button>
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 text-xs border-b">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* Editor / Preview */}
      {mode === "edit" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          dangerouslySetInnerHTML={{ __html: value || "" }}
          data-placeholder={placeholder}
          className="prose prose-sm max-w-none p-4 outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 empty:before:pointer-events-none"
          style={{ minHeight }}
        />
      ) : (
        <div
          className="prose prose-sm max-w-none p-4"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value || `<p class="text-muted-foreground">Nothing to preview</p>` }}
        />
      )}

      {/* Drop zone hint */}
      {uploading && (
        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/30">
          <div className="flex items-center gap-2 text-primary">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Extracting document content...</span>
          </div>
        </div>
      )}
    </div>
  )
}
