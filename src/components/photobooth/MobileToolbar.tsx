import { useNavigate } from '@tanstack/react-router'
import { Upload, Smile, LogIn, LogOut, Camera, LucideIcon } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

interface MobileToolbarProps {
  captureMode: 'upload' | 'camera'
  onCaptureModeChange: (mode: 'upload' | 'camera') => void
  onStickersToggle: () => void
}

function ToolIcon({ 
  icon: Icon, 
  active, 
  onClick 
}: { 
  icon: LucideIcon
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${active ? 'bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]' : 'hover:bg-white/10 text-neutral-500 hover:text-white'}`}
    >
      <Icon className="w-5 h-5 opacity-80" />
    </div>
  )
}

export function MobileToolbar({ 
  captureMode, 
  onCaptureModeChange, 
  onStickersToggle 
}: MobileToolbarProps) {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()

  const handleAuthAction = async () => {
    if (session) {
      await authClient.signOut()
      window.location.reload()
    } else {
      navigate({ to: '/auth/signin' })
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 flex justify-around py-3 px-4 safe-area-inset-bottom">
      <ToolIcon 
        icon={Upload} 
        active={captureMode === 'upload'} 
        onClick={() => onCaptureModeChange('upload')} 
      />
      <ToolIcon 
        icon={Camera} 
        active={captureMode === 'camera'} 
        onClick={() => onCaptureModeChange('camera')} 
      />
      <ToolIcon 
        icon={Smile} 
        onClick={onStickersToggle} 
      />
      <ToolIcon 
        icon={session ? LogOut : LogIn} 
        onClick={handleAuthAction}
      />
    </div>
  )
}
