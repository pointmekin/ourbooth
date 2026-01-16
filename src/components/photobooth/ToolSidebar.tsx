import { Link, useNavigate } from "@tanstack/react-router";
import {
  Upload,
  Smile,
  Wand2,
  LogIn,
  LogOut,
  Camera,
  ImageIcon,
  LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ToolSidebarProps {
  captureMode: "upload" | "camera";
  onCaptureModeChange: (mode: "upload" | "camera") => void;
}

function ToolIcon({
  label,
  icon: Icon,
  active,
  onClick,
  className,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`w-10 h-10 rounded-xl transition-all duration-300 ${
            active 
              ? "bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] hover:bg-white hover:text-black" 
              : "text-neutral-500 hover:bg-white/10 hover:text-white"
          } ${className}`}
        >
          <Icon className="w-5 h-5 opacity-80" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function ToolSidebar({
  captureMode,
  onCaptureModeChange,
}: ToolSidebarProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const handleAuthAction = async () => {
    if (session) {
      await authClient.signOut();
      window.location.reload();
    } else {
      navigate({ to: "/auth/signin" });
    }
  };

  return (
    <aside className="hidden md:flex w-20 border-r border-white/5 flex-col items-center py-6 gap-6 z-300 bg-neutral-950/80 backdrop-blur-xl overflow-visible">
      <div className="flex space-y-6 w-full flex-col items-center">
        <ToolIcon
          label="Upload Mode"
          icon={Upload}
          active={captureMode === "upload"}
          onClick={() => onCaptureModeChange("upload")}
        />
        <ToolIcon
          label="Camera Mode"
          icon={Camera}
          active={captureMode === "camera"}
          onClick={() => onCaptureModeChange("camera")}
        />
        <ToolIcon label="Stickers" icon={Smile} />
        <ToolIcon label="Filters" icon={Wand2} />
      </div>

      <div className="flex-1" />

      {session && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/photos">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl text-neutral-500 hover:bg-white/10 hover:text-white"
              >
                <ImageIcon className="w-5 h-5 opacity-80" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            My Photos
          </TooltipContent>
        </Tooltip>
      )}

      {session && (
        <Avatar className="w-10 h-10 border border-white/20">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? ""} />
          <AvatarFallback className="bg-rose-500 text-white text-xs font-bold">
            {session.user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <ToolIcon
        label={session ? "Sign Out" : "Sign In"}
        icon={session ? LogOut : LogIn}
        onClick={handleAuthAction}
        className={session ? "hover:bg-red-500/20 hover:text-red-500" : ""}
      />
      <div className="h-4" />
    </aside>
  );
}
