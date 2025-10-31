"use client";

import clsx from "clsx";
import type { TrackRecord, TrackTagKey } from "@/lib/types";

type Props = {
  tracks: TrackRecord[];
  activeTrackId: string | null;
  selectedTrackId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, key: TrackTagKey, value: string) => void;
  onPlay: (id: string) => void;
  filter: string;
};

const formatDuration = (durationMs: number | null) => {
  if (!durationMs) return "--:--";
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const visibleFields: TrackTagKey[] = ["title", "artist", "album", "year", "genre"];

export default function TrackTable({
  tracks,
  activeTrackId,
  selectedTrackId,
  onSelect,
  onUpdate,
  onPlay,
  filter
}: Props) {
  const lowerFilter = filter.toLowerCase();
  const filteredTracks = tracks.filter((track) =>
    [track.title, track.artist, track.album, track.genre]
      .join(" ")
      .toLowerCase()
      .includes(lowerFilter)
  );

  return (
    <div className="glass-panel flex h-[480px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="panel-title">Library</h2>
        <span className="text-sm text-slate-500">{filteredTracks.length} tracks</span>
      </div>
      <div className="flex-1 overflow-auto subtle-scrollbar">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-white/90 backdrop-blur">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Artist</th>
              <th className="px-6 py-3">Album</th>
              <th className="px-6 py-3">Year</th>
              <th className="px-6 py-3">Genre</th>
              <th className="px-6 py-3 text-right">Length</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {filteredTracks.map((track) => (
              <tr
                key={track.id}
                className={clsx(
                  "border-b border-slate-100 transition",
                  track.id === selectedTrackId ? "bg-accent/5" : "hover:bg-slate-100/60"
                )}
                onClick={() => onSelect(track.id)}
                role="button"
              >
                {visibleFields.map((fieldKey) => (
                  <td key={fieldKey} className="px-6 py-3 align-middle">
                    <input
                      className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                      value={track[fieldKey]}
                      onChange={(event) =>
                        onUpdate(track.id, fieldKey, event.target.value)
                      }
                      onClick={(event) => event.stopPropagation()}
                      placeholder={fieldKey}
                    />
                  </td>
                ))}
                <td className="px-6 py-3 text-right align-middle">
                  <div className="flex items-center justify-end gap-2">
                    {track.dirty && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        Edited
                      </span>
                    )}
                    <button
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-medium transition",
                        track.id === activeTrackId
                          ? "bg-accent text-white"
                          : "bg-slate-200 text-slate-600 hover:bg-accent hover:text-white"
                      )}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPlay(track.id);
                      }}
                    >
                      {track.id === activeTrackId ? "Pause" : "Play"}
                    </button>
                    <span className="min-w-[60px] text-xs text-slate-500">
                      {formatDuration(track.durationMs)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTracks.length === 0 && (
              <tr>
                <td
                  className="px-6 py-8 text-center text-sm text-slate-500"
                  colSpan={6}
                >
                  No tracks match your search yet. Drop your collection to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
