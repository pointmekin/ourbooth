import { useRef } from 'react'
import { usePhotoboothStore } from '@/stores/photobooth-store'

// Convert emoji to Twemoji CDN URL for consistent rendering
function getEmojiUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map(char => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`
}

const LAYOUTS = {
  '2x2': { cols: 2, rows: 2, count: 4 },
  '1x4': { cols: 1, rows: 4, count: 4 },
  '1x3': { cols: 1, rows: 3, count: 3 },
}

interface PhotoStripProps {
  isExporting?: boolean
  draggingStickerId: number | null
  onDragStart: (e: React.MouseEvent | React.TouchEvent, id: number) => void
  onFileUpload: (index: number, file: File) => void
}

export function PhotoStrip({ 
  isExporting = false, 
  draggingStickerId,
  onDragStart,
  onFileUpload,
}: PhotoStripProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const { images, stickers, selectedLayout, addSticker } = usePhotoboothStore()
  
  const currentLayout = LAYOUTS[selectedLayout]

  const handleDropIntoCanvas = (e: React.DragEvent) => {
    e.preventDefault()
    if (!stripRef.current) return

    const emoji = e.dataTransfer.getData('emoji')
    if (!emoji) return

    const rect = stripRef.current.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))

    addSticker(emoji, x, y)
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div 
        ref={stripRef}
        data-photobooth-strip
        className="flex flex-col relative group select-none shadow-2xl h-full max-h-[calc(100dvh-12rem)] md:max-h-[calc(100dvh-10rem)]"
        style={{ 
          aspectRatio: selectedLayout === '1x4' ? '1/4' : '2/3',
          backgroundColor: '#ffffff',
          color: '#000000',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
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
          className="flex-1 min-h-0 grid gap-2.5 p-4 box-border relative z-0"
          style={{ 
            gridTemplateColumns: `repeat(${currentLayout.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${currentLayout.rows}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: currentLayout.count }).map((_, i) => (
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
                />
              ) : (
                <div className={`absolute inset-0 flex items-center justify-center ${!isExporting ? 'group-hover/slot:text-neutral-400 transition-colors' : ''}`}>
                  <span className="text-4xl font-light" style={{ color: '#d4d4d4' }}>+</span>
                </div>
              )}
            </div>
          ))}
          
          {stickers.map(s => (
            <div 
              key={s.id} 
              onMouseDown={(e) => onDragStart(e, s.id)}
              onTouchStart={(e) => onDragStart(e, s.id)}
              className="absolute z-40 drop-shadow-md select-none touch-none"
              style={{ 
                left: `${s.x}%`, 
                top: `${s.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: draggingStickerId === s.id ? 'grabbing' : 'grab',
              }}
            >
              <img 
                src={getEmojiUrl(s.emoji)} 
                alt={s.emoji}
                className="w-10 h-10 pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <div 
          className="h-16 flex items-center justify-center relative z-10"
          style={{ 
            borderTop: '1px solid #f5f5f5', 
            backgroundColor: '#ffffff'
          }}
        >
          <span 
            className="font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: '#a3a3a3' }}
          >
            OurBooth • 2025
          </span>
        </div>
      </div>
    </div>
  )
}
