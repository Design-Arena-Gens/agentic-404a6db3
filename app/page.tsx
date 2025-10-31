"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FileDropZone from "@/components/FileDropZone";
import TrackTable from "@/components/TrackTable";
import MetadataEditor from "@/components/MetadataEditor";
import AudioPlayer from "@/components/AudioPlayer";
import LibraryStats from "@/components/LibraryStats";
import { autoFixTrack, createTrackRecord, updateTrackField } from "@/lib/metadata";
import type { TrackRecord, TrackTagKey } from "@/lib/types";

export default function HomePage() {
  const [tracks, setTracks] = useState<TrackRecord[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filter, setFilter] = useState("");
  const trackCacheRef = useRef<TrackRecord[]>([]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? null,
    [tracks, selectedTrackId]
  );
  const nowPlayingTrack = useMemo(
    () => tracks.find((track) => track.id === nowPlayingId) ?? null,
    [tracks, nowPlayingId]
  );

  trackCacheRef.current = tracks;

  const handleFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("audio/"));
    if (files.length === 0) return;

    const parsedTracks = await Promise.all(files.map((file) => createTrackRecord(file)));
    setTracks((previous) => {
      const updated = [...previous, ...parsedTracks];
      if (!selectedTrackId && updated.length > 0) {
        setSelectedTrackId(updated[0].id);
      }
      return updated;
    });
  }, [selectedTrackId]);

  const handleUpdateTrack = useCallback(
    (id: string, key: TrackTagKey, value: string) => {
      setTracks((previous) =>
        previous.map((track) => (track.id === id ? updateTrackField(track, key, value) : track))
      );
    },
    []
  );

  const handleAutoFix = useCallback(
    (id: string, keys?: TrackTagKey[]) => {
      setTracks((previous) =>
        previous.map((track) => (track.id === id ? autoFixTrack(track, keys) : track))
      );
    },
    []
  );

  const handleAutoFixAll = useCallback(() => {
    setTracks((previous) => previous.map((track) => autoFixTrack(track)));
  }, []);

  const handleExportMetadata = useCallback(() => {
    const payload = tracks.map(({ file, dirty, ...rest }) => ({
      ...rest,
      fileName: file.name,
      fileSize: file.size,
      dirty
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sithes-harmonic-vault-library.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [tracks]);

  const handlePlayRequest = useCallback(
    (id: string) => {
      if (nowPlayingId === id) {
        setIsPlaying((previous) => !previous);
        return;
      }
      setNowPlayingId(id);
      setIsPlaying(true);
    },
    [nowPlayingId]
  );

  const handleSelectTrack = useCallback((id: string) => {
    setSelectedTrackId(id);
  }, []);

  const handleNextTrack = useCallback(() => {
    if (!nowPlayingId || tracks.length === 0) {
      setIsPlaying(false);
      setNowPlayingId(null);
      return;
    }
    const index = tracks.findIndex((track) => track.id === nowPlayingId);
    if (index === -1 || index === tracks.length - 1) {
      setIsPlaying(false);
      setNowPlayingId(null);
      return;
    }
    setNowPlayingId(tracks[index + 1].id);
    setIsPlaying(true);
  }, [nowPlayingId, tracks]);

  const handlePreviousTrack = useCallback(() => {
    if (!nowPlayingId || tracks.length === 0) return;
    const index = tracks.findIndex((track) => track.id === nowPlayingId);
    if (index > 0) {
      setNowPlayingId(tracks[index - 1].id);
      setIsPlaying(true);
    }
  }, [nowPlayingId, tracks]);

  const revokeAllObjectUrls = useCallback(() => {
    trackCacheRef.current.forEach((track) => {
      URL.revokeObjectURL(track.objectUrl);
      if (track.artworkUrl) URL.revokeObjectURL(track.artworkUrl);
    });
  }, []);

  const handleRemoveTrack = useCallback((id: string) => {
    const trackToRemove = trackCacheRef.current.find((track) => track.id === id);
    if (trackToRemove) {
      URL.revokeObjectURL(trackToRemove.objectUrl);
      if (trackToRemove.artworkUrl) URL.revokeObjectURL(trackToRemove.artworkUrl);
    }
    setTracks((previous) => previous.filter((track) => track.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId(null);
    }
    if (nowPlayingId === id) {
      setNowPlayingId(null);
      setIsPlaying(false);
    }
  }, [nowPlayingId, selectedTrackId]);

  const handleClearLibrary = useCallback(() => {
    revokeAllObjectUrls();
    setTracks([]);
    setSelectedTrackId(null);
    setNowPlayingId(null);
    setIsPlaying(false);
  }, [revokeAllObjectUrls]);

  // Clean up when component unmounts
  useEffect(() => () => revokeAllObjectUrls(), [revokeAllObjectUrls]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <section className="mb-10 flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-center md:text-left">
          <span className="inline-flex items-center justify-center rounded-full bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            Sithe&apos;s Harmonic Vault
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Organise your private music library with surgical precision.
          </h1>
          <p className="text-base text-slate-600 md:text-lg">
            Clean messy tags, fill in missing metadata, and enjoy instant playback without
            uploading files anywhere. Everything stays on your device.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <FileDropZone onFiles={handleFiles} />
          <div className="glass-panel flex flex-col justify-between p-6">
            <div>
              <h2 className="panel-title mb-2">Library Controls</h2>
              <p className="text-sm text-slate-600">
                Apply smart fixes, export your cleaned metadata, or reset if you want to start
                fresh.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAutoFixAll}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent/90 disabled:bg-slate-200 disabled:text-slate-500"
                disabled={tracks.length === 0}
              >
                Auto-clean library
              </button>
              <button
                type="button"
                onClick={handleExportMetadata}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:border-accent hover:text-accent disabled:border-slate-200 disabled:text-slate-300"
                disabled={tracks.length === 0}
              >
                Export metadata JSON
              </button>
              <button
                type="button"
                onClick={handleClearLibrary}
                className="rounded-full border border-transparent bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:bg-slate-100 disabled:text-slate-400"
                disabled={tracks.length === 0}
              >
                Clear library
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <LibraryStats tracks={tracks} />
      </section>

      <section className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <div className="space-y-4">
          <div className="glass-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
                Metadata Search
              </div>
              <p className="text-xs text-slate-500">
                Filter by any tag to isolate tracks needing edits.
              </p>
            </div>
            <input
              type="search"
              placeholder="Search title, artist, album or genre..."
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 md:w-80"
            />
          </div>

          <TrackTable
            tracks={tracks}
            selectedTrackId={selectedTrackId}
            activeTrackId={nowPlayingId}
            onSelect={handleSelectTrack}
            onUpdate={handleUpdateTrack}
            onPlay={handlePlayRequest}
            filter={filter}
          />
        </div>
        <div className="flex flex-col gap-4">
          <MetadataEditor
            track={selectedTrack}
            onUpdate={handleUpdateTrack}
            onAutoFix={handleAutoFix}
          />
          <AudioPlayer
            track={nowPlayingTrack}
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying((previous) => !previous)}
            onNext={handleNextTrack}
            onPrev={handlePreviousTrack}
          />
          {selectedTrack && (
            <button
              type="button"
              onClick={() => handleRemoveTrack(selectedTrack.id)}
              className="glass-panel flex items-center justify-center rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100"
            >
              Remove selected track
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
