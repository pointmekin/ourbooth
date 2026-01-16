import { useState } from 'react'
import { Download, FileImage, Film, Sparkles, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { exportPhotoboothFn } from '@/server/export'
import { usePhotoboothStore, RESOLUTION_OPTIONS, type ExportResolution } from '@/stores/photobooth-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface ExportSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportSheet({ isOpen, onClose }: ExportSheetProps) {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="bottom" 
        className="bg-neutral-950 border-white/10 text-white rounded-t-3xl max-h-[85vh] md:max-h-[90vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-100 md:rounded-2xl md:border"
      >
        {exportedUrl ? (
          /* Success Screen */
          <>
            <SheetHeader className="p-0 pb-4">
              <SheetTitle className="text-lg font-bold text-white">Ready to Save!</SheetTitle>
            </SheetHeader>

            {/* Preview */}
            <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex justify-center">
              <img 
                src={exportedUrl} 
                alt="Your exported photo" 
                className="max-w-full max-h-[45vh] w-auto h-auto object-contain"
              />
            </div>

            {/* Action Buttons */}
            <SheetFooter className="flex-col gap-3 p-0 mt-0">
              <Button asChild className="w-full bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl h-12">
                <a
                  href={exportedUrl}
                  download={`ourbooth-${Date.now()}.${exportType === 'gif' ? 'gif' : 'png'}`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Save to Photos
                </a>
              </Button>
              
              <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/5 rounded-xl h-11">
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
                className="w-full text-neutral-400 hover:text-white"
              >
                Done
              </Button>
            </SheetFooter>
          </>
        ) : (
          /* Export Settings */
          <>
            <SheetHeader className="p-0 pb-4">
              <SheetTitle className="text-lg font-bold text-white">Export Settings</SheetTitle>
            </SheetHeader>

            {/* Format Selection */}
            <div className="mb-5">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">Format</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setExportType('png')}
                  className={`flex-1 h-12 rounded-lg transition-all ${
                    exportType === 'png' 
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400' 
                      : 'border-white/10 hover:border-white/20 text-neutral-400'
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
                      ? 'border-rose-500 bg-rose-500/10 text-rose-400' 
                      : 'border-white/10 hover:border-white/20 text-neutral-400'
                  }`}
                >
                  <Film className="w-5 h-5 mr-2" />
                  GIF
                </Button>
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="mb-6">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">Quality</label>
              <div className="flex gap-2">
                {RESOLUTION_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant="outline"
                    onClick={() => setExportResolution(opt.value as ExportResolution)}
                    className={`flex-1 h-10 rounded-lg transition-all ${
                      exportResolution === opt.value 
                        ? 'border-rose-500 bg-rose-500/10 text-rose-400' 
                        : 'border-white/10 hover:border-white/20 text-neutral-400'
                    }`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <SheetFooter className="p-0 mt-0">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-12 bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(225,29,72,0.5)]"
              >
                {isExporting ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Creating magic...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export {exportType.toUpperCase()}
                  </>
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
