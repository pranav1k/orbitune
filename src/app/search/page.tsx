"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { musicApi } from "@/lib/api";
import { SearchResult, Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Play, Disc, Users, Music, ListMusic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { motion } from "framer-motion";
import { useDownloads } from "@/hooks/use-downloads";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  // Default to global search first
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { playSong } = usePlayer();
  const debouncedQuery = useDebounce(query, 500);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { isDownloaded } = useDownloads();

  useEffect(() => {
    // Focus input on mount if no query
    if (!initialQuery && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [initialQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      // Use global search
      const res = await musicApi.search(searchQuery);
      setResults(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
        // Update URL without full reload
        const newUrl = `/search?q=${encodeURIComponent(debouncedQuery)}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        performSearch(debouncedQuery);
    } else {
         setResults(null);
    }
  }, [debouncedQuery, performSearch]);


  return (
    <div className="p-6 md:p-8 min-h-dvh pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="What do you want to play?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-14 text-lg bg-secondary/50 border-transparent focus-visible:ring-primary rounded-full"
          />
          {loading && (
             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
             </div>
          )}
        </div>

        {/* Results */}
        {!query && !results && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">Search for songs, albums, artists, or playlists</p>
            </div>
        )}

        {results && (
          <div className="space-y-12">
            {/* Top Result */}
            {results.topQuery?.results?.length > 0 && (() => {
                 const item = results.topQuery.results[0];
                 const title = 'title' in item ? item.title : item.name;
                 const type = 'type' in item ? item.type : 'Unknown';
                 const image = item.image;
                 const imageUrl = image && (image[2]?.link || image[2]?.url || image[0]?.link || image[0]?.url || "");

                 return (
                <section>
                    <h2 className="text-xl font-bold mb-4">Top Result</h2>
                    <div className="p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer inline-block pr-12 group relative"
                         onClick={() => {
                             if (type === 'song') playSong(item as Song);
                             else if (type === 'album') router.push(`/album/${item.id}`);
                             else if (type === 'artist') router.push(`/artist/${item.id}`);
                             else if (type === 'playlist') router.push(`/playlist/${item.id}`);
                         }}
                    >
                         <div className="relative w-32 h-32 mb-4 shadow-lg rounded-full overflow-hidden">
                             {imageUrl && (
                                <Image 
                                    src={imageUrl} 
                                    alt={title || "Top Result"} 
                                    fill 
                                    className="object-cover" 
                                />
                             )}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-wider">
                            <span className="bg-black/40 px-3 py-1 rounded-full text-xs">
                                {type}
                            </span>
                        </div>

                         <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                            <Button size="icon" className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl">
                                <Play className="w-6 h-6 fill-current ml-1" />
                            </Button>
                         </div>
                    </div>
                </section>
                );
            })()}

            {/* Songs */}
            {results.songs?.results?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-bold flex items-center gap-2">
                        <Music className="w-5 h-5 text-primary" /> Songs
                     </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                  {results.songs.results.slice(0, 4).map((song) => (
                    <div 
                        key={song.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group cursor-pointer"
                        onClick={() => playSong(song)}
                    >
                        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                            <Image src={song.image[1]?.link || song.image[1]?.url || song.image[0]?.link || song.image[0]?.url || ""} alt={song.name} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                <Play className="w-5 h-5 fill-white text-white" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="font-medium truncate group-hover:text-primary transition-colors">{song.name}</div>
                                {isDownloaded(song.id) && (
                                  <div className="text-primary flex-shrink-0" title="Downloaded">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                                {song.artists?.primary?.map(a => a.name).join(", ") || "Unknown Artist"}
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {results.albums?.results?.length > 0 && (
                 <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Disc className="w-5 h-5 text-primary" /> Albums
                    </h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.albums.results.slice(0, 5).map(album => (
                            <div 
                                key={album.id} 
                                className="group cursor-pointer space-y-3"
                                onClick={() => router.push(`/album/${album.id}`)}
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                                    <Image
                                        src={album.image[2]?.link || album.image[2]?.url || album.image[0]?.link || album.image[0]?.url || ""}
                                        alt={album.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <Play className="w-12 h-12 fill-white text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{album.title}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{album.artist || album.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                 </section>
            )}

            {/* Artists */}
            {results.artists?.results?.length > 0 && (
                 <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Artists
                    </h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.artists.results.slice(0, 5).map(artist => (
                            <div 
                                key={artist.id} 
                                className="group cursor-pointer space-y-3 flex flex-col items-center text-center"
                                onClick={() => router.push(`/artist/${artist.id}`)}
                            >
                                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                                    <Image
                                        src={artist.image[2]?.link || artist.image[2]?.url || artist.image[0]?.link || artist.image[0]?.url || ""}
                                        alt={artist.name || artist.title || "Artist"}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{artist.name || artist.title}</h3>
                                    <p className="text-sm text-muted-foreground truncate">Artist</p>
                                </div>
                            </div>
                        ))}
                     </div>
                 </section>
            )}
            
            {/* Playlists */}
            {results.playlists?.results?.length > 0 && (
                 <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ListMusic className="w-5 h-5 text-primary" /> Playlists
                    </h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.playlists.results.slice(0, 5).map(playlist => (
                            <div 
                                key={playlist.id} 
                                className="group cursor-pointer space-y-3"
                                onClick={() => router.push(`/playlist/${playlist.id}`)}
                            >
                                <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all bg-neutral-800">
                                     {playlist.image && playlist.image.length > 0 ? (
                                        <Image
                                            src={playlist.image[2]?.link || playlist.image[2]?.url || playlist.image[0]?.link || playlist.image[0]?.url || ""}
                                            alt={playlist.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white/20">#</span>
                                        </div>
                                     )}
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <Play className="w-12 h-12 fill-white text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{playlist.title}</h3>
                                    <p className="text-sm text-muted-foreground truncate">Playlist</p>
                                </div>
                            </div>
                        ))}
                     </div>
                 </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
