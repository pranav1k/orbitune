"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OfflineManager() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setIsOffline(true);
            if (pathname !== "/downloads") {
                router.push("/downloads");
            }
        };

        const handleOnline = () => {
            setIsOffline(false);
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);
        
        // Initial check
        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [pathname, router]);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur shadow-lg animate-in fade-in slide-in-from-bottom-4">
            You are offline. Showing downloaded music.
        </div>
    );
}
