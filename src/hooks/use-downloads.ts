import { useState, useEffect } from 'react';
import { downloadManager } from '@/lib/download-manager';

export function useDownloads() {
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDownloads = async () => {
      const downloads = await downloadManager.getAllDownloads();
      setDownloadedIds(new Set(downloads.map(d => d.id)));
    };

    fetchDownloads();

    const handleDownloadsChanged = () => {
      fetchDownloads();
    };

    window.addEventListener('downloads-changed', handleDownloadsChanged);

    return () => {
      window.removeEventListener('downloads-changed', handleDownloadsChanged);
    };
  }, []);

  const isDownloaded = (id: string) => downloadedIds.has(id);

  return { downloadedIds, isDownloaded };
}
