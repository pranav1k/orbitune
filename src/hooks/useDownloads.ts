
import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/types/music';
import { downloadManager } from '@/lib/download-manager';

export function useDownloads() {
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

  const refreshDownloads = useCallback(async () => {
    const songs = await downloadManager.getAllDownloads();
    setDownloadedIds(new Set(songs.map(s => s.id)));
  }, []);

  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  const downloadSong = async (song: Song) => {
    if (downloadedIds.has(song.id) || isDownloading[song.id]) return;

    setIsDownloading(prev => ({ ...prev, [song.id]: true }));
    try {
      // Find best quality url
      const url = song.downloadUrl.find(q => q.quality === "320kbps")?.url || song.downloadUrl[song.downloadUrl.length - 1]?.url;
      
      if (!url) throw new Error("No download URL found");

      const response = await fetch(url);
      const blob = await response.blob();
      
      await downloadManager.saveSong(song, blob);
      await refreshDownloads();
    } catch (error) {
      console.error("Failed to download song", error);
    } finally {
      setIsDownloading(prev => {
          const newState = { ...prev };
          delete newState[song.id];
          return newState;
      });
    }
  };

  const removeDownload = async (id: string) => {
      await downloadManager.removeSong(id);
      await refreshDownloads();
  };

  const checkIsDownloaded = useCallback((id: string) => {
      return downloadedIds.has(id);
  }, [downloadedIds]);

  return {
    downloadedIds,
    isDownloading,
    downloadSong,
    removeDownload,
    checkIsDownloaded,
    refreshDownloads
  };
}
