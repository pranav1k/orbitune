import { getTrendingPlaylist } from "@/lib/music-server";
import HomeClient from "@/components/HomeClient";

// Revalidate every 24 hours (86400 seconds) - though we already set this in unstable_cache
export const revalidate = 86400; 

export default async function Home() {
  const trendingSongs = await getTrendingPlaylist();

  return (
    <main>
      <HomeClient songs={trendingSongs} />
    </main>
  );
}
