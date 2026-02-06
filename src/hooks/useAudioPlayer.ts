"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseAudioPlayerProps {
  onEnded?: () => void;
}

export function useAudioPlayer({ onEnded }: UseAudioPlayerProps = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.volume = volume;
      
      const audio = audioRef.current;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleDurationChange = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        onEndedRef.current?.();
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);
      audio.addEventListener("ended", handleEnded);

      return () => {
        // Don't pause on unmount necessarily if we want persistence, but for now standard behavior
        // audio.pause(); 
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []); // Run once to setup listeners

  const play = useCallback(async (url?: string) => {
    if (!audioRef.current) return;

    if (url) {
      audioRef.current.src = url;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Playback failed", e);
      }
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Play resume failed", e);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    const clampedVol = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clampedVol;
    setVolume(clampedVol);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    togglePlay,
    seek,
    changeVolume,
    error: null // Placeholder if we don't implement full error state yet, or logic handles it via catch
  };
}
