import { useState, useCallback } from 'react'

interface ImageItem {
  id: string
  url: string
  caption?: string
  alt?: string
}

export function useImageViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [initialIndex, setInitialIndex] = useState(0)

  const openViewer = useCallback((imageList: ImageItem[], startIndex: number = 0) => {
    setImages(imageList)
    setInitialIndex(startIndex)
    setIsOpen(true)
  }, [])

  const closeViewer = useCallback(() => {
    setIsOpen(false)
    setImages([])
    setInitialIndex(0)
  }, [])

  const openSingleImage = useCallback((image: ImageItem) => {
    openViewer([image], 0)
  }, [openViewer])

  return {
    isOpen,
    images,
    initialIndex,
    openViewer,
    closeViewer,
    openSingleImage
  }
} 