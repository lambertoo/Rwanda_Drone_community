"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Download, Fullscreen, Minimize2 as FullscreenExit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageZoomViewerProps {
  images: Array<{
    id: string
    url: string
    caption?: string
    alt?: string
  }>
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  showNavigation?: boolean
  showZoomControls?: boolean
  showDownload?: boolean
  showFullscreen?: boolean
  className?: string
}

export default function ImageZoomViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  showNavigation = true,
  showZoomControls = true,
  showDownload = true,
  showFullscreen = true,
  className
}: ImageZoomViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset zoom and position when image changes
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break
        case '-':
          e.preventDefault()
          zoomOut()
          break
        case '0':
          e.preventDefault()
          resetZoom()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, scale])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 5))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1))
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }, [scale, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, scale, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + wheel
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setScale(prev => Math.max(0.1, Math.min(5, prev * delta)))
    } else {
      // Pan with wheel
      setPosition(prev => ({
        x: prev.x - e.deltaX * 0.5,
        y: prev.y - e.deltaY * 0.5
      }))
    }
  }, [])

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    // If not zoomed, zoom in. If zoomed, reset zoom
    if (scale === 1) {
      zoomIn()
    } else {
      resetZoom()
    }
  }, [scale, zoomIn, resetZoom])

  const downloadImage = useCallback(async () => {
    const image = images[currentIndex]
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${image.id}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }, [currentIndex, images])

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm",
        isFullscreen && "bg-black",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm">
            {currentIndex + 1} of {images.length}
          </span>
          {currentImage.caption && (
            <span className="text-white/80 text-sm ml-4">
              {currentImage.caption}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadImage}
              className="text-white hover:bg-white/20"
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {showFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <FullscreenExit className="h-4 w-4" />
              ) : (
                <Fullscreen className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      {showZoomControls && (
        <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="text-white hover:bg-white/20"
            title="Zoom in (Ctrl/Cmd + +)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="text-white hover:bg-white/20"
            title="Zoom out (Ctrl/Cmd + -)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetZoom}
            className="text-white hover:bg-white/20"
            title="Reset zoom (Ctrl/Cmd + 0)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation Arrows */}
      {showNavigation && images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            title="Previous image (←)"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            title="Next image (→)"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Image Container */}
      <div className="flex items-center justify-center h-full p-16">
        <div
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          <img
            ref={imageRef}
            src={currentImage.url}
            alt={currentImage.alt || currentImage.caption || 'Image'}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              cursor: scale > 1 ? 'grab' : 'pointer'
            }}
            onClick={handleImageClick}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {showNavigation && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-white scale-110"
                  : "border-white/30 hover:border-white/60"
              )}
            >
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Level Indicator */}
      {scale !== 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  )
} 