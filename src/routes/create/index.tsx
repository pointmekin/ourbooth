import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { usePhotoboothStore } from '@/stores/photobooth-store'
import { type Template } from '@/data/templates'
import {
  PhotoboothHeader,
  PhotoStrip,
  CameraView,
  PropertiesPanel,
  ToolSidebar,
  MobileToolbar,
  TemplateGallery,
  ExportSheet,
} from '@/components/photobooth'

export const Route = createFileRoute('/create/')({
  component: PhotoboothEditor,
})

function PhotoboothEditor() {
  const { selectedTemplate, setTemplate, setImage } = usePhotoboothStore()
  
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  // Template selection handler
  const handleTemplateSelect = (template: Template) => {
    setTemplate(template)
  }

  // File upload handler
  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(index, e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCaptureModeChange = (mode: 'upload' | 'camera') => {
    setCaptureMode(mode)
  }

  // Show template gallery if no template selected
  if (!selectedTemplate) {
    return <TemplateGallery onSelect={handleTemplateSelect} />
  }

  // Show editor after template is selected
  return (
    <div className="h-dvh bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30 flex overflow-hidden">
      {/* Left Sidebar - Desktop */}
      <ToolSidebar
        captureMode={captureMode}
        onCaptureModeChange={handleCaptureModeChange}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <PhotoboothHeader onExportClick={() => setIsExportOpen(true)} />

        {/* Workspace */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 pb-24 md:pb-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 overflow-auto">
          {captureMode === 'camera' ? (
            <CameraView onClose={() => setCaptureMode('upload')} />
          ) : (
            <PhotoStrip onFileUpload={handleFileUpload} />
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
        onExportToggle={() => setIsExportOpen(true)}
      />

      {/* Export Sheet */}
      <ExportSheet
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  )
}

