import { Metadata } from "next";
import { musicApi } from "@/lib/api";
import AlbumPageClient from "@/components/AlbumPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await musicApi.getAlbumDetails(id);
    const album = res.data;
    const itemTitle = album.name || album.title;
    const itemImage = album.image[2]?.link || album.image[2]?.url || album.image[0]?.link || album.image[0]?.url;

    return {
      title: `${itemTitle} - Album | Orbitune`,
      description: `Listen to ${itemTitle} by ${album.artists.primary[0]?.name} on Orbitune.`,
      openGraph: {
        images: [itemImage],
      },
    };
  } catch (error) {
    return {
      title: "Album Not Found - Orbitune",
    };
  }
}

export default async function AlbumPage({ params }: PageProps) {
  const { id } = await params;
  let album = null;
  let error = null;

  try {
     const res = await musicApi.getAlbumDetails(id);
     album = res.data;
  } catch (e) {
      console.error("Failed to fetch album server side", e);
      error = "Failed to load album";
  }

  if (error || !album) {
      return <div className="p-8 text-center text-red-500">Album not found or failed to load.</div>;
  }

  return <AlbumPageClient initialAlbum={album} />;
}
