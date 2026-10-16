"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ListMusic, AudioLines, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerContext";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Heart, label: "Liked Songs", href: "/liked" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: Download, label: "Downloads", href: "/downloads" },
];

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { history, playSong } = usePlayer();

  return (
    <div className={cn("w-64 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col pb-24 md:pb-28", className)}>
      <div className="p-6 flex items-center gap-2">
        <AudioLines className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-50 to-gray-50/80 bg-clip-text text-transparent">
          Orbitune
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="font-medium">{item.label}</span>
              
              {isActive && (
                 <motion.div
                  layoutId="activeGlow"
                   className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                 />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-white/5 scrollbar-hide">
        <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-4 mt-2">
          Recently Played
        </div>
        <div className="space-y-3 pb-24">
            {!history || history.length === 0 ? (
                <p className="text-sm text-zinc-600 italic">No history yet</p>
            ) : (
                history.map((song) => (
                    <div 
                        key={song.id} 
                        className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition"
                        onClick={() => playSong(song)}
                    >
                        <img 
                            src={song.image?.[1]?.url} 
                            alt={song.name} 
                            className="w-10 h-10 rounded object-cover opacity-70 group-hover:opacity-100 transition"
                        />
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-medium text-zinc-400 group-hover:text-white truncate transition">
                                {song.name}
                            </h4>
                            <p className="text-xs text-zinc-600 group-hover:text-zinc-500 truncate">
                                {song.artists?.primary?.[0]?.name || "Unknown"}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
