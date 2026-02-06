"use client";

import { useState, useEffect } from "react";
import { AlbumDetails } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar, Heart, Share2, Check, ListPlus } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlaylistModal } from "@/components/PlaylistModal";

import { useDownloads } from "@/hooks/use-downloads";

interface AlbumPageClientProps {
  initialAlbum: AlbumDetails;
}

export default function AlbumPageClient({ initialAlbum }: AlbumPageClientProps) {
  // Use initialAlbum directly, no need for loading state since it's passed from server
  const album = initialAlbum;
  
  const { playSong, addToQueue, isAlbumLiked, toggleLikeAlbum } = usePlayer();
  const [copied, setCopied] = useState(false);
  const isLiked = isAlbumLiked(album.id);
  const { isDownloaded } = useDownloads();

  const handlePlayAlbum = () => {
    if (album?.songs?.length) {
      playSong(album.songs[0]);
      // Add the rest of the album to queue
      album.songs.slice(1).forEach(song => addToQueue(song));
    }
  };

  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background pb-32">
      {/* Hero Section */}
      <div className="p-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-end"
        >
          <div className="relative w-64 h-64 shadow-2xl rounded-xl overflow-hidden group shrink-0">
            <Image
              src={album.image[2]?.link || album.image[2]?.url || album.image[0]?.link || album.image[0]?.url || ""}
              alt={album.name || album.title || "Album Cover"}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            <span className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Album</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight">{album.name || album.title}</h1>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/artist/${album.artists.primary[0]?.id}`}>
              <span className="font-semibold text-foreground hover:underline cursor-pointer">
                {album.artists.primary[0]?.name}
              </span>
            </Link>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {album.year}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {album.songs.length} songs
              </span>
            </div>

            <div className="flex items-center gap-4 mt-4 relative">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 rounded-full h-14 w-14 p-0 shadow-lg hover:scale-105 transition-transform"
                onClick={handlePlayAlbum}
              >
                <Play className="w-6 h-6 fill-current ml-1" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => toggleLikeAlbum(album)}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current text-primary" : ""}`} />
              </Button>
              <div className="relative">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={handleShare}
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
            </div>
          </div>
        </motion.div>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-8 mt-8">
        <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-white/5">
            <span className="w-8 text-center">#</span>
            <span>Title</span>
            <span className="pr-4"><Clock className="w-4 h-4" /></span>
          </div>
          
          <div className="flex flex-col">
            {album.songs.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group grid grid-cols-[auto_1fr_auto] gap-4 p-3 items-center hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => playSong(song)}
              >
                <div className="w-8 text-center flex justify-center items-center">
                  <span className="group-hover:hidden text-muted-foreground font-variant-numeric tabular-nums">
                    {index + 1}
                  </span>
                  <Play className="w-4 h-4 fill-current hidden group-hover:block" />
                </div>
                
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate group-hover:text-primary transition-colors">
                      {song.name}
                    </span>
                    {isDownloaded(song.id) && (
                      <div className="text-primary flex-shrink-0" title="Downloaded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {song.artists.primary.map(a => a.name).join(", ")}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                     <span className="text-sm text-muted-foreground font-variant-numeric tabular-nums">
                        {(() => {
                            const duration = typeof song.duration === 'string' ? parseInt(song.duration) : (song.duration || 0);
                            return `
                            ${Math.floor(duration / 60)}:
                            ${(duration % 60).toString().padStart(2, '0')}
                            `;
                        })()}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                        <PlaylistModal song={song}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <ListPlus className="w-4 h-4" />
                            </Button>
                        </PlaylistModal>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
