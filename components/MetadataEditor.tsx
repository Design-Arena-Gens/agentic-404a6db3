"use client";

import type { TrackRecord, TrackTagKey } from "@/lib/types";

type Props = {
  track: TrackRecord | null;
  onUpdate: (id: string, key: TrackTagKey, value: string) => void;
  onAutoFix: (id: string, keys?: TrackTagKey[]) => void;
};

const editableFields: { key: TrackTagKey; label: string; placeholder: string }[] = [
  { key: "title", label: "Title", placeholder: "Song Title" },
  { key: "artist", label: "Artist", placeholder: "Primary Artist" },
  { key: "album", label: "Album", placeholder: "Album Name" },
  { key: "year", label: "Year", placeholder: "YYYY" },
  { key: "genre", label: "Genre", placeholder: "Genre (comma separated)" },
  { key: "trackNumber", label: "Track #", placeholder: "01" },
  { key: "comment", label: "Notes", placeholder: "Additional details" }
];

export default function MetadataEditor({ track, onUpdate, onAutoFix }: Props) {
  if (!track) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-4 px-8 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-slate-200 text-2xl">
          ✨
        </div>
        <div>
          <h2 className="panel-title mb-1">Metadata Fixer</h2>
          <p className="text-sm text-slate-500">
            Select a track to review tags, clean naming, and add missing info.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel h-full">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="panel-title">Metadata Fixer</h2>
          <p className="text-xs text-slate-500">
            {track.file.name} • {(track.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAutoFix(track.id)}
          className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow hover:bg-ink/90"
        >
          Auto-clean tags
        </button>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[auto,1fr]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-36 items-center justify-center rounded-3xl border border-slate-200 bg-white object-cover">
            {track.artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.artworkUrl}
                alt={`${track.title} artwork`}
                className="size-full rounded-3xl object-cover"
              />
            ) : (
              <span className="text-4xl">🎧</span>
            )}
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs text-slate-600">
            <dl className="space-y-1">
              {track.durationMs && (
                <div className="flex justify-between gap-6">
                  <dt>Length</dt>
                  <dd>{Math.round(track.durationMs / 1000)}s</dd>
                </div>
              )}
              {track.bitrate && (
                <div className="flex justify-between gap-6">
                  <dt>Bitrate</dt>
                  <dd>{track.bitrate} kbps</dd>
                </div>
              )}
              {track.sampleRate && (
                <div className="flex justify-between gap-6">
                  <dt>Sample rate</dt>
                  <dd>{track.sampleRate} Hz</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <form className="grid gap-4">
          {editableFields.map(({ key, label, placeholder }) => (
            <label key={key} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </span>
              {key === "comment" ? (
                <textarea
                  rows={3}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder={placeholder}
                  value={track[key]}
                  onChange={(event) => onUpdate(track.id, key, event.target.value)}
                />
              ) : (
                <input
                  type="text"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  placeholder={placeholder}
                  value={track[key]}
                  onChange={(event) => onUpdate(track.id, key, event.target.value)}
                />
              )}
            </label>
          ))}
        </form>
      </div>
    </div>
  );
}
