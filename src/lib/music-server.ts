import { unstable_cache } from "next/cache";
import { musicApi } from "@/lib/api";
import { Song } from "@/types/music";

export const getTrendingPlaylist = unstable_cache(
  async (): Promise<Song[]> => {
    try {
      // 1. Search for "trending" playlists
      const searchRes = await musicApi.searchPlaylists("Top 50");
      const firstPlaylist = searchRes.data.results[0];

      if (!firstPlaylist) {
        console.warn("No trending playlist found");
        return [];
      }

      // 2. Fetch playlist details (songs)
      const playlistDetails = await musicApi.getPlaylistDetails(firstPlaylist.id, 50);
      
      // Return songs
      return playlistDetails.data.songs || [];
    } catch (error) {
      console.error("Failed to fetch trending playlist", error);
      return [];
    }
  },
  ["trending-playlist-songs-v2"],
  { revalidate: 86400 } // 24 hours
);
