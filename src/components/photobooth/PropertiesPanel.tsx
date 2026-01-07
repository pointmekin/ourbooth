import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { usePhotoboothStore, type StickerType } from '@/stores/photobooth-store'
import { STICKER_PACKS, type StickerItem } from '@/constants/stickers'

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { selectedTemplate, addSticker, addRecentSticker, recentStickers, customFooterText, setCustomFooterText } = usePhotoboothStore()
  const [activePackId, setActivePackId] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const defaultFooter = selectedTemplate?.footer.text ?? ''
  const currentFooter = customFooterText || defaultFooter

  // Find sticker item by src for recently used
  const findStickerBySrc = (src: string): StickerItem | undefined => {
    for (const pack of STICKER_PACKS) {
      const found = pack.stickers.find(s => s.src === src)
      if (found) return found
    }
    return undefined
  }

  const handleAddSticker = (sticker: StickerItem) => {
    addSticker(
      sticker.type === 'emoji' ? sticker.name : sticker.src,
      50,
      50,
      sticker.type as StickerType
    )
    addRecentSticker(sticker.src)
    toast(
      <div className="flex items-center gap-2">
        <img src={sticker.src} alt={sticker.name} className="w-6 h-6" />
        <span className="font-semibold text-sm">Added to canvas!</span>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, sticker: StickerItem) => {
    e.dataTransfer.setData('sticker-type', sticker.type)
    e.dataTransfer.setData('sticker-src', sticker.type === 'emoji' ? sticker.name : sticker.src)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // Get recently used as StickerItems
  const recentStickerItems = recentStickers.map(findStickerBySrc).filter(Boolean) as StickerItem[]

  // Default quick stickers (when no recent used)
  const defaultQuickStickers = [...STICKER_PACKS[0].stickers.slice(0, 4), ...STICKER_PACKS[1].stickers.slice(0, 4)]
  const quickAccessStickers = recentStickerItems.length > 0 ? recentStickerItems : defaultQuickStickers

  return (
    <>
      {/* Backdrop for mobile - click to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        ref={panelRef}
        className={`
          fixed inset-y-0 right-0 z-40 w-80 bg-neutral-950/95 backdrop-blur-xl border-l border-white/5 p-6 overflow-y-auto transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:block lg:bg-neutral-950/50
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with X button - always visible on mobile */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Decorations</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
    
        {/* Current Template */}
        {selectedTemplate && (
          <div className="space-y-2 mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Template</div>
            <div className="text-sm font-semibold text-white">{selectedTemplate.name}</div>
            <div className="text-xs text-neutral-400 capitalize">{selectedTemplate.category} • {selectedTemplate.layout.count} photos</div>
          </div>
        )}

        {/* Footer Text Editor */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Footer Text</label>
          <input
            type="text"
            value={currentFooter}
            onChange={(e) => setCustomFooterText(e.target.value)}
            placeholder="Enter custom text..."
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-neutral-600 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
          />
        </div>

        {/* Stickers Selector - Modern Category UI */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-neutral-300">Stickers</div>
          
          {/* Quick Access - Recently used or popular */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 uppercase tracking-wider">
              {recentStickerItems.length > 0 ? 'Recently Used' : 'Quick Add'}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {quickAccessStickers.map(sticker => (
                <button 
                  key={sticker.id}
                  onClick={() => handleAddSticker(sticker)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sticker)}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 hover:scale-110 rounded-lg transition-all cursor-grab active:cursor-grabbing"
                  title={sticker.name}
                >
                  <img 
                    src={sticker.src} 
                    alt={sticker.name}
                    className="w-6 h-6 object-contain"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>

        {/* Category Folders */}
        <div className="space-y-2">
          <div className="text-xs text-neutral-500 uppercase tracking-wider">Categories</div>
          
          {STICKER_PACKS.map(pack => (
            <div key={pack.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
              {/* Category Header */}
              <button
                onClick={() => setActivePackId(activePackId === pack.id ? '' : pack.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <span className="text-lg">{pack.icon}</span>
                <span className="text-sm font-medium text-neutral-200 flex-1 text-left">{pack.name}</span>
                <span className="text-[10px] text-neutral-500">{pack.stickers.length}</span>
                <svg 
                  className={`w-4 h-4 text-neutral-500 transition-transform ${activePackId === pack.id ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Expanded Sticker Grid */}
              {activePackId === pack.id && (
                <div className="px-2 pb-2">
                  <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto">
                    {pack.stickers.map(sticker => (
                      <button 
                        key={sticker.id}
                        onClick={() => handleAddSticker(sticker)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, sticker)}
                        className="aspect-square flex items-center justify-center bg-white/5 hover:bg-rose-500/20 rounded-md transition-colors p-1.5 cursor-grab active:cursor-grabbing"
                        title={sticker.name}
                      >
                        <img 
                          src={sticker.src} 
                          alt={sticker.name}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tip */}
        <p className="text-xs text-neutral-500">
          Tap to add • Drag onto canvas • Pinch or drag corners to resize
        </p>
      </div>
    </aside>
    </>
  )
}

