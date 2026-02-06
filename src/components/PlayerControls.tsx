"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Maximize2,
  Loader2,
  Share2,
  Check,
  ListPlus
} from "lucide-react";
import { PlaylistModal } from "@/components/PlaylistModal";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime } from "@/lib/utils";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FullScreenPlayer } from "@/components/FullScreenPlayer";

export function PlayerControls() {
  const {
    currentSong,
    isPlaying,
    isLoading,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    volume,
    changeVolume,
    dominantColor,
    secondaryColor,
    toggleLike,
    isLiked,
    isRepeat,
    toggleRepeat,
    isShuffle,
    toggleShuffle
  } = usePlayer();

  const [localSliderValue, setLocalSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalSliderValue(currentTime);
    }
  }, [currentTime, isDragging]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  const handleSeek = (value: number[]) => {
    setIsDragging(true);
    setLocalSliderValue(value[0]);
  };

  const handleSeekCommit = (value: number[]) => {
    setIsDragging(false);
    seek(value[0]);
  };

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 h-auto md:h-24 bg-black/60 backdrop-blur-2xl border-t border-white/10 z-50 px-3 py-2 md:py-0 md:px-6 flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0"
      style={{
          background: dominantColor 
            ? `linear-gradient(to top, black 0%, ${dominantColor}20)` // Subtle tint
            : undefined
      }}
    >
        {/* Mobile Layout: Track Info + Controls on same row */}
        <div 
          className="flex md:hidden items-center w-full gap-2 cursor-pointer active:scale-95 transition-transform"
          onClick={() => setIsFullScreen(true)}
        >
          {/* Track Info */}
          {currentSong.image?.[2] && (
            <div className="relative shrink-0">
               <motion.img
                  src={currentSong.image[2].url}
                  alt={currentSong.name}
                  className={`w-10 h-10 rounded-md shadow-lg object-cover ${isLoading ? "opacity-50" : "opacity-100"}`}
                  animate={{ scale: isPlaying ? 1.02 : 1 }}
               />
               {isLoading && (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <Loader2 className="w-4 h-4 text-white animate-spin" />
                   </div>
               )}
            </div>
          )}
          <div className="overflow-hidden min-w-0 flex-1">
            <h4 className="font-semibold text-white truncate text-sm">
              {currentSong.name}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              {currentSong.artists?.primary?.map(a => a.name).join(", ") || currentSong.artists?.all?.[0]?.name}
            </p>
          </div>
          {/* Mobile Controls */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={playPrev} className="text-white w-8 h-8">
                <SkipBack className="w-4 h-4" fill="currentColor" />
            </Button>
            <Button
                size="icon"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white text-black shadow-lg"
            >
                {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="text-white w-8 h-8">
                <SkipForward className="w-4 h-4" fill="currentColor" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className={`w-8 h-8 ${isLiked(currentSong.id) ? "text-primary" : "text-zinc-400"}`}
                onClick={() => toggleLike(currentSong)}
            >
                <Heart className={`w-4 h-4 ${isLiked(currentSong.id) ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden w-full px-1">
           <Slider
              value={[localSliderValue]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              onValueCommit={handleSeekCommit}
              className="w-full cursor-pointer h-1"
           />
        </div>

        {/* Desktop Layout: Track Info */}
      <div className="hidden md:flex items-center w-1/3 gap-3 justify-start">
        {currentSong.image?.[2] && (
          <div className="relative">
             <motion.img
                src={currentSong.image[2].url}
                alt={currentSong.name}
                className={`w-14 h-14 rounded-lg shadow-lg object-cover ${isLoading ? "opacity-50" : "opacity-100"}`}
                animate={{
                    scale: isPlaying ? 1.05 : 1,
                }}
             />
             {isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center">
                     <Loader2 className="w-6 h-6 text-white animate-spin" />
                 </div>
             )}
          </div>
        )}
        <div className="overflow-hidden min-w-0 mr-2">
          <h4 className="font-semibold text-white truncate text-base hover:underline cursor-pointer">
            {currentSong.name}
          </h4>
          <p className="text-xs text-zinc-400 truncate hover:text-white cursor-pointer">
            {currentSong.artists?.primary?.map(a => a.name).join(", ") || currentSong.artists?.all?.[0]?.name}
          </p>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className={`shrink-0 hover:text-primary ${isLiked(currentSong.id) ? "text-primary" : "text-zinc-400"}`}
            onClick={() => toggleLike(currentSong)}
        >
            <Heart className={`w-5 h-5 ${isLiked(currentSong.id) ? "fill-current" : ""}`} />
        </Button>
        <div className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-zinc-400 hover:text-primary"
                onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/song/${currentSong.id}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }}
            >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
            </Button>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: copied ? 1 : 0, y: copied ? -10 : 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-800 text-white text-xs rounded-full whitespace-nowrap pointer-events-none shadow-xl border border-white/10"
            >
                Copied to clipboard
            </motion.div>
        </div>
        <PlaylistModal song={currentSong}>
          <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 text-zinc-400 hover:text-primary"
          >
              <ListPlus className="w-5 h-5" />
          </Button>
        </PlaylistModal>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex flex-col items-center w-1/3 gap-2">
        <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleShuffle}
              className={cn(
                "w-8 h-8 transition-colors",
                isShuffle ? "text-primary hover:text-primary/80" : "text-zinc-400 hover:text-white"
              )}
            >
                <Shuffle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={playPrev} className="text-white hover:scale-110 transition">
                <SkipBack className="w-6 h-6" fill="currentColor" />
            </Button>
            <Button
                size="icon"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 transition hover:bg-white/90 shadow-xl"
            >
                {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={playNext} className="text-white hover:scale-110 transition">
                <SkipForward className="w-6 h-6" fill="currentColor" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleRepeat}
              className={cn(
                "w-8 h-8 transition-colors",
                isRepeat ? "text-primary hover:text-primary/80" : "text-zinc-400 hover:text-white"
              )}
            >
                <Repeat className="w-4 h-4" />
            </Button>
        </div>
        <div className="w-full flex items-center gap-2 text-xs text-zinc-400 font-mono">
           <span>{formatTime(localSliderValue)}</span>
           <Slider
              value={[localSliderValue]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              onValueCommit={handleSeekCommit}
              className="w-full cursor-pointer h-2"
           />
           <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extras - Hidden on mobile for space */}
      <div className="hidden md:flex items-center justify-end w-1/3 gap-4">
         <div className="flex items-center gap-2 w-32 group">
            {volume === 0 ? <VolumeX className="w-5 h-5 text-zinc-400" /> : <Volume2 className="w-5 h-5 text-zinc-400 group-hover:text-white" />}
             <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(val) => changeVolume(val[0])}
              className="w-24"
           />
         </div>
         <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => setIsFullScreen(true)}>
             <Maximize2 className="w-5 h-5" />
         </Button>
      </div>

      <FullScreenPlayer isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} />
    </motion.div>
  );
}
