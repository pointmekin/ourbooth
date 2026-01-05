import { toast } from 'sonner'
import { usePhotoboothStore } from '@/stores/photobooth-store'

// Convert emoji to Twemoji CDN URL for consistent rendering
function getEmojiUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map(char => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-')
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`
}

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { selectedLayout, setLayout, addSticker } = usePhotoboothStore()

  const handleAddSticker = (emoji: string) => {
    addSticker(emoji)
    toast(
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="font-semibold text-sm">Added to canvas!</span>
      </div>
    )
  }

  const handleDragStart = (e: React.DragEvent, emoji: string) => {
    e.dataTransfer.setData('emoji', emoji)
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
    
      {/* Layout Selector */}
      <div className="space-y-4 mb-8">
        <div className="text-sm font-medium text-neutral-300">Layout</div>
        <div className="grid grid-cols-2 gap-2">
          <div 
            onClick={() => setLayout('2x2')}
            className={`aspect-3/4 border rounded-sm cursor-pointer transition-colors ${selectedLayout === '2x2' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 hover:border-white/30'}`} 
          >
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
              {[1,2,3,4].map(i => <div key={i} className="bg-current opacity-20" />)}
            </div>
          </div>
          <div 
            onClick={() => setLayout('1x4')}
            className={`aspect-3/4 border rounded-sm cursor-pointer transition-colors ${selectedLayout === '1x4' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 hover:border-white/30'}`} 
          >
            <div className="w-full h-full grid grid-cols-1 grid-rows-4 gap-1 p-2 py-4 px-6">
              {[1,2,3,4].map(i => <div key={i} className="bg-current opacity-20" />)}
            </div>
          </div>
        </div>
      </div>

      {/* Stickers Selector */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-neutral-300">Decorations</div>
        <div className="grid grid-cols-4 gap-2">
          {['🎀', '✨', '💖', '🔥', '👑', '🕶️', '🌸', '💀'].map(emoji => (
            <button 
              key={emoji}
              onClick={() => handleAddSticker(emoji)}
              draggable
              onDragStart={(e) => handleDragStart(e, emoji)}
              className="aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors p-2"
            >
              <img 
                src={getEmojiUrl(emoji)} 
                alt={emoji}
                className="w-6 h-6"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
