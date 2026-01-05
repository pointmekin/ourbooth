import { useNavigate } from '@tanstack/react-router'
import { FileImage, Film, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { exportPhotoboothFn } from '@/server/export'
import { usePhotoboothStore } from '@/stores/photobooth-store'
import { ExportConfirmDialog } from './ExportConfirmDialog'

export function PhotoboothHeader() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  
  const { images, stickers, selectedTemplate, exportType, setExportType } = usePhotoboothStore()
  
  const [isExporting, setIsExporting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleExportClick = () => {
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

    setShowConfirmDialog(true)
  }

  const handleExportConfirm = async () => {
    setShowConfirmDialog(false)
    setIsExporting(true)

    const validImages = images.filter(Boolean) as string[]

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
        }
      })

      if (!result.success) {
        throw new Error("Export failed (Unknown error)")
      }

      // Download using fetch + Blob for cross-browser compatibility
      try {
        const response = await fetch(result.downloadUrl)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.download = `ourbooth-${Date.now()}.png`
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      } catch (downloadErr) {
        console.error("Download failed, falling back to window.open:", downloadErr)
        window.open(result.downloadUrl, '_blank')
      }
      
      authClient.getSession()
      toast.success("Export successful! Photo saved to your gallery.")

    } catch (err: any) {
      console.error("Export Process Failed:", err)
      toast.error(`Export Failed: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  // @ts-ignore
  const credits = session?.user?.credits as number ?? 0

  return (
    <>
      <header 
        className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-neutral-950/80 backdrop-blur-md z-50 cursor-default"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <h1 className="text-xl font-bold tracking-tighter bg-linear-to-br from-white to-white/50 bg-clip-text text-transparent">
          OURBOOTH
        </h1>
        <div className="flex gap-2 md:gap-4">
          <button className="hidden md:block px-5 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            Preview
          </button>
          
          <div className="flex bg-neutral-900 rounded-full p-1 border border-white/10">
            <button 
              onClick={() => setExportType('png')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${exportType === 'png' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
            >
              <FileImage className="w-3 h-3" />
              PNG
            </button>
            <button 
              onClick={() => setExportType('gif')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${exportType === 'gif' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
            >
              <Film className="w-3 h-3" />
              GIF
            </button>
          </div>

          <button 
            type="button"
            onClick={handleExportClick}
            disabled={isExporting}
            className="px-4 md:px-6 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:bg-rose-900 disabled:opacity-50 text-white text-xs md:text-sm font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)] transition-all cursor-pointer flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              session ? `Export ${exportType.toUpperCase()} (1 Credit)` : 'Sign in'
            )}
          </button>
        </div>
      </header>

      <ExportConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        credits={credits}
        onConfirm={handleExportConfirm}
        isExporting={isExporting}
      />
    </>
  )
}
