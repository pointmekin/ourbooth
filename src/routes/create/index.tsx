import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { usePhotoboothStore } from '@/stores/photobooth-store'
import { type Template } from '@/data/templates'
import { AppHeader } from '@/components/AppHeader'
import { Toggle } from '@/components/ui/toggle'
import { Maximize2, Move } from 'lucide-react'
import {
  PhotoStrip,
  CameraView,
  PropertiesPanel,
  ToolSidebar,
  MobileToolbar,
  TemplateGallery,
  ExportSheet,
  FilterPreviewPanel,
} from '@/components/photobooth'

import { Photobooth3DExperience } from '@/components/3d/Experience'

export const Route = createFileRoute('/create/')({
  component: PhotoboothEditor,
})

type ViewMode = 'fit' | 'scroll'

function PhotoboothEditor() {
  const { selectedTemplate, setTemplate, setImage } = usePhotoboothStore()
  
  const [hasStarted, setHasStarted] = useState(false)
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [activeTool, setActiveTool] = useState<'stickers' | 'filters' | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('fit')
  // Unique key to force 3D experience remount on browser navigation
  const [experienceKey, setExperienceKey] = useState(() => Date.now())

  // Reset to 3D experience when component mounts (handles browser back/forward)
  useEffect(() => {
    setHasStarted(false)
    setExperienceKey(Date.now()) // Force fresh 3D canvas
  }, [])

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

  // 1. Show 3D Experience first
  if (!hasStarted) {
    return <Photobooth3DExperience key={experienceKey} onComplete={() => setHasStarted(true)} />
  }

  // 2. Show template gallery if no template selected (and started)
  if (!selectedTemplate) {
    return <TemplateGallery onSelect={handleTemplateSelect} />
  }

  // Show editor after template is selected
  return (
    <div className="h-dvh bg-background font-sans selection:bg-rose-500/30 flex overflow-hidden">
      {/* Left Sidebar - Desktop */}
      <ToolSidebar
        captureMode={captureMode}
        onCaptureModeChange={handleCaptureModeChange}
        activeTool={activeTool}
        onToolChange={setActiveTool}
      />

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AppHeader 
          showExport
          onExportClick={() => setIsExportOpen(true)} 
          showBackToTemplates
          onBackToTemplates={() => setTemplate(null)}
        />

        {/* Workspace */}
        <div 
          className={`flex-1 flex items-center justify-center p-4 md:p-10 pb-24 md:pb-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-muted via-background to-background ${
            viewMode === 'scroll' ? 'overflow-auto' : 'overflow-hidden'
          }`}
        >
          {captureMode === 'camera' ? (
            <CameraView onClose={() => setCaptureMode('upload')} />
          ) : (
            <PhotoStrip onFileUpload={handleFileUpload} viewMode={viewMode} />
          )}
        </div>

        {/* View Mode Toggle - Floating */}
        {captureMode === 'upload' && (
          <div className="absolute bottom-28 md:bottom-6 right-4 md:right-6 z-10">
            <div className="flex bg-secondary/90 backdrop-blur-md rounded-full border border-border p-1">
              <Toggle
                pressed={viewMode === 'fit'}
                onPressedChange={() => setViewMode('fit')}
                size="sm"
                className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                title="Fit to screen"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden md:inline ml-1 text-xs">Fit</span>
              </Toggle>
              <Toggle
                pressed={viewMode === 'scroll'}
                onPressedChange={() => setViewMode('scroll')}
                size="sm"
                className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                title="Scroll view"
              >
                <Move className="w-4 h-4" />
                <span className="hidden md:inline ml-1 text-xs">Scroll</span>
              </Toggle>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Properties */}
      <PropertiesPanel
        isOpen={activeTool === 'stickers'}
        onClose={() => setActiveTool(null)}
      />

      {/* Filter Panel */}
      <FilterPreviewPanel
        isOpen={activeTool === 'filters'}
        onClose={() => setActiveTool(null)}
      />

      {/* Mobile Bottom Toolbar */}
      <MobileToolbar
        captureMode={captureMode}
        onCaptureModeChange={handleCaptureModeChange}
        activeTool={activeTool}
        onToolChange={setActiveTool}
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

