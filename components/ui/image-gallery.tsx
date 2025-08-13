"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useImageViewer } from '@/hooks/use-image-viewer'
import ImageZoomViewer from './image-zoom-viewer'

interface GalleryImage {
  id: string
  url: string
  caption?: string
  alt?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  showCaptions?: boolean
  className?: string
  imageClassName?: string
  maxImages?: number
  showViewAllButton?: boolean
}

export default function ImageGallery({
  images,
  columns = 3,
  gap = 'md',
  showCaptions = true,
  className,
  imageClassName,
  maxImages,
  showViewAllButton = false
}: ImageGalleryProps) {
  const { isOpen, openViewer, closeViewer } = useImageViewer()

  const displayedImages = maxImages ? images.slice(0, maxImages) : images
  const hasMoreImages = maxImages ? images.length > maxImages : false

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
  }

  const gapSizes = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const handleImageClick = (index: number) => {
    openViewer(images, index)
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No images available
      </div>
    )
  }

  return (
    <>
      <div className={cn(
        "grid",
        gridCols[columns],
        gapSizes[gap],
        className
      )}>
        {displayedImages.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              "group cursor-pointer transition-all duration-200 hover:scale-105",
              imageClassName
            )}
            onClick={() => handleImageClick(index)}
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={image.url}
                alt={image.alt || image.caption || `Image ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium">
                  Click to view
                </div>
              </div>
            </div>
            {showCaptions && image.caption && (
              <p className="mt-2 text-sm text-muted-foreground text-center line-clamp-2">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {showViewAllButton && hasMoreImages && (
        <div className="text-center mt-6">
          <button
            onClick={() => openViewer(images, 0)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View All {images.length} Images
          </button>
        </div>
      )}

      <ImageZoomViewer
        images={images}
        isOpen={isOpen}
        onClose={closeViewer}
        showNavigation={images.length > 1}
        showZoomControls={true}
        showDownload={true}
        showFullscreen={true}
      />
    </>
  )
} 