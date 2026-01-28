import { useMemo, useRef } from 'react'
import { usePhotoboothStore, type StickerType } from '@/stores/photobooth-store'
import { useFilterStore } from '@/stores/filter-store'
import { getCssFilterValue } from '@/lib/filter-utils'
import { getFilterById } from '@/constants/filters'
import { ResizableSticker } from './ResizableSticker'

type ViewMode = 'fit' | 'scroll'

interface PhotoStripProps {
  isExporting?: boolean
  onFileUpload: (index: number, file: File) => void
  viewMode?: ViewMode
}

export function PhotoStrip({
  isExporting = false,
  onFileUpload,
  viewMode = 'fit',
}: PhotoStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const { images, stickers, selectedTemplate, customFooterText, addSticker } = usePhotoboothStore()

  // Subscribe to filter state
  const { selectedFilter, intensity } = useFilterStore((s) => ({
    selectedFilter: s.selectedFilter,
    intensity: s.intensity
  }))

  // Memoize filter style for performance
  const filterStyle = useMemo(() => {
    if (!selectedFilter) return {}
    const preset = getFilterById(selectedFilter)
    if (!preset) return {}
    return {
      filter: getCssFilterValue(preset.parameters, intensity)
    }
  }, [selectedFilter, intensity])
  
  // Fallback if no template selected
  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center w-full h-full text-neutral-500">
        Please select a template first
      </div>
    )
  }

  const { layout, style, footer } = selectedTemplate
  
  // Use custom footer text if provided, otherwise use template default
  const displayFooterText = customFooterText || footer.text

  const handleDropIntoCanvas = (e: React.DragEvent) => {
    e.preventDefault()
    if (!stripRef.current) return

    // Get sticker data from drag event (new format)
    const stickerType = e.dataTransfer.getData('sticker-type') as StickerType | ''
    const stickerSrc = e.dataTransfer.getData('sticker-src')
    
    // Fallback for legacy emoji format
    const legacyEmoji = e.dataTransfer.getData('emoji')
    
    if (!stickerType && !legacyEmoji) return

    const rect = stripRef.current.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))

    if (stickerType && stickerSrc) {
      addSticker(stickerSrc, x, y, stickerType)
    } else if (legacyEmoji) {
      addSticker(legacyEmoji, x, y, 'emoji')
    }
  }

  // Build strip styles from template
  const stripStyle: React.CSSProperties = {
    aspectRatio: layout.aspectRatio,
    background: style.backgroundColor,
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor}` : undefined,
    borderRadius: style.borderRadius,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  }

  // Conditional classes based on view mode
  // Fit mode: constrain to available height, let width follow aspect ratio
  // Scroll mode: use larger size, allow scrolling
  const stripClasses = viewMode === 'fit'
    ? 'flex flex-col relative group select-none shadow-2xl h-full max-h-[calc(100dvh-10rem)] md:max-h-[calc(100dvh-8rem)]'
    : 'flex flex-col relative group select-none shadow-2xl min-h-[600px] md:min-h-[800px]'

  return (
    <div className={`flex items-center justify-center w-full ${viewMode === 'fit' ? 'h-full' : 'min-h-full py-8'}`}>
      <div 
        ref={stripRef}
        data-photobooth-strip
        className={stripClasses}
        style={stripStyle}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropIntoCanvas}
      >
        {!isExporting && (
          <>
            <div className="absolute inset-0 z-30 pointer-events-none opacity-30 flex items-center justify-center overflow-hidden">
              <div 
                className="-rotate-45 text-6xl font-bold whitespace-nowrap tracking-widest p-4"
                style={{ 
                  color: 'rgba(0,0,0,0.1)', 
                  border: '4px solid rgba(0,0,0,0.1)' 
                }}
              >
                PREVIEW • OURBOOTH
              </div>
            </div>
            <div className="absolute -inset-4 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </>
        )}
        
        <div 
          className="flex-1 min-h-0 grid box-border relative z-0"
          style={{ 
            gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
            gap: style.gap,
            padding: style.padding,
          }}
        >
          {Array.from({ length: layout.count }).map((_, i) => (
            <div 
              key={i} 
              className={`w-full h-full relative overflow-hidden ${!isExporting ? 'group/slot cursor-pointer transition-colors' : ''}`}
              style={{ backgroundColor: images[i] ? 'transparent' : '#f5f5f5' }}
            >
              {!isExporting && (
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && onFileUpload(i, e.target.files[0])}
                />
              )}
              
              {images[i] ? (
                <img
                  src={images[i]!}
                  alt={`Slot ${i}`}
                  className="w-full h-full object-cover"
                  style={filterStyle}
                />
              ) : (
                <div className={`absolute inset-0 flex items-center justify-center ${!isExporting ? 'group-hover/slot:text-neutral-400 transition-colors' : ''}`}>
                  <span className="text-4xl font-light" style={{ color: '#d4d4d4' }}>+</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Stickers rendered with ResizableSticker component */}
          {stickers.map(sticker => (
            <ResizableSticker
              key={sticker.id}
              sticker={sticker}
              isExporting={isExporting}
              containerRef={stripRef}
            />
          ))}
        </div>

        {displayFooterText && (
          <div 
            className="h-16 flex items-center justify-center relative z-10"
            style={{ 
              borderTop: `1px solid ${style.borderColor ?? 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <span 
              className="tracking-[0.15em] uppercase"
              style={{ 
                fontFamily: footer.font,
                color: footer.color,
                fontSize: footer.size ?? '0.65rem',
              }}
            >
              {displayFooterText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

