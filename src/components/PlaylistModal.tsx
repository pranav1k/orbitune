"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ListMusic, Check } from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Song } from "@/types/music";

interface PlaylistModalProps {
  children: React.ReactNode;
  song?: Song;
}

export function PlaylistModal({ children, song }: PlaylistModalProps) {
  const { playlists, createPlaylist, addToPlaylist } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName("");
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (song) {
      addToPlaylist(playlistId, song);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{song ? "Add to Playlist" : "Your Playlists"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input 
              placeholder="New playlist name..." 
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 focus-visible:ring-primary"
            />
            <Button onClick={handleCreate} size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {playlists.length === 0 ? (
                <p className="text-zinc-500 text-center text-sm py-4">No playlists yet</p>
            ) : (
                playlists.map(playlist => (
                    <div 
                        key={playlist.id} 
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition"
                        onClick={() => song ? handleAddToPlaylist(playlist.id) : null}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                                <ListMusic className="w-5 h-5 text-zinc-400" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">{playlist.name}</h4>
                                <p className="text-xs text-zinc-500">{playlist.songs.length} songs</p>
                            </div>
                        </div>
                        {song && playlist.songs.some(s => s.id === song.id) && (
                            <Check className="w-4 h-4 text-primary" />
                        )}
                    </div>
                ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
