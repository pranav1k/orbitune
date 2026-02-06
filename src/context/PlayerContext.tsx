"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Song, DownloadUrl, AlbumDetails } from "@/types/music";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Vibrant } from "node-vibrant/browser"; // Try browser specific import or named import
import { musicApi } from "@/lib/api";
import { downloadManager } from "@/lib/download-manager";

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  changeVolume: (vol: number) => void;
  playNext: () => void;
  playPrev: () => void;
  addToQueue: (song: Song) => void;
  dominantColor: string | null;
  secondaryColor: string | null;
  likedSongs: Song[];
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  likedAlbums: AlbumDetails[];
  toggleLikeAlbum: (album: AlbumDetails) => void;
  isAlbumLiked: (albumId: string) => boolean;
  playlists: { id: string; name: string; songs: Song[] }[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  updatePlaylist: (playlistId: string, songs: Song[]) => void;
  history: Song[];
  reorderQueue: (newQueue: Song[]) => void;
  removeFromQueue: (songId: string) => void;
  isRepeat: boolean;
  toggleRepeat: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);

  // History (store IDs only)
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const toggleRepeat = () => setIsRepeat(prev => !prev);

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) setHistoryIds(JSON.parse(saved));
  }, []);

  const addToHistory = useCallback((song: Song) => {
      setHistoryIds(prev => {
          const newIds = [song.id, ...prev.filter(id => id !== song.id)].slice(0, 20); // Keep last 20
          localStorage.setItem("searchHistory", JSON.stringify(newIds));
          return newIds;
      });
      // Also update local state immediately for UI
      setHistory(prev => [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20));
  }, []);

  // Re-hydrate history
  useEffect(() => {
    const fetchHistory = async () => {
        if (historyIds.length === 0 || history.length > 0) return;
        
        try {
            const idsToFetch = historyIds.slice(0, 20);
            
            // Fetch sequentially or parallel but safe
            const requests = idsToFetch.map(async (id) => {
                try {
                    const res = await musicApi.getSongDetails(id);
                    return res.data[0];
                } catch (e) {
                    console.error(`Failed to fetch details for song ${id}`, e);
                    return null;
                }
            });

            const results = await Promise.all(requests);
            const songs = results.filter((s): s is Song => !!s);
            
            if (songs.length > 0) {
                 setHistory(songs);
            }
        } catch (e) {
            console.error("Failed to rehydrate history", e);
        }
    };
    fetchHistory();
  }, [historyIds]);

  const handleEnded = useCallback(() => {
    if (isRepeat && currentSong) {
      playSong(currentSong);
      return;
    }

    if (currentSong && queue.length > 0) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      
      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        playSong(queue[randomIndex]);
        return;
      }

      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        playSong(queue[currentIndex + 1]);
      }
    }
  }, [currentSong, queue, isRepeat, isShuffle]);

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    togglePlay: audioTogglePlay,
    seek,
    changeVolume,
  } = useAudioPlayer({ onEnded: handleEnded });

  // Load colors when song changes
  useEffect(() => {
    if (currentSong?.image?.[2]?.url) {
      new Vibrant(currentSong.image[2].url)
         // @ts-ignore - Vibrant types might be mismatched with v4
        .getPalette()
        .then((palette: any) => {
          setDominantColor(palette.Vibrant?.hex || null);
          setSecondaryColor(palette.DarkVibrant?.hex || null);
        })
        .catch((e: unknown) => console.error("Vibrant error", e));
    } else {
      setDominantColor(null);
      setSecondaryColor(null);
    }
  }, [currentSong]);

  // Persist Last Played
  useEffect(() => {
    const saved = localStorage.getItem("lastPlayed");
    if (saved) {
      const { song, volume: savedVol } = JSON.parse(saved);
      if (song) setCurrentSong(song);
      if (savedVol) changeVolume(savedVol);
    }
  }, []);

  useEffect(() => {
    if (currentSong) {
      localStorage.setItem("lastPlayed", JSON.stringify({ song: currentSong, volume }));
    }
  }, [currentSong, volume]);

  const [isLoading, setIsLoading] = useState(false);

  const playSong = useCallback(async (song: Song, newQueue?: Song[]) => {
    if (newQueue) setQueue(newQueue);
    
    // Stop current track immediately and show loading
    pause(); 
    setIsLoading(true);

    // Optimistic update for UI with current object
    setCurrentSong(song);
    
    // Check age
    const now = Date.now();
    const isOld = song.fetchedAt ? (now - song.fetchedAt > 60 * 60 * 1000) : true; // If no fetchedAt, assume old/needs refresh
    
    let targetSong = song;

    // Check if downloaded to avoid unnecessary API calls
    let isDownloaded = false;
    try {
        isDownloaded = await downloadManager.isDownloaded(song.id);
    } catch(e) {
        console.warn("Failed to check download status", e);
    }

    if (isOld && !isDownloaded) {
        try {
            console.log("Song URL might be stale, fetching fresh details...");
            const res = await musicApi.getSongDetails(song.id);
            if (res.data[0]) {
                targetSong = { ...res.data[0], fetchedAt: now };
                setCurrentSong(targetSong); // Update with fresh details
            }
        } catch (e) {
            console.error("Failed to refresh song details", e);
            // Fallback to existing song if fetch fails
        }
    }

    addToHistory({ ...targetSong, fetchedAt: targetSong.fetchedAt || now }); // Store with timestamp

    // Play logic
    const playAttempt = async (s: Song) => {
         let url: string | null = null;
         
         // 1. Try offline first
         try {
             const offlineUrl = await downloadManager.getSongUrl(s.id);
             if (offlineUrl) {
                 console.log("Playing from offline cache:", s.name);
                 url = offlineUrl;
             }
         } catch (e) {
             console.error("Failed to check offline cache", e);
         }

         // 2. Fallback to network
         if (!url) {
            url = s.downloadUrl.find(q => q.quality === "320kbps")?.url || s.downloadUrl[s.downloadUrl.length - 1]?.url;
         }

         if (url) {
             try {
                 await play(url);
             } catch (e) {
                 console.error("Playback failed with current URL", e);
                 // If we haven't already refreshed, try refreshing now
                 if (!isOld) { // If isOld was true, we already tried refreshing above
                     console.log("Retrying with fresh details...");
                     try {
                         const res = await musicApi.getSongDetails(s.id);
                         if (res.data[0]) {
                             const fresh = { ...res.data[0], fetchedAt: Date.now() };
                             setCurrentSong(fresh);
                             addToHistory(fresh);
                             const freshUrl = fresh.downloadUrl.find(q => q.quality === "320kbps")?.url || fresh.downloadUrl[fresh.downloadUrl.length - 1]?.url;
                             if (freshUrl) await play(freshUrl);
                         }
                     } catch (retryErr) {
                         console.error("Retry failed", retryErr);
                     }
                 }
             }
         }
    };

    await playAttempt(targetSong);
    setIsLoading(false); // Done loading

  }, [play, pause, addToHistory]); // Added pause to dependencies

  const playNext = useCallback(() => {
    if (!currentSong || queue.length === 0) return;
    
    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        playSong(queue[randomIndex]);
        return;
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    }
  }, [currentSong, queue, playSong, isShuffle]);

  const playPrev = useCallback(() => {
     if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    }
  }, [currentSong, queue, playSong]);

  // Media Session API
  useEffect(() => {
    if ("mediaSession" in navigator) {
      if (currentSong) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.name,
          artist: currentSong.artists.primary.map(a => a.name).join(", "),
          album: currentSong.album?.name || undefined,
          artwork: currentSong.image.map((img) => ({
            src: img.url,
            sizes: img.quality, // e.g. "500x500"
            type: "image/jpg", // Assumption based on common apis, strictly optional often
          })),
        });
      }

      navigator.mediaSession.setActionHandler("play", () => {
         audioTogglePlay()
      });
      navigator.mediaSession.setActionHandler("pause", () => {
         audioTogglePlay()
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
         playPrev()
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        playNext()
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details.seekTime !== undefined) {
              seek(details.seekTime);
          }
      });
    }
  }, [currentSong, playNext, playPrev, audioTogglePlay, seek]);

  useEffect(() => {
      if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
      }
  }, [isPlaying]);

  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  
  // Load liked songs
  useEffect(() => {
    const savedLiked = localStorage.getItem("likedSongs");
    if (savedLiked) {
      setLikedSongs(JSON.parse(savedLiked));
    }
  }, []);

  const toggleLike = useCallback((song: Song) => {
    setLikedSongs((prev) => {
      const isLiked = prev.some((s) => s.id === song.id);
      let newLiked;
      if (isLiked) {
        newLiked = prev.filter((s) => s.id !== song.id);
      } else {
        newLiked = [...prev, song];
      }
      localStorage.setItem("likedSongs", JSON.stringify(newLiked));
      return newLiked;
    });
  }, []);

  const [likedAlbums, setLikedAlbums] = useState<AlbumDetails[]>([]);

  useEffect(() => {
      const saved = localStorage.getItem("likedAlbums");
      if (saved) setLikedAlbums(JSON.parse(saved));
  }, []);

  const toggleLikeAlbum = useCallback((album: AlbumDetails) => {
      setLikedAlbums(prev => {
          const isLiked = prev.some(a => a.id === album.id);
          let newLiked;
          if (isLiked) {
              newLiked = prev.filter(a => a.id !== album.id);
          } else {
              newLiked = [...prev, album];
          }
          localStorage.setItem("likedAlbums", JSON.stringify(newLiked));
          return newLiked;
      });
  }, []);

  const isAlbumLiked = useCallback((albumId: string) => {
      return likedAlbums.some(a => a.id === albumId);
  }, [likedAlbums]);


  const [playlists, setPlaylists] = useState<{ id: string; name: string; songs: Song[] }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("playlists");
    if (saved) setPlaylists(JSON.parse(saved));
  }, []);

  const createPlaylist = (name: string) => {
    const newPlaylist = { id: crypto.randomUUID(), name, songs: [] };
    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    localStorage.setItem("playlists", JSON.stringify(updated));
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.id === song.id)) return p; // No duplicates
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    setPlaylists(updated);
    localStorage.setItem("playlists", JSON.stringify(updated));
  };
  
  const removeFromPlaylist = (playlistId: string, songId: string) => {
      const updated = playlists.map(p => {
          if (p.id === playlistId) {
              return { ...p, songs: p.songs.filter(s => s.id !== songId) };
          }
          return p;
      });
      setPlaylists(updated);
      localStorage.setItem("playlists", JSON.stringify(updated));
  }

  const updatePlaylist = (playlistId: string, songs: Song[]) => {
      const updated = playlists.map(p => {
          if (p.id === playlistId) {
              return { ...p, songs };
          }
          return p;
      });
      setPlaylists(updated);
      localStorage.setItem("playlists", JSON.stringify(updated));
  }

  const reorderQueue = (newQueue: Song[]) => {
      setQueue(newQueue);
  };

  const removeFromQueue = (songId: string) => {
      setQueue(prev => prev.filter(s => s.id !== songId));
  };

  const isLiked = useCallback((songId: string) => {
      return likedSongs.some(s => s.id === songId);
  }, [likedSongs]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        playSong,
        togglePlay: audioTogglePlay,
        seek,
        changeVolume,
        playNext,
        playPrev,
        addToQueue,
        dominantColor,
        secondaryColor,
        likedSongs,
        toggleLike,
        isLiked,
        likedAlbums,
        toggleLikeAlbum,
        isAlbumLiked,
        playlists,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        updatePlaylist,
        history,
        reorderQueue,
        removeFromQueue,
        isRepeat,
        toggleRepeat,
        isShuffle,
        toggleShuffle
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
