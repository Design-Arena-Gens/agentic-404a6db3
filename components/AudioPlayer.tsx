"use client";

import { useEffect, useRef, useState } from "react";
import type { TrackRecord } from "@/lib/types";

type Props = {
  track: TrackRecord | null;
  isPlaying: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function AudioPlayer({
  track,
  isPlaying,
  onToggle,
  onNext,
  onPrev
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (track) {
      audio.src = track.objectUrl;
      audio.load();
      if (isPlaying) {
        void audio.play().catch(() => undefined);
      }
    } else {
      audio.pause();
      setProgress(0);
      setDuration(0);
    }
  }, [track, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      onNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onNext]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="panel-title mb-1">
            {track ? track.title : "Nothing playing"}
          </p>
          <p className="text-sm text-slate-500">
            {track ? `${track.artist || "Unknown"} • ${track.album || "—"}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-full border border-slate-300 px-3 py-2 text-sm hover:border-accent hover:text-accent"
            disabled={!track}
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            disabled={!track}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-full border border-slate-300 px-3 py-2 text-sm hover:border-accent hover:text-accent"
            disabled={!track}
          >
            ⏭
          </button>
        </div>
      </div>
      <div>
        <input
          type="range"
          min={0}
          max={duration ? Math.floor(duration) : 0}
          value={progress ? Math.floor(progress) : 0}
          onChange={(event) => {
            const audio = audioRef.current;
            if (!audio) return;
            const value = Number(event.target.value);
            audio.currentTime = value;
            setProgress(value);
          }}
          className="w-full accent-accent"
          disabled={!track}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <audio ref={audioRef} hidden />
    </div>
  );
}
