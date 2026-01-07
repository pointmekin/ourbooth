import { useState } from 'react'
import { X, Download, FileImage, Film, Sparkles, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { exportPhotoboothFn } from '@/server/export'
import { usePhotoboothStore, RESOLUTION_OPTIONS, type ExportResolution } from '@/stores/photobooth-store'

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

      // Show success screen with download link (works better on mobile)
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      
      {/* Sheet - Bottom on mobile, centered modal on desktop */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center pointer-events-none">
        <div className="pointer-events-auto w-full md:w-[400px] bg-neutral-950 border border-white/10 rounded-t-3xl md:rounded-2xl p-6 pb-10 md:pb-6 safe-area-inset-bottom max-h-[85vh] overflow-y-auto md:max-h-[90vh] animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
          {/* Handle - mobile only */}
          <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto mb-4 md:hidden" />
          
          {exportedUrl ? (
            /* Success Screen */
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Ready to Save!</h2>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex justify-center bg-black/40">
                <img 
                  src={exportedUrl} 
                  alt="Your exported photo" 
                  className="max-w-full max-h-[45vh] w-auto h-auto object-contain"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={exportedUrl}
                  download={`ourbooth-${Date.now()}.${exportType === 'gif' ? 'gif' : 'png'}`}
                  className="w-full py-3.5 bg-linear-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(225,29,72,0.5)] flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Save to Photos</span>
                </a>
                
                <a
                  href={exportedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-white/20 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </a>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-neutral-400 text-sm hover:text-white transition-colors"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            /* Export Settings */
            <>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Export Settings</h2>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Format Selection */}
              <div className="mb-5">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">Format</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportType('png')}
                    className={`flex-1 py-3 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      exportType === 'png' 
                        ? 'border-rose-500 bg-rose-500/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <FileImage className={`w-5 h-5 ${exportType === 'png' ? 'text-rose-400' : 'text-neutral-400'}`} />
                    <span className={`text-sm font-semibold ${exportType === 'png' ? 'text-rose-400' : 'text-neutral-400'}`}>PNG</span>
                  </button>
                  <button
                    onClick={() => setExportType('gif')}
                    className={`flex-1 py-3 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      exportType === 'gif' 
                        ? 'border-rose-500 bg-rose-500/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Film className={`w-5 h-5 ${exportType === 'gif' ? 'text-rose-400' : 'text-neutral-400'}`} />
                    <span className={`text-sm font-semibold ${exportType === 'gif' ? 'text-rose-400' : 'text-neutral-400'}`}>GIF</span>
                  </button>
                </div>
              </div>

              {/* Resolution Selection */}
              <div className="mb-6">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">Quality</label>
                <div className="flex gap-2">
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setExportResolution(opt.value as ExportResolution)}
                      className={`flex-1 py-2.5 px-2 rounded-lg border transition-all text-center ${
                        exportResolution === opt.value 
                          ? 'border-rose-500 bg-rose-500/10 text-rose-400' 
                          : 'border-white/10 hover:border-white/20 text-neutral-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3.5 bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Creating magic...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export {exportType.toUpperCase()}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
