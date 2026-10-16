"use client";

import { usePlayer } from "@/context/PlayerContext";
import { formatTime, cn } from "@/lib/utils";
import { useDownloads } from "@/hooks/useDownloads";
import { Song } from "@/types/music";
import { 
    X, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart, Music2, ChevronDown, ListMusic, Trash2, Download, CloudDownload, Check, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useState, useEffect } from "react";
import { Vibrant } from "node-vibrant/browser";
import { createPortal } from "react-dom";

interface FullScreenPlayerProps {
    isOpen: boolean;
    onClose: () => void;
}

function DownloadControls({ song }: { song: Song }) {
    const { downloadSong, removeDownload, checkIsDownloaded, isDownloading } = useDownloads();
    const isOffline = checkIsDownloaded(song.id);
    const loading = isDownloading[song.id];

    const handleSimpleDownload = async () => {
        try {
             const url = song.downloadUrl.find(q => q.quality === "320kbps")?.url || song.downloadUrl[song.downloadUrl.length - 1]?.url;
             if (!url) return;
             
             // Open directly if it triggers download, or fetch and save
             const a = document.createElement('a');
             a.href = url;
             a.download = `${song.name} - ${song.artists.primary[0]?.name}.mp3`;
             a.target = "_blank";
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
        } catch (e) {
            console.error("Simple download failed", e);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {/* Simple File Download */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleSimpleDownload}
                className="text-white/40 hover:text-white"
                title="Download MP3"
            >
                <Download className="w-5 h-5" />
            </Button>

            {/* In-App Offline Download */}
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    isOffline ? removeDownload(song.id) : downloadSong(song);
                }}
                className={cn("transition-colors", isOffline ? "text-primary" : "text-white/40 hover:text-white")}
                disabled={loading}
                title={isOffline ? "Remove Download" : "Download for Offline Play"}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isOffline ? (
                    <Check className="w-5 h-5" />
                ) : (
                    <CloudDownload className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
}

export function FullScreenPlayer({ isOpen, onClose }: FullScreenPlayerProps) {
    const { 
        currentSong, 
        isPlaying, 
        togglePlay, 
        playNext, 
        playPrev, 
        currentTime, 
        duration, 
        seek, 
        toggleLike, 
        isLiked,
        dominantColor,
        isRepeat,
        toggleRepeat,
        isShuffle,
        toggleShuffle
    } = usePlayer();

    const [localSliderValue, setLocalSliderValue] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMusicIconHovered, setIsMusicIconHovered] = useState(false);
    const { 
        queue, 
        reorderQueue, 
        removeFromQueue, 
        playSong 
    } = usePlayer();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isDragging) {
            setLocalSliderValue(currentTime);
        }
    }, [currentTime, isDragging]);

    const handleSeek = (value: number[]) => {
        setIsDragging(true);
        setLocalSliderValue(value[0]);
    };

    const handleSeekCommit = (value: number[]) => {
        setIsDragging(false);
        seek(value[0]);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!currentSong) return null;

    // Use portal to break out of parent stacking contexts
    return mounted ? createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden"
                >
                    {/* Blurred Background */}
                    <div className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-150 pointer-events-none">
                        <img
                            src={currentSong.image?.[2]?.url || currentSong.image?.[0]?.url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />

                    {/* Fixed Header */}
                    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full pointer-events-auto">
                            <ChevronDown className="w-6 h-6" />
                        </Button>
                        <div className="text-xs font-semibold tracking-widest uppercase text-white/50">
                            Now Playing
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:bg-white/10 rounded-full overflow-hidden relative pointer-events-auto"
                            onClick={onClose}
                            onMouseEnter={() => setIsMusicIconHovered(true)}
                            onMouseLeave={() => setIsMusicIconHovered(false)}
                        >
                                <AnimatePresence mode="wait">
                                {isMusicIconHovered ? (
                                    <motion.div
                                        key="close"
                                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="music"
                                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Music2 className="w-6 h-6" />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                        </Button>
                    </div>

                    {/* Scrollable Container */}
                    <div className="relative z-10 h-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar">
                        
                        {/* Page 1: Player Controls */}
                        <div className="h-dvh w-full snap-start flex flex-col pt-20 pb-8 relative">
                             {/* Main Content */}
                            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full gap-8">
                                {/* Artwork */}
                                <motion.div 
                                    className="relative w-full aspect-square max-w-md rounded-2xl shadow-2xl overflow-hidden"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <img 
                                        src={currentSong.image?.[2]?.url || currentSong.image?.[0]?.url} 
                                        alt={currentSong.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>

                                {/* Info & Controls */}
                                <div className="w-full space-y-6">
                                    {/* Title & Like */}
                                    <div className="flex items-center justify-between">
                                        <div className="overflow-hidden">
                                            <motion.h2 
                                                layoutId="title"
                                                className="text-2xl md:text-3xl font-bold text-white truncate"
                                            >
                                                {currentSong.name}
                                            </motion.h2>
                                            <motion.p 
                                                layoutId="artist"
                                                className="text-lg text-white/60 truncate mt-1"
                                            >
                                                {currentSong.artists?.primary?.map(a => a.name).join(", ")}
                                            </motion.p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DownloadControls song={currentSong} />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className={`scale-125 ${isLiked(currentSong.id) ? "text-primary" : "text-white/40"}`}
                                                onClick={() => toggleLike(currentSong)}
                                            >
                                                <Heart className={`w-8 h-8 ${isLiked(currentSong.id) ? "fill-current" : ""}`} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <Slider
                                            value={[localSliderValue]}
                                            max={duration || 100}
                                            step={1}
                                            onValueChange={handleSeek}
                                            onValueCommit={handleSeekCommit}
                                            className="w-full cursor-pointer h-2"
                                        />
                                        <div className="flex justify-between text-xs font-medium text-white/40 font-mono">
                                            <span>{formatTime(localSliderValue)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>

                                    {/* Main Controls */}
                                    <div className="flex items-center justify-between max-w-sm mx-auto p-4">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={toggleShuffle}
                                            className={cn(
                                                "transition-colors",
                                                isShuffle ? "text-primary" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            <Shuffle className="w-6 h-6" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={playPrev} className="text-white hover:scale-110 transition">
                                            <SkipBack className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            onClick={togglePlay}
                                            className="w-16 h-16 rounded-full bg-white text-black hover:scale-105 transition hover:bg-white/90 shadow-xl"
                                        >
                                            {isPlaying ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={playNext} className="text-white hover:scale-110 transition">
                                            <SkipForward className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={toggleRepeat}
                                            className={cn(
                                                "transition-colors",
                                                isRepeat ? "text-primary" : "text-white/40 hover:text-white"
                                            )}
                                        >
                                            <Repeat className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Scroll Hint */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-pulse pb-4">
                                <span className="text-[10px] uppercase tracking-widest">Queue</span>
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Page 2: Queue */}
                        <div className="min-h-dvh w-full snap-start flex flex-col pt-24 pb-8 px-6 md:px-8 max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <ListMusic className="w-5 h-5" />
                                Up Next
                            </h3>
                            <div className="flex-1">
                                <Reorder.Group axis="y" values={queue} onReorder={reorderQueue} className="space-y-2">
                                    {queue.map((song) => (
                                        <Reorder.Item key={song.id} value={song}>
                                            <div className={`p-3 rounded-lg flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 cursor-grab active:cursor-grabbing ${currentSong.id === song.id ? "bg-primary/20 border-primary/20" : ""}`}>
                                                    <div className="flex items-center gap-3 overflow-hidden" onClick={() => playSong(song)}>
                                                    <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                                                        <img src={song.image[1]?.url} className="w-full h-full object-cover" />
                                                        {currentSong.id === song.id && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center items-end pb-2 gap-[2px]">
                                                                <div className="w-1 h-3 bg-primary animate-music-bar-1 origin-bottom rounded-full" />
                                                                <div className="w-1 h-5 bg-primary animate-music-bar-2 origin-bottom rounded-full" />
                                                                <div className="w-1 h-2 bg-primary animate-music-bar-3 origin-bottom rounded-full" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`font-medium truncate ${currentSong.id === song.id ? "text-primary font-bold" : "text-white"}`}>
                                                            {song.name}
                                                        </span>
                                                        <span className="text-xs text-white/60 truncate">{song.artists.primary[0]?.name}</span>
                                                    </div>
                                                    </div>
                                                    <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="text-white/40 hover:text-red-400 h-8 w-8"
                                                    onClick={() => removeFromQueue(song.id)}
                                                >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                                {queue.length === 0 && (
                                    <div className="text-center text-white/40 py-8">
                                        Queue is empty
                                    </div>
                                )}
                            </div>
                            {/* Spacer to allow scrolling to the very bottom comfortably */}
                            <div className="h-32" />
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    ) : null;
}
