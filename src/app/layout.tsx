import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerContext";
import { Sidebar } from "@/components/Sidebar";
import { PlayerControls } from "@/components/PlayerControls";
import { BottomNav } from "@/components/BottomNav";
import { OfflineManager } from "@/components/OfflineManager";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orbitune",
  description: "High-performance music player",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Orbitune",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-black text-white antialiased overflow-hidden`}>
        <PlayerProvider>
          <OfflineManager />
          <div className="flex h-screen w-full">
            {/* Desktop Sidebar */}
            <div className="hidden md:block fixed left-0 top-0 h-screen z-40">
                <Sidebar />
            </div>

            <main className="flex-1 md:ml-64 h-full relative overflow-hidden transition-[margin] duration-300">
               {/* Scrollable Content Area */}
               <div className="h-full overflow-y-auto pb-40 md:pb-32 scrollbar-hide"> 
                  {children}
               </div>
               
               {/* Player Controls (Fixed) */}
               <PlayerControls />
            </main>

            {/* Bottom Navigation (Mobile only) */}
            <BottomNav />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
