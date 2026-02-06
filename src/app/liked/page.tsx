"use client";

import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LikedSongsPage() {
  const { likedSongs, playSong, currentSong, toggleLike, isLiked } = usePlayer();

  if (likedSongs.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
              <Heart className="w-16 h-16 opacity-20" />
              <p>Songs you like will appear here</p>
          </div>
      )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-6 mb-8">
          <div className="w-52 aspect-square bg-gradient-to-br from-indigo-500 to-purple-800 rounded-lg shadow-2xl flex items-center justify-center">
              <Heart className="md:w-24 md:h-24 w-16 h-16 text-white fill-current" />
          </div>
          <div>
              <p className="uppercase text-xs font-bold tracking-wider mb-2">Playlist</p>
              <h1 className="text-6xl font-black mb-4">Liked Songs</h1>
              <p className="text-zinc-300 font-medium">{likedSongs.length} songs</p>
          </div>
      </div>

      <div className="space-y-2">
         {likedSongs.map((song, i) => (
             <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 group transition-colors cursor-pointer"
                onClick={() => playSong(song, likedSongs)}
             >
                 <div className="w-8 text-center text-zinc-500 group-hover:hidden">
                     {i + 1}
                 </div>
                 <div className="w-8 hidden group-hover:flex items-center justify-center">
                     <Play className="w-4 h-4 fill-white" />
                 </div>

                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={song.image[2]?.url} 
                      alt={song.name} 
                      className="object-cover w-full h-full"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${currentSong?.id === song.id ? "text-primary" : "text-white"}`}>
                        {song.name}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                        {song.artists.primary.map(a => a.name).join(", ")}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                     <span className="text-sm text-zinc-500 font-mono">
                        {Math.floor((song.duration || 0) / 60)}:{((song.duration || 0) % 60).toString().padStart(2, '0')}
                     </span>
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-primary hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(song);
                        }}
                     >
                        <Heart className="w-5 h-5 fill-current" />
                     </Button>
                </div>
             </motion.div>
         ))}
      </div>
    </div>
  );
}
