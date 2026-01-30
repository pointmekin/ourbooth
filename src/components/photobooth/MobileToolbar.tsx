import { Upload, Sparkles, Download, Camera, Wand2, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileToolbarProps {
  captureMode: 'upload' | 'camera'
  onCaptureModeChange: (mode: 'upload' | 'camera') => void
  activeTool?: 'stickers' | 'filters' | 'properties' | null
  onToolChange?: (tool: 'stickers' | 'filters' | 'properties' | null) => void
  onExportToggle: () => void
}

export function MobileToolbar({
  captureMode,
  onCaptureModeChange,
  activeTool,
  onToolChange,
  onExportToggle
}: MobileToolbarProps) {
  
  // Toggle between upload and camera modes
  const handleModeToggle = () => {
    onCaptureModeChange(captureMode === 'upload' ? 'camera' : 'upload')
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-3 px-6">
        {/* Capture Mode Toggle */}
        <Button
          variant="ghost"
          onClick={handleModeToggle}
          className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-neutral-400 hover:text-white hover:bg-transparent"
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            {captureMode === 'upload' ? (
              <Upload className="w-5 h-5" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider">
            {captureMode === 'upload' ? 'Upload' : 'Camera'}
          </span>
        </Button>

        {/* Decorate Button */}
        <Button
          variant="ghost"
          onClick={() => onToolChange?.(activeTool === 'stickers' ? null : 'stickers')}
          className={`flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-transparent ${
            activeTool === 'stickers' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTool === 'stickers' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Decorate</span>
        </Button>

        {/* Filters Button */}
        <Button
          variant="ghost"
          onClick={() => onToolChange?.(activeTool === 'filters' ? null : 'filters')}
          className={`flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-transparent ${
            activeTool === 'filters' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTool === 'filters' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            <Wand2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Filters</span>
        </Button>

        {/* Properties Button */}
        <Button
          variant="ghost"
          onClick={() => onToolChange?.(activeTool === 'properties' ? null : 'properties')}
          className={`flex flex-col items-center gap-1 h-auto py-2 px-4 hover:bg-transparent ${
            activeTool === 'properties' ? 'text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            activeTool === 'properties' ? 'bg-white/20' : 'bg-white/5'
          }`}>
            <Settings2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Props</span>
        </Button>

        {/* Export Button - Prominent */}
        <Button
          onClick={onExportToggle}
          className="flex flex-col items-center gap-1 h-auto py-1 px-4 bg-transparent hover:bg-transparent"
        >
          <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)]">
            <Download className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-rose-400">Export</span>
        </Button>
      </div>
    </div>
  )
}
