import { Metadata } from "next";
import { musicApi } from "@/lib/api";
import SongPageClient from "@/components/SongPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await musicApi.getSongDetails(id);
    const song = res.data[0];
    
    if (!song) return { title: "Song Not Found" };

    const itemTitle = song.name;
    const itemImage = song.image[2]?.url || song.image[0]?.url;
    const artistName = song.artists.primary[0]?.name || "Unknown Artist";

    return {
      title: `${itemTitle} by ${artistName} - Song | Orbitune`,
      description: `Listen to ${itemTitle} by ${artistName} on Orbitune.`,
      openGraph: {
        images: [itemImage],
      },
    };
  } catch (error) {
    return {
      title: "Song Not Found - Orbitune",
    };
  }
}

export default async function SongPage({ params }: PageProps) {
  const { id } = await params;
  let song = null;

  try {
     const res = await musicApi.getSongDetails(id);
     song = res.data[0];
  } catch (e) {
      console.error("Failed to fetch song server side", e);
  }

  if (!song) {
      return <div className="p-8 text-center text-red-500">Song not found.</div>;
  }

  return <SongPageClient song={song} />;
}
