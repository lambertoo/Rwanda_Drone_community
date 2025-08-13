"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useImageViewer } from '@/hooks/use-image-viewer'
import ImageZoomViewer from './image-zoom-viewer'

interface ClickableImageProps {
  src: string
  alt?: string
  caption?: string
  className?: string
  width?: number | string
  height?: number | string
  onClick?: () => void
  showViewer?: boolean
  images?: Array<{
    id: string
    url: string
    caption?: string
    alt?: string
  }>
  initialIndex?: number
}

export default function ClickableImage({
  src,
  alt,
  caption,
  className,
  width,
  height,
  onClick,
  showViewer = true,
  images,
  initialIndex = 0
}: ClickableImageProps) {
  const { isOpen, openViewer, closeViewer } = useImageViewer()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    if (showViewer && images) {
      openViewer(images, initialIndex)
    } else if (showViewer) {
      // Single image viewer
      openViewer([{ id: 'single', url: src, caption, alt }], 0)
    }
  }

  return (
    <>
      <div 
        className={cn(
          "cursor-pointer transition-transform hover:scale-105 active:scale-95",
          className
        )}
        onClick={handleClick}
      >
        <img
          src={src}
          alt={alt || caption || 'Image'}
          width={width}
          height={height}
          className="w-full h-full object-cover rounded-lg"
        />
        {caption && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {caption}
          </p>
        )}
      </div>

      {showViewer && (
        <ImageZoomViewer
          images={images || [{ id: 'single', url: src, caption, alt }]}
          initialIndex={initialIndex}
          isOpen={isOpen}
          onClose={closeViewer}
        />
      )}
    </>
  )
} 