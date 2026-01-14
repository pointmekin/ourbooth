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
    <div
      onClick={onClick}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 group ${active ? "bg-white text-black shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]" : "hover:bg-white/10 text-neutral-500 hover:text-white"} ${className}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider hidden group-hover:block absolute left-full ml-4 bg-neutral-800 px-2 py-1 rounded text-white border border-white/10 whitespace-nowrap z-100 animate-in fade-in slide-in-from-left-2 pointer-events-none">
        {label}
      </span>
      <Icon className="w-5 h-5 opacity-80" />
    </div>
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
        <Link to="/photos">
          <ToolIcon label="My Photos" icon={ImageIcon} />
        </Link>
      )}

      {session && (
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 mb-2">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-full h-full object-cover"
            />
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
  );
}
