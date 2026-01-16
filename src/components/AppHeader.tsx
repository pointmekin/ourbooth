import { Download, ChevronLeft, ImageIcon, LogOut, LogIn, Home } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { ModeToggle } from './ui/mode-toggle'

interface AppHeaderProps {
  /** Show export button and handler (for /create page) */
  showExport?: boolean
  onExportClick?: () => void
  /** Show back to templates button (for /create page when template is selected) */
  showBackToTemplates?: boolean
  onBackToTemplates?: () => void
}

export function AppHeader({ 
  showExport,
  onExportClick,
  showBackToTemplates,
  onBackToTemplates
}: AppHeaderProps) {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.reload()
  }

  return (
    <header 
      className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8  backdrop-blur-md z-50 cursor-default"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 md:gap-3">
        {/* Conditional left button: Back to templates OR Home */}
        {showBackToTemplates && onBackToTemplates ? (
          <Button
            onClick={onBackToTemplates}
            variant="ghost"
            size="sm"
            className="h-8 px-2 md:px-3 text-neutral-400"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
        ) : (
          <Link to="/create">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 md:px-3 text-neutral-400"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Create</span>
            </Button>
          </Link>
        )}
        
        <Link to="/create">
          <h1 className="text-lg md:text-xl font-bold tracking-tighterbg-clip-text ">
            OURBOOTH
          </h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <ModeToggle />
        {/* User menu - visible on all sizes */}
        {isPending ? (
          <div className="w-8 h-8 rounded-full animate-pulse" />
        ) : session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-white/20 rounded-full">
                <Avatar className="w-8 h-8 border-2 border-white/20 hover:border-white/40 transition-colors">
                  <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
                  <AvatarFallback className="bg-rose-500  text-xs font-bold">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48  border-white/10">
              <div className="px-3 py-2 text-sm">
                {session.user.name || session.user.email}
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="cursor-pointer bg-transparent ">
                <Link to="/photos" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  My Photos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-red-400 focus:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/auth/signin' })}
            className="h-8 text-neutral-400 "
          >
            <LogIn className="w-4 h-4 mr-1" />
            Sign In
          </Button>
        )}

        {/* Export button - Desktop only, for /create page */}
        {showExport && onExportClick && (
          <Button 
            type="button"
            onClick={onExportClick}
            className="hidden md:flex px-5 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700  text-sm font-semibold rounded-full shadow-[0_0_20px_-5px_rgba(225,29,72,0.6)] transition-all cursor-pointer items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        )}
      </div>
    </header>
  )
}
