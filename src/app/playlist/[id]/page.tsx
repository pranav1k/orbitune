"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { musicApi } from "@/lib/api";
import { PlaylistDetails } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Play, Clock, User, Heart, MoreVertical, Shuffle } from "lucide-react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";

export default function PlaylistPage() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong, addToQueue, updatePlaylist, playlists } = usePlayer();

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        if (typeof id === "string") {
            // Check local playlists first
            const localPlaylist = playlists.find(p => p.id === id);
            
            if (localPlaylist) {
                // Map local playlist to match PlaylistDetails type
                const mappedPlaylist: PlaylistDetails = {
                    id: localPlaylist.id,
                    title: localPlaylist.name,
                    songs: localPlaylist.songs,
                    type: "playlist",
                    image: localPlaylist.songs[0]?.image || [], // Use first song's image as fallback
                    url: "",
                    firstname: "You",
                    songCount: localPlaylist.songs.length
                };
                setPlaylist(mappedPlaylist);
            } else {
                 // Fetch from API
                const res = await musicApi.getPlaylistDetails(id);
                setPlaylist(res.data);
            }
        }
      } catch (error) {
        console.error("Failed to fetch playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, playlists]);

  const handlePlayPlaylist = () => {
    if (playlist?.songs?.length) {
      playSong(playlist.songs[0]);
      playlist.songs.slice(1).forEach(song => addToQueue(song));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!playlist) {
    return <div className="p-8 text-center">Playlist not found</div>;
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background pb-32">
      {/* Hero Section */}
      <div className="p-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-end"
        >
          <div className="relative w-64 h-64 shadow-2xl rounded-xl overflow-hidden group shrink-0 bg-neutral-800">
             {playlist.image && playlist.image.length > 0 ? (
                <Image
                src={playlist.image[2]?.link || playlist.image[2]?.url || playlist.image[0]?.link || playlist.image[0]?.url || ""}
                alt={playlist.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-neutral-800 border border-white/10">
                    <span className="text-6xl font-black text-white/10">#</span>
                 </div>
             )}
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            <span className="uppercase text-xs font-bold tracking-wider text-muted-foreground">Playlist</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight">{playlist.title}</h1>
            {playlist.subtitle && <p className="text-muted-foreground text-lg">{playlist.subtitle}</p>}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1">
                 <User className="w-3 h-3"/>
                {playlist.firstname || "Orbitune User"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {playlist.songCount || playlist.songs?.length || 0} songs
              </span>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 rounded-full h-14 w-14 p-0 shadow-lg hover:scale-105 transition-transform"
                onClick={handlePlayPlaylist}
              >
                <Play className="w-6 h-6 fill-current ml-1" />
              </Button>
               <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full h-14 w-14 p-0 shadow-lg hover:scale-105 transition-transform"
                onClick={() => {
                    const shuffled = [...(playlist.songs || [])].sort(() => Math.random() - 0.5);
                    if (shuffled.length > 0) {
                        playSong(shuffled[0]);
                        shuffled.slice(1).forEach(s => addToQueue(s));
                    }
                }}
              >
                <Shuffle className="w-6 h-6" />
              </Button> 
            </div>
          </div>
        </motion.div>
      </div>

      {/* Track List */}
      <div className="px-6 md:px-8 mt-8">
        <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm p-4">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-white/5 mb-2">
            <span className="w-8 text-center">#</span>
            <span>Title</span>
            <span className="pr-4"><Clock className="w-4 h-4" /></span>
          </div>
          
          <Reorder.Group 
            axis="y" 
            values={playlist.songs || []} 
            onReorder={(newSongs) => {
                const updated = { ...playlist, songs: newSongs };
                setPlaylist(updated);
                updatePlaylist(playlist.id, newSongs);
            }} 
            className="flex flex-col gap-2"
          >
            {playlist.songs?.map((song, index) => (
              <Reorder.Item
                key={song.id}
                value={song}
                className="group grid grid-cols-[auto_1fr_auto] gap-4 p-3 items-center hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors rounded-lg bg-transparent"
              >
                  {/* Click handler on inner content to separate from drag */}
                <div onClick={(e) => { e.stopPropagation(); playSong(song); }} className="contents">
                    <div className="w-8 text-center flex justify-center items-center pointer-events-none">
                    <span className="group-hover:hidden text-muted-foreground font-variant-numeric tabular-nums">
                        {index + 1}
                    </span>
                    <Play className="w-4 h-4 fill-current hidden group-hover:block" />
                    </div>
                    
                    <div className="flex items-center gap-4 min-w-0 pointer-events-none relative">
                        <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                            <Image src={song.image[1]?.link || song.image[1]?.url || song.image[0]?.link || song.image[0]?.url || ""} alt={song.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate group-hover:text-primary transition-colors">
                            {song.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                            {song.artists.primary?.map(a => a.name).join(", ")}
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground pr-4 font-variant-numeric tabular-nums pointer-events-none">
                    {(() => {
                        const duration = typeof song.duration === 'string' ? parseInt(song.duration) : (song.duration || 0);
                        return `
                        ${Math.floor(duration / 60)}:
                        ${(duration % 60).toString().padStart(2, '0')}
                        `;
                    })()}
                    </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
             {!playlist.songs?.length && (
                <div className="p-8 text-center text-muted-foreground">
                    No songs in this playlist.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
