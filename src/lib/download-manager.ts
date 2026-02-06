
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Song, Image } from '@/types/music';

interface OfflineSong {
  id: string;
  name: string;
  artist: string;
  image: Image[];
  blob: Blob;
  addedAt: number;
}

interface AntituneDB extends DBSchema {
  songs: {
    key: string;
    value: OfflineSong;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'antitune-db';
const DB_VERSION = 1;

class DownloadManager {
  private dbPromise: Promise<IDBPDatabase<AntituneDB>> | null = null;

  private getDb() {
    if (!this.dbPromise) {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return Promise.reject(new Error('IndexedDB not supported'));
      }
      
      this.dbPromise = openDB<AntituneDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('songs')) {
            const store = db.createObjectStore('songs', { keyPath: 'id' });
            store.createIndex('by-date', 'addedAt');
          }
        },
      });
    }
    return this.dbPromise;
  }

  async saveSong(song: Song, blob: Blob): Promise<void> {
    const db = await this.getDb();
    const offlineSong: OfflineSong = {
      id: song.id,
      name: song.name,
      artist: song.artists.primary[0]?.name || 'Unknown Artist',
      image: song.image,
      blob,
      addedAt: Date.now(),
    };
    await db.put('songs', offlineSong);
    window.dispatchEvent(new Event('downloads-changed'));
  }

  async getSong(id: string): Promise<OfflineSong | undefined> {
    try {
        const db = await this.getDb();
        return db.get('songs', id);
    } catch {
        return undefined;
    }
  }

  async removeSong(id: string): Promise<void> {
    const db = await this.getDb();
    await db.delete('songs', id);
    window.dispatchEvent(new Event('downloads-changed'));
  }

  async isDownloaded(id: string): Promise<boolean> {
    try {
        const db = await this.getDb();
        const song = await db.get('songs', id);
        return !!song;
    } catch {
        return false;
    }
  }

  async getAllDownloads(): Promise<OfflineSong[]> {
    try {
        const db = await this.getDb();
        return db.getAllFromIndex('songs', 'by-date');
    } catch {
        return [];
    }
  }

  async getSongUrl(id: string): Promise<string | null> {
      const song = await this.getSong(id);
      if (song) {
          return URL.createObjectURL(song.blob);
      }
      return null;
  }
}

export const downloadManager = new DownloadManager();
