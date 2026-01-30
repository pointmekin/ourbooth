import { usePhotoboothStore } from '@/stores/photobooth-store'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PropertiesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PropertiesPanel({ isOpen, onClose }: PropertiesPanelProps) {
  const { selectedTemplate, customFooterText, setCustomFooterText } = usePhotoboothStore()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const defaultFooter = selectedTemplate?.footer.text ?? ''
  const currentFooter = customFooterText || defaultFooter

  // Panel content - shared between mobile sheet and desktop sidebar
  const panelContent = (
    <div className="space-y-6">
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
    </div>
  )

  // Don't render anything if not open
  if (!isOpen) return null

  // Desktop: Static sidebar
  if (isDesktop) {
    return (
      <aside className="w-72 bg-background/50 backdrop-blur-xl border-r border-border p-5 overflow-y-auto flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">Properties</h3>
        {panelContent}
      </aside>
    )
  }

  // Mobile: Sheet
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-80 bg-background/95 border-border p-6 pb-24 overflow-y-auto"
      >
        <SheetHeader className="p-0 mb-6">
          <SheetTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Properties
          </SheetTitle>
        </SheetHeader>
        {panelContent}
      </SheetContent>
    </Sheet>
  )
}
