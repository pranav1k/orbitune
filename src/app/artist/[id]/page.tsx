"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { musicApi } from "@/lib/api";
import { Artist } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { Button } from "@/components/ui/button";
import { Play, Users, Disc, Music } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ArtistPage() {
  const { id } = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        if (typeof id === "string") {
          const res = await musicApi.getArtistDetails(id);
          setArtist(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch artist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!artist) {
    return <div className="p-8 text-center">Artist not found</div>;
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/10 to-background pb-32">
      {/* Hero Section */}
      <div className="p-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-center md:items-end"
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 shrink-0">
            <Image
              src={artist.image[2]?.link || artist.image[2]?.url || artist.image[0]?.link || artist.image[0]?.url || ""}
              alt={artist.name}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex flex-col gap-4 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-primary font-bold uppercase tracking-wider">
              {artist.isVerified && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Verified Artist
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black tracking-tight">{artist.name}</h1>
            
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {Number(artist.followerCount).toLocaleString()} Followers
              </span>
              <span>•</span>
              <span className="capitalize">{artist.dominantType}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 md:px-8 space-y-12 mt-8">
        {/* Top Songs */}
        {artist.topSongs && artist.topSongs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-6 h-6 text-primary" />
              Top Songs
            </h2>
            <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm">
              <div className="flex flex-col">
                {artist.topSongs.slice(0, 5).map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group grid grid-cols-[auto_1fr_auto] gap-4 p-3 items-center hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => playSong(song)}
                  >
                    <div className="w-8 text-center flex justify-center items-center">
                      <span className="group-hover:hidden text-muted-foreground font-variant-numeric tabular-nums">
                        {index + 1}
                      </span>
                      <Play className="w-4 h-4 fill-current hidden group-hover:block" />
                    </div>
                    
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                        <Image src={song.image[1]?.link || song.image[1]?.url || song.image[0]?.link || song.image[0]?.url || ""} alt={song.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate group-hover:text-primary transition-colors">
                          {song.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {song.year || song.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground pr-4 font-variant-numeric tabular-nums">
                      {(() => {
                        const duration = typeof song.duration === 'string' ? parseInt(song.duration) : (song.duration || 0);
                        return `
                          ${Math.floor(duration / 60)}:
                          ${(duration % 60).toString().padStart(2, '0')}
                        `;
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Albums */}
        {artist.topAlbums && artist.topAlbums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Disc className="w-6 h-6 text-primary" />
              Albums
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artist.topAlbums.map((album) => (
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
                  <div>
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{album.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{album.year} • Album</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
             {/* Singles */}
             {artist.singles && artist.singles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Disc className="w-6 h-6 text-primary" />
              Singles
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artist.singles.map((single) => (
                <div 
                  key={single.id} 
                  className="group cursor-pointer space-y-3"
                  onClick={() => router.push(`/album/${single.id}`)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                     <Image
                      src={single.image[2]?.link || single.image[2]?.url || single.image[0]?.link || single.image[0]?.url || ""}
                      alt={single.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 fill-white text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{single.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{single.year} • Single</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
