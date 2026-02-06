import { SearchResponse, SongSearchResponse, Song } from "@/types/music";

const BASE_URL = "https://jiosaavn-api-clone-nine.vercel.app";

export const musicApi = {
  search: async (query: string): Promise<SearchResponse> => {
    const res = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    
    // Normalize generic search results (specifically songs)
    if (data.data?.songs?.results) {
      data.data.songs.results = data.data.songs.results.map((song: any) => ({
        ...song,
        name: song.title || song.name, // Map title to name
        artists: {
          primary: song.primaryArtists ? song.primaryArtists.split(', ').map((name: string) => ({ name: name.trim(), id: '', role: '', type: '', image: [], url: '' })) : (song.artists?.primary || []),
          featured: song.artists?.featured || [],
          all: song.artists?.all || []
        }
      }));
    }

    // Normalize top query if it's a song
    if (data.data?.topQuery?.results) {
        data.data.topQuery.results = data.data.topQuery.results.map((item: any) => {
            if (item.type === 'song') {
                return {
                    ...item,
                    name: item.title || item.name,
                    artists: {
                        primary: item.primaryArtists ? item.primaryArtists.split(', ').map((name: string) => ({ name: name.trim(), id: '', role: '', type: '', image: [], url: '' })) : (item.artists?.primary || []),
                        featured: [],
                        all: []
                    }
                };
            }
            return item;
        });
    }

    return data;
  },

  searchSongs: async (query: string, page = 0, limit = 10): Promise<SongSearchResponse> => {
    const res = await fetch(
      `${BASE_URL}/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Search songs failed");
    return res.json();
  },

  searchPlaylists: async (query: string, page = 0, limit = 10): Promise<{ data: { results: any[] } }> => {
    const res = await fetch(
      `${BASE_URL}/api/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Search playlists failed");
    return res.json();
  },

  getSongDetails: async (id: string): Promise<{ data: Song[] }> => {
      const res = await fetch(`${BASE_URL}/api/songs/${id}`);
      if (!res.ok) throw new Error("Fetch song details failed");
      return res.json();
  },

  getAlbumDetails: async (id: string): Promise<{ data: any }> => {
      const res = await fetch(`${BASE_URL}/api/albums?id=${id}`);
      if (!res.ok) throw new Error("Fetch album details failed");
      return res.json();
  },

  getArtistDetails: async (id: string): Promise<{ data: any }> => {
      const res = await fetch(`${BASE_URL}/api/artists?id=${id}`);
      if (!res.ok) throw new Error("Fetch artist details failed");
      return res.json();
  },

  getPlaylistDetails: async (id: string, limit = 50): Promise<{ data: any }> => {
      const res = await fetch(`${BASE_URL}/api/playlists?id=${id}&limit=${limit}`);
      if (!res.ok) throw new Error("Fetch playlist details failed");
      return res.json();
  },
};
