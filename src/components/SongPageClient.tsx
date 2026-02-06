"use client";

import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, Heart, Share2, Check, ListPlus } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { PlaylistModal } from "@/components/PlaylistModal";
import { Button as Button2 } from "@/components/ui/button"; // Renaming to avoid conflict if I messed up previous import or just reuse Button
import { useEffect } from "react";

interface SongPageClientProps {
  song: Song;
}

export default function SongPageClient({ song }: SongPageClientProps) {
  const { playSong, isPlaying, currentSong, togglePlay, isLiked, toggleLike } = usePlayer();
  const [copied, setCopied] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;
  const liked = isLiked(song.id);



  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-dvh pb-32 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-background">
      
      {/* Blurred Background */}
      <div className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-150 pointer-events-none">
          <Image
            src={song.image[2]?.url || song.image[0]?.url}
            alt=""
            fill
            className="object-cover"
          />
      </div>
      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />
      <div className="z-10 flex flex-col items-center gap-8 max-w-lg w-full text-center">
        
        {/* Art */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-64 h-64 md:w-96 md:h-96 rounded-2xl shadow-2xl overflow-hidden"
        >
             <Image
                src={song.image[2]?.url || song.image[0]?.url}
                alt={song.name}
                fill
                className="object-cover"
             />
        </motion.div>

        {/* Info */}
        <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{song.name}</h1>
            <div className="flex flex-col gap-1 text-muted-foreground">
                 <Link href={`/artist/${song.artists.primary[0]?.id}`} className="hover:text-primary hover:underline font-semibold text-lg transition-colors">
                     {song.artists.primary.map(a => a.name).join(", ")}
                 </Link>
                 <span className="text-sm">{song.album?.name}</span>
            </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6">
            <Button
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => toggleLike(song)}
            >
                <Heart className={`w-6 h-6 ${liked ? "fill-primary text-primary" : ""}`} />
            </Button>

            <Button
                size="icon"
                className="w-20 h-20 rounded-full shadow-xl bg-primary text-primary-foreground hover:scale-105 transition-transform"
                onClick={handlePlay}
            >
                {isCurrentSong && isPlaying ? (
                    <Pause className="w-10 h-10 fill-current" />
                ) : (
                    <Play className="w-10 h-10 fill-current ml-1" />
                )}
            </Button>

            <Button
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={handleShare}
            >
                {copied ? <Check className="w-6 h-6 text-green-500" /> : <Share2 className="w-6 h-6" />}
            </Button>
            
            <PlaylistModal song={song}>
                <Button2
                    size="icon"
                    className="rounded-full w-12 h-12"
                >
                    <ListPlus className="w-6 h-6" />
                </Button2>
            </PlaylistModal>
        </div>

      </div>
    </div>
  );
}
