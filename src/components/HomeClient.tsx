"use client";

import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";
import { motion } from "framer-motion";
import { Play, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeClientProps {
  songs: Song[];
}

export default function HomeClient({ songs }: HomeClientProps) {
  const { playSong, currentSong, isPlaying } = usePlayer();
  
  // Use first song as Hero, rest as grid (or all in grid too?)
  // Let's keep the existing layout: First one is Hero.
  const HeroSong = songs[0];
  const gridSongs = songs.slice(1); // Display all in grid, or slice(1)? Let's display all for "Trending" list.

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Mobile Branding */}
      <div className="flex md:hidden items-center gap-2 px-1">
        <AudioLines className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-50 to-gray-50/80 bg-clip-text text-transparent">
          Orbitune
        </h1>
      </div>

      {/* Hero Section */}
      {HeroSong && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full h-52 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden group"
        >
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${HeroSong.image[2]?.url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-4 md:p-8 space-y-2 md:space-y-4">
                <span className="px-2 md:px-3 py-1 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider">
                    Trending #1
                </span>
                <h2 className="text-2xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 line-clamp-2">
                    {HeroSong.name}
                </h2>
                <div className="flex items-center gap-4">
                     <p className="text-sm md:text-lg text-zinc-300 line-clamp-1">
                        {HeroSong.artists?.primary?.map(a => a.name).join(", ")}
                    </p>
                </div>
                <Button 
                    onClick={() => playSong(HeroSong, songs)}
                    className="mt-2 md:mt-4 rounded-full px-5 md:px-8 py-4 md:py-6 text-sm md:text-lg font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20"
                >
                    <Play className="mr-2 w-4 h-4 md:w-5 md:h-5 fill-current" />
                    Listen Now
                </Button>
            </div>
        </motion.div>
      )}

      {/* Featured Grid */}
      <section>
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            Trending Now
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gridSongs.map((song, i) => (
                <motion.div
                    key={song.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl hover:bg-white/5 transition group cursor-pointer"
                    onClick={() => playSong(song, gridSongs)}
                >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                        <img 
                            src={song.image[2]?.url} 
                            alt={song.name}
                            className="object-cover w-full h-full transition group-hover:scale-110 duration-500" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Button size="icon" className="rounded-full w-12 h-12 bg-primary text-primary-foreground shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <Play className="w-6 h-6 ml-1 fill-current" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className={`font-semibold truncate ${currentSong?.id === song.id && isPlaying ? "text-primary" : "text-white"}`}>
                            {song.name}
                        </h4>
                        <p className="text-sm text-zinc-400 truncate">
                            {song.artists?.primary?.map(a => a.name).join(", ")}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
      </section>
    </div>
  );
}
