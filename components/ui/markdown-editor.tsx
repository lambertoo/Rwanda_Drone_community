"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Bold, Italic, List, ListOrdered, Link, Image, Code, Quote } from 'lucide-react'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  rows?: number
  className?: string
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in markdown...",
  label,
  rows = 6,
  className
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertMarkdown = (type: string) => {
    const textarea = document.querySelector(`textarea[data-markdown-editor="${label}"]`) as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    let replacement = ''

    switch (type) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`
        break
      case 'list':
        replacement = `- ${selectedText || 'list item'}`
        break
      case 'ordered-list':
        replacement = `1. ${selectedText || 'ordered item'}`
        break
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`
        break
      case 'image':
        replacement = `![${selectedText || 'alt text'}](image-url)`
        break
      case 'code':
        replacement = `\`${selectedText || 'code'}\``
        break
      case 'quote':
        replacement = `> ${selectedText || 'quote text'}`
        break
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    // Set cursor position after the inserted markdown
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + replacement.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^>\s*(.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400">$1</blockquote>')
      .replace(/^-\s*(.*$)/gm, '<li class="list-disc ml-4">$1</li>')
      .replace(/^\d+\.\s*(.*$)/gm, '<li class="list-decimal ml-4">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded" />')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">{label}</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="h-8 px-2"
          >
            {isPreview ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </>
            )}
          </Button>
        </div>
      )}

      {!isPreview ? (
        <div className="space-y-2">
          {/* Markdown Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-gray-50 dark:bg-gray-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('bold')}
              className="h-7 px-2"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('italic')}
              className="h-7 px-2"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('code')}
              className="h-7 px-2"
              title="Inline Code"
            >
              <Code className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('list')}
              className="h-7 px-2"
              title="Unordered List"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('ordered-list')}
              className="h-7 px-2"
              title="Ordered List"
            >
              <ListOrdered className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('quote')}
              className="h-7 px-2"
              title="Blockquote"
            >
              <Quote className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('link')}
              className="h-7 px-2"
              title="Link"
            >
              <Link className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown('image')}
              className="h-7 px-2"
              title="Image"
            >
              <Image className="h-3 w-3" />
            </Button>
          </div>

          {/* Markdown Textarea */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="rounded-t-none"
            data-markdown-editor={label}
          />

          {/* Markdown Help */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Markdown shortcuts:</strong> **bold**, *italic*, `code`, > quote, - list, 1. ordered list, [text](url), ![alt](image)
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 min-h-[200px]">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        </div>
      )}
    </div>
  )
} 