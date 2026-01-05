import { useState } from 'react'
import { toast } from 'sonner'
import { usePhotoboothStore, type StickerType } from '@/stores/photobooth-store'
import { STICKER_PACKS, type StickerItem } from '@/constants/stickers'

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { selectedTemplate, addSticker } = usePhotoboothStore()
  const [activePackId, setActivePackId] = useState(STICKER_PACKS[0].id)

  const activePack = STICKER_PACKS.find(p => p.id === activePackId) ?? STICKER_PACKS[0]

  const handleAddSticker = (sticker: StickerItem) => {
    addSticker(
      sticker.type === 'emoji' ? sticker.name : sticker.src,
      50,
      50,
      sticker.type as StickerType
    )
    toast(
      <div className="flex items-center gap-2">
        <img src={sticker.src} alt={sticker.name} className="w-6 h-6" />
        <span className="font-semibold text-sm">Added to canvas!</span>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, sticker: StickerItem) => {
    // Store both the source and type for drop handling
    e.dataTransfer.setData('sticker-type', sticker.type)
    e.dataTransfer.setData('sticker-src', sticker.type === 'emoji' ? sticker.name : sticker.src)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <aside className={`
      fixed inset-y-0 right-0 z-40 w-80 bg-neutral-950/95 backdrop-blur-xl border-l border-white/5 p-6 overflow-y-auto transition-transform duration-300 ease-in-out
      lg:relative lg:translate-x-0 lg:block lg:bg-neutral-950/50
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Properties</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg text-white"
        >
          ✕
        </button>
      </div>
    
      {/* Current Template */}
      {selectedTemplate && (
        <div className="space-y-2 mb-8 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Template</div>
          <div className="text-sm font-semibold text-white">{selectedTemplate.name}</div>
          <div className="text-xs text-neutral-400 capitalize">{selectedTemplate.category} • {selectedTemplate.layout.count} photos</div>
        </div>
      )}

      {/* Stickers Selector */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-neutral-300">Decorations</div>
        
        {/* Pack Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {STICKER_PACKS.map(pack => (
            <button
              key={pack.id}
              onClick={() => setActivePackId(pack.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activePackId === pack.id 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <span>{pack.icon}</span>
              <span>{pack.name}</span>
            </button>
          ))}
        </div>

        {/* Sticker Grid */}
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
          {activePack.stickers.map(sticker => (
            <button 
              key={sticker.id}
              onClick={() => handleAddSticker(sticker)}
              draggable
              onDragStart={(e) => handleDragStart(e, sticker)}
              className="aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors p-2 cursor-grab active:cursor-grabbing"
              title={sticker.name}
            >
              <img 
                src={sticker.src} 
                alt={sticker.name}
                className="w-8 h-8 object-contain"
                draggable={false}
              />
            </button>
          ))}
        </div>

        {/* Tip */}
        <p className="text-xs text-neutral-500 mt-2">
          Tip: Drag stickers onto the canvas. Drag corners to resize.
        </p>
      </div>
    </aside>
  )
}

