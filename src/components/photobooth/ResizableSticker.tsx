import { useState, useRef, useCallback, useEffect } from 'react'
import { usePhotoboothStore, type Sticker } from '@/stores/photobooth-store'
import { X } from 'lucide-react'

// Convert emoji to Twemoji CDN URL for consistent rendering
function getEmojiUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map(char => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`
}

interface ResizableStickerProps {
  sticker: Sticker
  isExporting?: boolean
  containerRef: React.RefObject<HTMLElement | null>
}

export function ResizableSticker({ sticker, isExporting = false, containerRef }: ResizableStickerProps) {
  const { updateStickerPosition, updateStickerScale, bringToFront, removeSticker } = usePhotoboothStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  
  const initialPointer = useRef({ x: 0, y: 0 })
  const initialPosition = useRef({ x: 0, y: 0 })
  const initialScale = useRef(1)
  const initialPinchDistance = useRef<number | null>(null)

  // Get the image source based on sticker type
  const imageSrc = sticker.type === 'emoji' 
    ? getEmojiUrl(sticker.emoji!) 
    : sticker.src!

  // Base size for stickers (px)
  const BASE_SIZE = 48
  const size = BASE_SIZE * sticker.scale

  // Get container dimensions for percentage calculations
  const getContainerRect = useCallback(() => {
    return containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 1, height: 1 }
  }, [containerRef])

  // Handle pointer down (start drag or resize)
  const handlePointerDown = useCallback((e: React.PointerEvent, mode: 'drag' | 'resize') => {
    e.preventDefault()
    e.stopPropagation()
    
    // Capture the pointer for reliable tracking
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    
    if (mode === 'drag') {
      setIsDragging(true)
      initialPointer.current = { x: e.clientX, y: e.clientY }
      initialPosition.current = { x: sticker.x, y: sticker.y }
    } else {
      setIsResizing(true)
      initialPointer.current = { x: e.clientX, y: e.clientY }
      initialScale.current = sticker.scale
    }
    
    bringToFront(sticker.id)
    setIsSelected(true)
  }, [sticker.x, sticker.y, sticker.scale, sticker.id, bringToFront])

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      const rect = getContainerRect()
      const deltaX = ((e.clientX - initialPointer.current.x) / rect.width) * 100
      const deltaY = ((e.clientY - initialPointer.current.y) / rect.height) * 100
      
      const newX = Math.min(100, Math.max(0, initialPosition.current.x + deltaX))
      const newY = Math.min(100, Math.max(0, initialPosition.current.y + deltaY))
      
      updateStickerPosition(sticker.id, newX, newY)
    } else if (isResizing) {
      // Calculate scale based on distance from initial pointer position
      const deltaX = e.clientX - initialPointer.current.x
      const deltaY = e.clientY - initialPointer.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const sign = deltaX + deltaY > 0 ? 1 : -1
      
      const scaleDelta = (sign * distance) / 100
      const newScale = Math.max(0.3, Math.min(3, initialScale.current + scaleDelta))
      
      updateStickerScale(sticker.id, newScale)
    }
  }, [isDragging, isResizing, sticker.id, getContainerRect, updateStickerPosition, updateStickerScale])

  // Handle pointer up
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  // Touch pinch-to-zoom gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      initialPinchDistance.current = Math.sqrt(dx * dx + dy * dy)
      initialScale.current = sticker.scale
      setIsSelected(true)
      bringToFront(sticker.id)
    }
  }, [sticker.scale, sticker.id, bringToFront])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const currentDistance = Math.sqrt(dx * dx + dy * dy)
      
      const scaleChange = currentDistance / initialPinchDistance.current
      const newScale = Math.max(0.3, Math.min(3, initialScale.current * scaleChange))
      
      updateStickerScale(sticker.id, newScale)
    }
  }, [sticker.id, updateStickerScale])

  const handleTouchEnd = useCallback(() => {
    initialPinchDistance.current = null
  }, [])

  // Click outside to deselect
  useEffect(() => {
    if (!isSelected) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(`[data-sticker-id="${sticker.id}"]`)) {
        setIsSelected(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSelected, sticker.id])

  // During export, render without controls
  if (isExporting) {
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${sticker.x}%`,
          top: `${sticker.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: sticker.zIndex,
        }}
      >
        <img
          src={imageSrc}
          alt=""
          style={{ width: size, height: size }}
          className="object-contain"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div
      data-sticker-id={sticker.id}
      className="absolute touch-none select-none"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: sticker.zIndex + 40, // Ensure stickers are above photo slots
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={(e) => handlePointerDown(e, 'drag')}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Selection ring */}
      {isSelected && (
        <div 
          className="absolute -inset-2 border-2 border-rose-500 rounded-lg pointer-events-none"
          style={{ 
            width: size + 16, 
            height: size + 16,
            left: -8,
            top: -8,
          }}
        />
      )}

      {/* Sticker image */}
      <img
        src={imageSrc}
        alt=""
        style={{ width: size, height: size }}
        className="object-contain drop-shadow-lg pointer-events-none"
        draggable={false}
      />

      {/* Resize handle (bottom-right corner) */}
      {isSelected && (
        <>
          <div
            className="absolute w-5 h-5 bg-rose-500 rounded-full border-2 border-white shadow-lg cursor-se-resize flex items-center justify-center"
            style={{
              right: -10,
              bottom: -10,
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              handlePointerDown(e, 'resize')
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-white">
              <path d="M1 7L7 1M4 7L7 4M7 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Delete button */}
          <button
            className="absolute w-5 h-5 bg-neutral-800 hover:bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors"
            style={{
              right: -10,
              top: -10,
            }}
            onClick={(e) => {
              e.stopPropagation()
              removeSticker(sticker.id)
            }}
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </>
      )}
    </div>
  )
}
