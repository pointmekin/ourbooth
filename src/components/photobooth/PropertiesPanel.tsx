import { useRef } from 'react'
import { toast } from 'sonner'
import { usePhotoboothStore, type StickerType } from '@/stores/photobooth-store'
import { STICKER_PACKS, type StickerItem } from '@/constants/stickers'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { selectedTemplate, addSticker, addRecentSticker, recentStickers, customFooterText, setCustomFooterText } = usePhotoboothStore()
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

  // Panel content - shared between mobile sheet and desktop sidebar
  const panelContent = (
    <div ref={panelRef} className="space-y-6">
      {/* Current Template */}
      {selectedTemplate && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</div>
          <div className="text-sm font-semibold text-foreground">{selectedTemplate.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{selectedTemplate.category} • {selectedTemplate.layout.count} photos</div>
        </div>
      )}

      {/* Footer Text Editor */}
      <div className="space-y-2">
        <Label htmlFor="footer-text" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Footer Text
        </Label>
        <Input
          id="footer-text"
          type="text"
          value={currentFooter}
          onChange={(e) => setCustomFooterText(e.target.value)}
          placeholder="Enter custom text..."
          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-rose-500/50"
        />
      </div>

      {/* Stickers Section */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-foreground">Stickers</div>
        
        {/* Quick Access - Recently used or popular */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {recentStickerItems.length > 0 ? 'Recently Used' : 'Quick Add'}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {quickAccessStickers.map(sticker => (
              <Button 
                key={sticker.id}
                variant="ghost"
                size="icon"
                onClick={() => handleAddSticker(sticker)}
                draggable
                onDragStart={(e) => handleDragStart(e, sticker)}
                className="w-10 h-10 bg-muted/50 hover:bg-rose-500/20 hover:scale-110 rounded-lg cursor-grab active:cursor-grabbing"
                title={sticker.name}
              >
                <img 
                  src={sticker.src} 
                  alt={sticker.name}
                  className="w-6 h-6 object-contain"
                  draggable={false}
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Category Accordions */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Categories</div>
          
          <Accordion type="single" collapsible className="space-y-2">
            {STICKER_PACKS.map(pack => (
              <AccordionItem 
                key={pack.id} 
                value={pack.id}
                className="bg-muted/50 rounded-lg overflow-hidden border border-border"
              >
                <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-muted">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{pack.icon}</span>
                    <span className="text-sm font-medium text-foreground">{pack.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto mr-2">{pack.stickers.length}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-2">
                  <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto">
                    {pack.stickers.map(sticker => (
                      <Button 
                        key={sticker.id}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddSticker(sticker)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, sticker)}
                        className="aspect-square w-full h-auto bg-muted/50 hover:bg-rose-500/20 rounded-md p-1.5 cursor-grab active:cursor-grabbing"
                        title={sticker.name}
                      >
                        <img 
                          src={sticker.src} 
                          alt={sticker.name}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Tip */}
        <p className="text-xs text-muted-foreground">
          Tap to add • Drag onto canvas • Pinch or drag corners to resize
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: Sheet */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent 
          side="right" 
          className="w-80 bg-background/95 border-border lg:hidden p-6 pb-24 overflow-y-auto"
        >
          <SheetHeader className="p-0 mb-6">
            <SheetTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Decorations
            </SheetTitle>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
      
      {/* Desktop: Fixed sidebar */}
      <aside className="hidden lg:block w-80 bg-background/50 backdrop-blur-xl border-l border-border p-6 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Decorations</h3>
        {panelContent}
      </aside>
    </>
  )
}
