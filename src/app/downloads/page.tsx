"use client";

import { useDownloads } from "@/hooks/useDownloads";
import { usePlayer } from "@/context/PlayerContext";
import { Play, ArrowDownToLine, Trash2, CloudDownload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Song } from "@/types/music";
import { downloadManager } from "@/lib/download-manager";

export default function DownloadsPage() {
  const { playSong, currentSong } = usePlayer();
  const { removeDownload } = useDownloads();
  const [downloadedSongs, setDownloadedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDownloads = async () => {
       try {
           const offlineSongs = await downloadManager.getAllDownloads();
           // Convert OfflineSong back to partial Song for display/play
           // Note: OfflineSong structure is slightly different, but compatible enough for this list
           // We might need to map it if strictly typed, but let's see. 
           // OfflineSong has blob, but we don't need blob here.
           const songs: Song[] = offlineSongs.map(os => ({
               id: os.id,
               name: os.name,
               artists: { primary: [{ name: os.artist, id: "", role: "", type: "", image: [], url: "" }], featured: [], all: [] },
               image: os.image,
               downloadUrl: [], // Not needed for offline play via manager
               type: "song",
               language: "en",
               explicitContent: false,
               hasLyrics: false,
               url: "",
               album: { id: null, name: null, url: null }
           }));
           setDownloadedSongs(songs);
       } catch (e) {
           console.error("Failed to fetch downloads", e);
       } finally {
           setLoading(false);
       }
  };

  useEffect(() => {
    fetchDownloads();
  }, []); // Reload on mount. Could subscribe to updates if needed.

  const handleRemove = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await removeDownload(id);
      fetchDownloads();
  };

  if (loading) {
      return <div className="p-8 text-zinc-500">Loading downloads...</div>;
  }

  if (downloadedSongs.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
              <CloudDownload className="w-16 h-16 opacity-20" />
              <p>Downloaded songs will appear here</p>
          </div>
      )
  }

  return (
    <div className="p-8 space-y-8">

      <div className="flex items-center gap-6 mb-8">
          <div className="w-52 aspect-square bg-gradient-to-br from-emerald-500 to-cyan-800 rounded-lg shadow-2xl flex items-center justify-center">
              <ArrowDownToLine  className="md:w-24 md:h-24 w-16 h-16 text-white" />
          </div>
          <div>
              <p className="uppercase text-xs font-bold tracking-wider mb-2">Library</p>
              <h1 className="text-6xl font-black mb-4">Downloads</h1>
              <p className="text-zinc-300 font-medium">{downloadedSongs.length} songs • Available Offline</p>
          </div>
      </div>

      <div className="space-y-2">
         {downloadedSongs.map((song, i) => (
             <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 group transition-colors cursor-pointer"
                onClick={() => playSong(song, downloadedSongs)}
             >
                 <div className="w-8 text-center text-zinc-500 group-hover:hidden">
                     {i + 1}
                 </div>
                 <div className="w-8 hidden group-hover:flex items-center justify-center">
                     <Play className="w-4 h-4 fill-white" />
                 </div>

                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={song.image[2]?.url || song.image[0]?.url} 
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
                     <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-zinc-500 hover:text-red-400"
                        onClick={(e) => handleRemove(e, song.id)}
                        title="Remove Download"
                     >
                        <Trash2 className="w-5 h-5" />
                     </Button>
                </div>
             </motion.div>
         ))}
      </div>
    </div>
  );
}
