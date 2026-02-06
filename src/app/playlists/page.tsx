"use client";

import { usePlayer } from "@/context/PlayerContext";
import { ListMusic, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link"; // If we had individual playlist pages
import { PlaylistModal } from "@/components/PlaylistModal";

import { useRouter } from "next/navigation";

export default function PlaylistsPage() {
  const router = useRouter();
  const { playlists, playSong, removeFromPlaylist } = usePlayer();

  return (
    <div className="p-8 space-y-8">
       <div className="flex items-center justify-between">
           <h1 className="text-4xl font-bold">Your Playlists</h1>
           <PlaylistModal>
               <Button className="rounded-full bg-white text-black hover:bg-zinc-200">
                   Create Playlist
               </Button>
           </PlaylistModal>
       </div>

       {playlists.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
               <ListMusic className="w-16 h-16 opacity-20" />
               <p>Create your first playlist to get started</p>
           </div>
       ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {playlists.map((playlist, i) => (
                   <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative bg-zinc-900/50 hover:bg-zinc-900 rounded-xl p-4 transition-all hover:shadow-2xl border border-white/5 hover:border-white/10 cursor-pointer"
                        onClick={() => router.push(`/playlist/${playlist.id}`)}
                   >
                        <div className="relative aspect-square bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-lg mb-4 flex items-center justify-center overflow-hidden group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all">
                             {playlist.songs.length > 0 ? (
                                 <div className="grid grid-cols-2 w-full h-full">
                                     {playlist.songs.slice(0, 4).map((s) => (
                                         <img key={s.id} src={s.image[1]?.url} className="w-full h-full object-cover" />
                                     ))}
                                 </div>
                             ) : (
                                 <ListMusic className="w-12 h-12 text-zinc-600" />
                             )}
                             
                             {playlist.songs.length > 0 && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                     <Button 
                                        size="icon" 
                                        className="rounded-full w-12 h-12 bg-primary text-primary-foreground shadow-xl scale-90 group-hover:scale-100 transition"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playSong(playlist.songs[0], playlist.songs);
                                        }}
                                     >
                                         <Play className="w-5 h-5 ml-1 fill-current" />
                                     </Button>
                                </div>
                             )}
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-lg truncate group-hover:text-white transition-colors">{playlist.name}</h3>
                            <p className="text-zinc-500 text-sm font-medium">{playlist.songs.length} Tracks</p>
                        </div>
                   </motion.div>
               ))}
           </div>
       )}
    </div>
  );
}
