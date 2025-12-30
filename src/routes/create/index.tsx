import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { authClient } from '@/lib/auth-client'
import { LayoutGrid, Upload, Smile, Wand2, LucideIcon, LogIn, LogOut, Camera, Timer, RefreshCcw, Check, X, FileImage, Film } from 'lucide-react'
import { deductCreditFn } from '@/server/export'
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import { generateGif } from '@/lib/gif-generator'

export const Route = createFileRoute('/create/')({
  component: PhotoboothEditor,
})

const LAYOUTS = {
  '2x2': { cols: 2, rows: 2, count: 4, aspect: 'aspect-[2/3]' },
  '1x4': { cols: 1, rows: 4, count: 4, aspect: 'aspect-[1/4]' },
  '1x3': { cols: 1, rows: 3, count: 3, aspect: 'aspect-[1/3]' },
}

function PhotoboothEditor() {
  const [selectedLayout, setSelectedLayout] = useState<keyof typeof LAYOUTS>('2x2')
  const [images, setImages] = useState<(string | null)[]>(Array(4).fill(null))
  const [stickers, setStickers] = useState<{id: number, x: number, y: number, emoji: string}[]>([])
  const [draggingStickerId, setDraggingStickerId] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false) // Mobile drawer state
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload')
  const [sessionState, setSessionState] = useState<'idle' | 'countdown' | 'capturing' | 'reviewing'>('idle')
  const [countdown, setCountdown] = useState<number>(0)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())
  const [exportType, setExportType] = useState<'png' | 'gif'>('png')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        const newImages = [...images]
        newImages[index] = e.target?.result as string
        setImages(newImages)
    }
    reader.readAsDataURL(file)
  }

  // Camera Logic
  const startCamera = async () => {
    if (streamRef.current && streamRef.current.active) {
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
        setCaptureMode('upload')
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
    // Keep camera active throughout the capture process (idle, countdown, capturing)
    if (captureMode === 'camera' && sessionState !== 'reviewing') {
        startCamera()
    } else {
        stopCamera()
    }
    
    return () => {
        // Only stop camera if we're actually leaving camera mode or have finished
        // We avoid stopping on every countdown tick/state change
    }
  }, [captureMode, sessionState])

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Mirror if using front camera
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const startSession = async () => {
    if (!session) {
        toast.error("Please sign in to use the photobooth!")
        navigate({ to: '/auth/signin' })
        return
    }

    setCapturedPhotos([])
    setSessionState('countdown')
    
    for (let shot = 0; shot < 4; shot++) {
        // Countdown
        for (let i = 3; i > 0; i--) {
            setCountdown(i)
            await delay(1000)
        }
        
        setSessionState('capturing')
        const photo = captureFrame()
        if (photo) {
            setCapturedPhotos(prev => [...prev, photo])
        }
        
        // Flash effect
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

    const newImages = [...images]
    selected.slice(0, 4).forEach((photo, i) => {
        newImages[i] = photo
    })
    setImages(newImages)
    setSessionState('idle')
    setCaptureMode('upload') // Switch back after populating
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

  const addSticker = (emoji: string, x = 50, y = 50) => {
      setStickers([...stickers, { id: Date.now(), x, y, emoji }])
      toast(
         <div className="flex items-center gap-2">
             <span className="text-xl">{emoji}</span>
             <span className="font-semibold text-sm">Added to canvas!</span>
         </div>
      )
  }

  const handleDragStartFromSidebar = (e: React.DragEvent, emoji: string) => {
      e.dataTransfer.setData('emoji', emoji)
  }

  const handleDropIntoCanvas = (e: React.DragEvent) => {
      e.preventDefault()
      if (!stripRef.current) return

      const emoji = e.dataTransfer.getData('emoji')
      if (!emoji) return

      const rect = stripRef.current.getBoundingClientRect()
      
      const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
      const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))

      addSticker(emoji, x, y)
  }

  // Unified Drag Logic
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
      e.stopPropagation()
      // e.preventDefault() // prevent scrolling on touch - be careful with this
      setDraggingStickerId(id)
  }

  const handleDragMove = (clientX: number, clientY: number) => {
      if (!draggingStickerId || !stripRef.current) return

      const rect = stripRef.current.getBoundingClientRect()
      
      const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
      const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))

      setStickers(stickers.map(s => 
          s.id === draggingStickerId ? { ...s, x, y } : s
      ))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
      handleDragMove(e.clientX, e.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
      if (draggingStickerId) {
          e.preventDefault() // Prevent scrolling while dragging
          const touch = e.touches[0]
          handleDragMove(touch.clientX, touch.clientY)
      }
  }

  const handleDragEnd = () => {
      setDraggingStickerId(null)
  }

  const handleAuthAction = async () => {
      if (session) {
          await authClient.signOut()
          window.location.reload()
      } else {
          navigate({ to: '/auth/signin' })
      }
  }

  const handleExport = async () => {
      if (!session) {
          alert("Please sign in to export your masterpiece!")
          navigate({ to: '/auth/signin' })
          return
      }

      if (!stripRef.current && exportType === 'png') return

      // @ts-ignore
      const currentCredits = session.user.credits as number
      
      const confirmExport = confirm(`Exporting will cost 1 Credit. You have ${currentCredits} credits. Proceed?`)
      if (!confirmExport) return

      setIsExporting(true)

      try {
          let dataUrlOrBlob: string | Blob
          let filename: string

          if (exportType === 'gif') {
              console.log("Generating GIF...")
              const validImages = images.filter(Boolean) as string[]
              if (validImages.length === 0) {
                  throw new Error("No images to generate GIF. Please add some photos!")
              }
              
              dataUrlOrBlob = await generateGif(validImages, {
                  width: selectedLayout === '1x4' ? 200 : 400,
                  height: selectedLayout === '1x4' ? 800 : 600,
                  delay: 500
              })
              filename = `ourbooth-${Date.now()}.gif`
          } else {
              // Existing PNG Logic
              if (!stripRef.current) throw new Error("Canvas not found")
              
              // 1. Wait for UI to update (hide watermarks etc)
              await new Promise(resolve => setTimeout(resolve, 300))

              const node = stripRef.current
              
              // Wait for all images to fully decode
              const imgs = node.querySelectorAll('img')
              await Promise.all(
                  Array.from(imgs).map(img => {
                      if (img.complete) {
                          return img.decode().catch(() => {})
                      }
                      return new Promise(resolve => {
                          img.onload = () => img.decode().then(resolve).catch(resolve)
                          img.onerror = resolve
                      })
                  })
              )
              
              await new Promise(resolve => setTimeout(resolve, 200))
              
              const exportOptions = {
                  cacheBust: true,
                  pixelRatio: 2,
                  backgroundColor: '#ffffff',
                  canvasFilter: 'none',
                  skipFonts: true,
              }
              
              await toPng(node, exportOptions).catch(() => {})
              await new Promise(resolve => setTimeout(resolve, 100))
              
              const dataUrl = await toPng(node, exportOptions).catch(e => {
                  throw new Error(`Image generation failed: ${e.message}`)
              })

              if (!dataUrl || dataUrl.length < 100) {
                  throw new Error("Generated image is empty or invalid.")
              }
              
              dataUrlOrBlob = dataUrl
              filename = `ourbooth-${Date.now()}.png`
          }

          // 2. Deduct Credit
          console.log("Deducting credit...")
          const result = await deductCreditFn().catch(e => {
              throw new Error(`Server deduction failed: ${e.message}`)
          })

          if (!result.success) {
              throw new Error("Credit deduction failed (Unknown error)")
          }

          // 3. Download
          console.log("Downloading...")
          const link = document.createElement('a')
          link.download = filename
          link.href = typeof dataUrlOrBlob === 'string' ? dataUrlOrBlob : URL.createObjectURL(dataUrlOrBlob)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          if (typeof dataUrlOrBlob !== 'string') URL.revokeObjectURL(link.href)
          
          authClient.getSession() // Refresh UI credits
          toast.success("Export successful!")

      } catch (err: any) {
          console.error("Export Process Failed:", err)
          alert(`Export Failed: ${err.message}`)
      } finally {
          setIsExporting(false)
      }
  }

  const currentLayout = LAYOUTS[selectedLayout]

  return (
    <div 
        className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-500/30 flex overflow-hidden fixed inset-0" // fixed inset-0 prevents body scroll
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
    >
      {/* LEFT SIDEBAR - TOOLS */}
      <aside className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-6 z-30 bg-neutral-950/80 backdrop-blur-xl">
        <ToolIcon label="Menu" icon={LayoutGrid} active={isPropertiesOpen} onClick={() => setIsPropertiesOpen(!isPropertiesOpen)} />
        {/* Only show other icons if space permits or for specific actions */}
        <div className="hidden md:flex space-y-6 w-full flex-col items-center">
            <ToolIcon 
                label="Upload Mode" 
                icon={Upload} 
                active={captureMode === 'upload'} 
                onClick={() => {
                    setCaptureMode('upload')
                    setSessionState('idle')
                }} 
            />
            <ToolIcon 
                label="Camera Mode" 
                icon={Camera} 
                active={captureMode === 'camera'} 
                onClick={() => {
                    setCaptureMode('camera')
                    setSessionState('idle')
                }} 
            />
            <ToolIcon label="Stickers" icon={Smile} />
            <ToolIcon label="Filters" icon={Wand2} />
        </div>
        
        <div className="flex-1" />
        
        {session && (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 mb-2">
                 {session.user.image ? (
                     <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" />
                 ) : (
                     <div className="w-full h-full bg-rose-500 flex items-center justify-center font-bold text-xs">
                         {session.user.name?.charAt(0).toUpperCase()}
                     </div>
                 )}
            </div>
        )}
        
        <ToolIcon 
            label={session ? "Sign Out" : "Sign In"} 
            icon={session ? LogOut : LogIn} 
            onClick={handleAuthAction}
            className={session ? "hover:bg-red-500/20 hover:text-red-500" : ""}
        />
        <div className="h-4" />
      </aside>

      {/* MAIN CANVAS AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-neutral-950/80 backdrop-blur-md z-50 cursor-default">
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
               <Button 
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                onTouchEnd={(e) => {
                    e.stopPropagation()
                }}
                className="px-4 md:px-6 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:bg-rose-900 disabled:opacity-50 text-white text-xs md:text-sm font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)] transition-all cursor-pointer flex items-center gap-2"
                style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                }}
               >
                   {isExporting ? (
                       <>
                           <RefreshCcw className="w-4 h-4 animate-spin" />
                           Exporting...
                       </>
                   ) : (
                       session ? `Export ${exportType.toUpperCase()} (1 Credit)` : 'Sign in'
                   )}
               </Button>
            </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 overflow-auto">
            {captureMode === 'camera' && sessionState !== 'reviewing' ? (
                <div className="relative w-full max-w-2xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    
                    {/* Visual Overlays */}
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

                    {/* Info Overlay */}
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
                </div>
            ) : captureMode === 'camera' && sessionState === 'reviewing' ? (
                <div className="w-full max-w-4xl bg-neutral-900/50 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-3xl animate-in fade-in slide-in-from-bottom-5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Session Compete!</h2>
                            <p className="text-neutral-400 text-sm">Select the best 4 photos to add to your strip.</p>
                        </div>
                        <div className="flex gap-3">
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
                </div>
            ) : (
                /* Static Strip View (Existing) */
                <div 
                    className="flex items-center justify-center transition-transform duration-500"
                    style={{ 
                        transform: `scale(${typeof window !== 'undefined' && window.innerWidth < 768 ? (selectedLayout === '1x4' ? 0.5 : 0.6) : 1})`,
                        transformOrigin: 'center'
                    }}
                >
                    <div 
                        ref={stripRef}
                        className="flex flex-col relative group select-none shadow-2xl"
                        style={{ 
                            height: selectedLayout === '1x4' ? '800px' : '600px', 
                            width: selectedLayout === '1x4' ? '200px' : '400px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropIntoCanvas}
                    >
                        {!isExporting && (
                            <>
                                <div className="absolute inset-0 z-30 pointer-events-none opacity-30 flex items-center justify-center overflow-hidden">
                                    <div 
                                        className="-rotate-45 text-6xl font-bold whitespace-nowrap tracking-widest p-4"
                                        style={{ 
                                            color: 'rgba(0,0,0,0.1)', 
                                            border: '4px solid rgba(0,0,0,0.1)' 
                                        }}
                                    >
                                        PREVIEW • OURBOOTH
                                    </div>
                                </div>
                                <div className="absolute -inset-4 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </>
                        )}
                        
                        <div 
                            className="flex-1 min-h-0 grid gap-2.5 p-4 box-border relative z-0"
                            style={{ 
                                gridTemplateColumns: `repeat(${currentLayout.cols}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${currentLayout.rows}, minmax(0, 1fr))`
                            }}
                        >
                            {Array.from({ length: currentLayout.count }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-full h-full relative overflow-hidden ${!isExporting ? 'group/slot cursor-pointer transition-colors' : ''}`}
                                    style={{ backgroundColor: images[i] ? 'transparent' : '#f5f5f5' }}
                                >
                                    {!isExporting && (
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(i, e.target.files[0])}
                                        />
                                    )}
                                    
                                    {images[i] ? (
                                        <img 
                                            src={images[i]!} 
                                            alt={`Slot ${i}`} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`absolute inset-0 flex items-center justify-center ${!isExporting ? 'group-hover/slot:text-neutral-400 transition-colors' : ''}`}>
                                            <span className="text-4xl font-light" style={{ color: '#d4d4d4' }}>+</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {stickers.map(s => (
                                <div 
                                    key={s.id} 
                                    onMouseDown={(e) => handleDragStart(e, s.id)}
                                    onTouchStart={(e) => handleDragStart(e, s.id)}
                                    className="absolute text-4xl z-40 drop-shadow-md select-none touch-none"
                                    style={{ 
                                        left: `${s.x}%`, 
                                        top: `${s.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        cursor: draggingStickerId === s.id ? 'grabbing' : 'grab',
                                        fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol' 
                                    }}
                                >
                                    {s.emoji}
                                </div>
                            ))}
                        </div>

                        <div 
                            className="h-16 flex items-center justify-center relative z-10"
                            style={{ 
                                borderTop: '1px solid #f5f5f5', 
                                backgroundColor: '#ffffff'
                            }}
                        >
                            <span 
                                className="font-mono text-xs tracking-[0.2em] uppercase"
                                style={{ color: '#a3a3a3' }}
                            >
                                OurBooth • 2025
                            </span>
                        </div>
                    </div>
                </div>
            )}
            {/* Helper canvas for capture (hidden) */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
      </main>

      {/* RIGHT SIDEBAR - PROPERTIES */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-80 bg-neutral-950/95 backdrop-blur-xl border-l border-white/5 p-6 overflow-y-auto transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:block lg:bg-neutral-950/50
        ${isPropertiesOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
          {/* Mobile Header for Sidebar */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Properties</h3>
              <button 
                onClick={() => setIsPropertiesOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white"
              >
                  ✕
              </button>
          </div>
        
        {/* Layout Selector */}
        <div className="space-y-4 mb-8">
             <div className="text-sm font-medium text-neutral-300">Layout</div>
             <div className="grid grid-cols-2 gap-2">
                <div 
                    onClick={() => setSelectedLayout('2x2')}
                    className={`aspect-3/4 border rounded-sm cursor-pointer transition-colors ${selectedLayout === '2x2' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 hover:border-white/30'}`} 
                >
                    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2">
                        {[1,2,3,4].map(i => <div key={i} className="bg-current opacity-20" />)}
                    </div>
                </div>
                <div 
                    onClick={() => setSelectedLayout('1x4')}
                    className={`aspect-3/4 border rounded-sm cursor-pointer transition-colors ${selectedLayout === '1x4' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 hover:border-white/30'}`} 
                >
                     <div className="w-full h-full grid grid-cols-1 grid-rows-4 gap-1 p-2 py-4 px-6">
                        {[1,2,3,4].map(i => <div key={i} className="bg-current opacity-20" />)}
                    </div>
                </div>
             </div>
        </div>

        {/* Stickers Selector */}
        <div className="space-y-4">
             <div className="text-sm font-medium text-neutral-300">Decorations</div>
             <div className="grid grid-cols-4 gap-2">
                 {['🎀', '✨', '💖', '🔥', '👑', '🕶️', '🌸', '💀'].map(emoji => (
                     <button 
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        draggable
                        onDragStart={(e) => handleDragStartFromSidebar(e, emoji)}
                        className="aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-2xl transition-colors"
                     >
                         {emoji}
                     </button>
                 ))}
             </div>
        </div>
      </aside>
    </div>
  )
}

function ToolIcon({ label, icon: Icon, active, onClick, className }: { label: string; icon: LucideIcon; active?: boolean; onClick?: () => void; className?: string }) {
    return (
        <div 
            onClick={onClick}
            className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 group ${active ? 'bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]' : 'hover:bg-white/10 text-neutral-500 hover:text-white'} ${className}`}
        >
            <span className="text-[10px] font-bold uppercase tracking-wider hidden group-hover:block absolute left-14 bg-neutral-800 px-2 py-1 rounded text-white border border-white/10 whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2">
                {label}
            </span>
            <Icon className="w-5 h-5 opacity-80" />
        </div>
    )
}
