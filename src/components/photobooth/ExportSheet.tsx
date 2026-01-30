import { useState } from 'react'
import { Download, FileImage, Film, Sparkles, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { exportPhotoboothFn } from '@/server/export'
import { usePhotoboothStore, RESOLUTION_OPTIONS, type ExportResolution } from '@/stores/photobooth-store'
import { useFilterStore } from '@/stores/filter-store'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ExportSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportSheet({ isOpen, onClose }: ExportSheetProps) {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  
  const {
    images,
    stickers,
    selectedTemplate,
    exportType,
    setExportType,
    exportResolution,
    setExportResolution,
    customFooterText
  } = usePhotoboothStore()

  const { selectedFilter, intensity } = useFilterStore()
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)

  const handleExport = async () => {
    if (!session) {
      toast.error("Please sign in to export your masterpiece!")
      navigate({ to: '/auth/signin' })
      return
    }

    const validImages = images.filter(Boolean) as string[]
    if (validImages.length === 0) {
      toast.error("Please add at least one photo!")
      return
    }

    setIsExporting(true)

    const stripEl = document.querySelector('[data-photobooth-strip]') as HTMLElement
    const previewWidth = stripEl?.offsetWidth ?? 400
    const previewHeight = stripEl?.offsetHeight ?? 600
    const resOption = RESOLUTION_OPTIONS.find(r => r.value === exportResolution) ?? RESOLUTION_OPTIONS[1]
    const scaleFactor = resOption.multiplier

    try {
      const result = await exportPhotoboothFn({
        data: {
          images: validImages,
          templateId: selectedTemplate?.id ?? 'classic-2x2',
          stickers: stickers.map(s => ({
            id: s.id,
            x: s.x,
            y: s.y,
            type: s.type,
            emoji: s.emoji,
            src: s.src,
            scale: s.scale,
          })),
          exportType: exportType,
          previewWidth,
          previewHeight,
          scaleFactor,
          customFooterText: customFooterText || undefined,
          // Send filter state with export
          filterType: selectedFilter,
          filterIntensity: intensity,
        }
      })

      if (!result.success) {
        throw new Error("Export failed")
      }

      setExportedUrl(result.downloadUrl)
      toast.success("Photo ready! 🎉")
    } catch (error) {
      console.error('Export failed:', error)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setExportedUrl(null)
    onClose()
  }

  // Shared content for both mobile Sheet and desktop Dialog
  const renderContent = () => (
    <>
      {exportedUrl ? (
        /* Success Screen */
        <>
          {isDesktop ? (
            <DialogHeader className="p-0 pb-5">
              <DialogTitle className="text-lg font-bold">Ready to Save!</DialogTitle>
            </DialogHeader>
          ) : (
            <SheetHeader className="p-0 pb-5">
              <SheetTitle className="text-lg font-bold">Ready to Save!</SheetTitle>
            </SheetHeader>
          )}

          {/* Preview */}
          <div className="mb-5 rounded-xl overflow-hidden border border-border bg-muted/40 flex justify-center">
            <img 
              src={exportedUrl} 
              alt="Your exported photo" 
              className="max-w-full max-h-[45vh] w-auto h-auto object-contain"
            />
          </div>

          {/* Action Buttons */}
          {isDesktop ? (
            <DialogFooter className="flex-col gap-3 p-0 mt-0 sm:flex-col">
              <Button asChild className="w-full h-12 rounded-xl font-bold">
                <a
                  href={exportedUrl}
                  download={`ourbooth-${Date.now()}.${exportType === 'gif' ? 'gif' : 'png'}`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Save to Photos
                </a>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                <a
                  href={exportedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </a>
              </Button>

              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Done
              </Button>
            </DialogFooter>
          ) : (
            <SheetFooter className="flex-col gap-3 p-0 mt-0">
              <Button asChild className="w-full h-12 rounded-xl font-bold">
                <a
                  href={exportedUrl}
                  download={`ourbooth-${Date.now()}.${exportType === 'gif' ? 'gif' : 'png'}`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Save to Photos
                </a>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                <a
                  href={exportedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </a>
              </Button>

              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Done
              </Button>
            </SheetFooter>
          )}
        </>
      ) : (
        /* Export Settings */
        <>
          {isDesktop ? (
            <DialogHeader className="p-0 pb-5">
              <DialogTitle className="text-lg font-bold">Export Settings</DialogTitle>
            </DialogHeader>
          ) : (
            <SheetHeader className="p-0 pb-5">
              <SheetTitle className="text-lg font-bold">Export Settings</SheetTitle>
            </SheetHeader>
          )}

          {/* Format Selection */}
          <div className="space-y-2 mb-5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Format</label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setExportType('png')}
                className={`flex-1 h-12 rounded-lg transition-all ${
                  exportType === 'png' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <FileImage className="w-5 h-5 mr-2" />
                PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => setExportType('gif')}
                className={`flex-1 h-12 rounded-lg transition-all ${
                  exportType === 'gif' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <Film className="w-5 h-5 mr-2" />
                GIF
              </Button>
            </div>
          </div>

          {/* Resolution Selection */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Quality</label>
            <div className="flex gap-3">
              {RESOLUTION_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline"
                  onClick={() => setExportResolution(opt.value as ExportResolution)}
                  className={`flex-1 h-10 rounded-lg transition-all ${
                    exportResolution === opt.value 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          {isDesktop ? (
            <DialogFooter className="p-0 mt-0 sm:flex-col">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-12 font-bold rounded-xl"
              >
                {isExporting ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export {exportType.toUpperCase()}
                  </>
                )}
              </Button>
            </DialogFooter>
          ) : (
            <SheetFooter className="p-0 mt-0">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-12 font-bold rounded-xl"
              >
                {isExporting ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export {exportType.toUpperCase()}
                  </>
                )}
              </Button>
            </SheetFooter>
          )}
        </>
      )}
    </>
  )

  // Desktop: Centered Dialog with zoom animation
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
          {renderContent()}
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: Bottom Sheet with slide animation
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="bottom" 
        className="p-4 rounded-t-3xl max-h-[85vh]"
      >
        {renderContent()}
      </SheetContent>
    </Sheet>
  )
}
