import { useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Timer, X, RefreshCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePhotoboothStore } from '@/stores/photobooth-store'

type SessionState = 'idle' | 'countdown' | 'capturing' | 'reviewing'

interface CameraViewProps {
  onClose: () => void
}

export function CameraView({ onClose }: CameraViewProps) {
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [countdown, setCountdown] = useState(0)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { setImages } = usePhotoboothStore()

  const startCamera = async () => {
    if (streamRef.current?.active) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Camera error:", err)
      toast.error("Could not access camera. Please check permissions.")
      onClose()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    if (sessionState !== 'reviewing') {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [sessionState])

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const startSession = async () => {
    setCapturedPhotos([])
    setSessionState('countdown')
    
    for (let shot = 0; shot < 4; shot++) {
      for (let i = 3; i > 0; i--) {
        setCountdown(i)
        await delay(1000)
      }
      
      setSessionState('capturing')
      const photo = captureFrame()
      if (photo) {
        setCapturedPhotos(prev => [...prev, photo])
      }
      
      await delay(200)
      if (shot < 3) {
        setSessionState('countdown')
      }
    }
    
    setSessionState('reviewing')
    stopCamera()
  }

  const handleUsePhotos = () => {
    const selected = capturedPhotos.filter((_, i) => selectedPhotos.has(i))
    if (selected.length === 0) {
      toast.error("Select at least one photo!")
      return
    }

    const newImages: (string | null)[] = Array(4).fill(null)
    selected.slice(0, 4).forEach((photo, i) => {
      newImages[i] = photo
    })
    setImages(newImages)
    onClose()
  }

  const togglePhotoSelection = (index: number) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      if (newSelected.size < 4) {
        newSelected.add(index)
      } else {
        toast.error("Maximum 4 photos allowed")
      }
    }
    setSelectedPhotos(newSelected)
  }

  if (sessionState === 'reviewing') {
    return (
      <div className="w-full max-w-4xl bg-neutral-900/50 backdrop-blur-3xl p-4 md:p-8 rounded-3xl border border-white/10 shadow-3xl animate-in fade-in slide-in-from-bottom-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Session Complete!</h2>
            <p className="text-neutral-400 text-sm">Select the best 4 photos to add to your strip.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={() => {
                setSessionState('idle')
                startCamera()
              }}
              className="rounded-full border-white/10 hover:bg-white/5 text-white"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button 
              onClick={handleUsePhotos}
              disabled={selectedPhotos.size === 0}
              className="bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold px-6"
            >
              <Check className="w-4 h-4 mr-2" />
              Use Selected ({selectedPhotos.size}/4)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {capturedPhotos.map((photo, i) => (
            <div 
              key={i}
              onClick={() => togglePhotoSelection(i)}
              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${selectedPhotos.has(i) ? 'border-rose-500 scale-[0.98] shadow-[0_0_20px_rgba(225,29,72,0.3)]' : 'border-transparent hover:border-white/20'}`}
            >
              <img src={photo} alt={`Captured ${i}`} className="w-full h-full object-cover" />
              {selectedPhotos.has(i) && (
                <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                  <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg">
                    <Check className="w-6 h-6" />
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl max-h-[50dvh] md:max-h-none aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover scale-x-[-1]"
      />
      
      {sessionState === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:bg-black/20 transition-all">
          <Button 
            onClick={startSession}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Timer className="w-6 h-6" />
            Start Session
          </Button>
        </div>
      )}

      {sessionState === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-[12rem] font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-in zoom-in duration-300">
            {countdown}
          </div>
        </div>
      )}

      {sessionState === 'capturing' && (
        <div className="absolute inset-0 bg-white animate-out fade-out duration-200" />
      )}

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
          <div className="flex gap-1">
            {[0,1,2,3].map(i => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${i < capturedPhotos.length ? 'bg-rose-500' : 'bg-white/20'}`} 
              />
            ))}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            {capturedPhotos.length} / 4 Photos
          </span>
        </div>
        
        {sessionState !== 'idle' && (
          <button 
            onClick={() => {
              stopCamera()
              setSessionState('idle')
            }}
            className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
