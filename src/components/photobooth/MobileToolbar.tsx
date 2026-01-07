import { Upload, Sparkles, Download, Camera } from 'lucide-react'

interface MobileToolbarProps {
  captureMode: 'upload' | 'camera'
  onCaptureModeChange: (mode: 'upload' | 'camera') => void
  onStickersToggle: () => void
  onExportToggle: () => void
}

export function MobileToolbar({ 
  captureMode, 
  onCaptureModeChange, 
  onStickersToggle,
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
        <button
          onClick={handleModeToggle}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
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
        </button>

        {/* Decorate Button */}
        <button
          onClick={onStickersToggle}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider">Decorate</span>
        </button>

        {/* Export Button - Prominent */}
        <button
          onClick={onExportToggle}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)]">
            <Download className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-rose-400">Export</span>
        </button>
      </div>
    </div>
  )
}
