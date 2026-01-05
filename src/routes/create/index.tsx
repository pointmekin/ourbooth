import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { usePhotoboothStore } from '@/stores/photobooth-store'
import {
  PhotoboothHeader,
  PhotoStrip,
  CameraView,
  PropertiesPanel,
  ToolSidebar,
  MobileToolbar,
} from '@/components/photobooth'

export const Route = createFileRoute('/create/')({
  component: PhotoboothEditor,
})

function PhotoboothEditor() {
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false)
  const [draggingStickerId, setDraggingStickerId] = useState<number | null>(null)

  const { setImage, updateStickerPosition } = usePhotoboothStore()

  // File upload handler
  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(index, e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Sticker drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.stopPropagation()
    setDraggingStickerId(id)
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!draggingStickerId) return

    // Get the strip element for bounds calculation
    const stripEl = document.querySelector('[data-photobooth-strip]') as HTMLElement
    if (!stripEl) return

    const rect = stripEl.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))

    updateStickerPosition(draggingStickerId, x, y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingStickerId) {
      e.preventDefault()
      const touch = e.touches[0]
      handleDragMove(touch.clientX, touch.clientY)
    }
  }

  const handleDragEnd = () => {
    setDraggingStickerId(null)
  }

  const handleCaptureModeChange = (mode: 'upload' | 'camera') => {
    setCaptureMode(mode)
  }

  return (
    <div 
      className="h-dvh bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30 flex overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Left Sidebar - Desktop */}
      <ToolSidebar
        captureMode={captureMode}
        onCaptureModeChange={handleCaptureModeChange}
        isPropertiesOpen={isPropertiesOpen}
        onPropertiesToggle={() => setIsPropertiesOpen(!isPropertiesOpen)}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <PhotoboothHeader />

        {/* Workspace */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 pb-20 md:pb-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 overflow-auto">
          {captureMode === 'camera' ? (
            <CameraView onClose={() => setCaptureMode('upload')} />
          ) : (
            <PhotoStrip
              draggingStickerId={draggingStickerId}
              onDragStart={handleDragStart}
              onFileUpload={handleFileUpload}
            />
          )}
        </div>
      </main>

      {/* Right Sidebar - Properties */}
      <PropertiesPanel
        isOpen={isPropertiesOpen}
        onClose={() => setIsPropertiesOpen(false)}
      />

      {/* Mobile Bottom Toolbar */}
      <MobileToolbar
        captureMode={captureMode}
        onCaptureModeChange={handleCaptureModeChange}
        onStickersToggle={() => setIsPropertiesOpen(!isPropertiesOpen)}
      />
    </div>
  )
}
