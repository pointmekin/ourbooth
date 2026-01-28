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
  activeTool?: "stickers" | "filters" | null;
  onToolChange?: (tool: "stickers" | "filters" | null) => void;
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
              ? "bg-primary text-primary-foreground shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] hover:bg-primary hover:text-primary-foreground" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
  activeTool,
  onToolChange,
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
    <aside className="hidden md:flex w-20 border-r border-border flex-col items-center py-6 gap-6 z-300 bg-background/80 backdrop-blur-xl overflow-visible">
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
        <ToolIcon
          label="Stickers"
          icon={Smile}
          active={activeTool === "stickers"}
          onClick={() => onToolChange?.(activeTool === "stickers" ? null : "stickers")}
        />
        <ToolIcon
          label="Filters"
          icon={Wand2}
          active={activeTool === "filters"}
          onClick={() => onToolChange?.(activeTool === "filters" ? null : "filters")}
        />
      </div>

      <div className="flex-1" />

      {session && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/photos">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
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
