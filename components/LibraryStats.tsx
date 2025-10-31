"use client";

import type { TrackRecord } from "@/lib/types";

type Props = {
  tracks: TrackRecord[];
};

const StatBlock = ({
  label,
  value,
  subtitle
}: {
  label: string;
  value: string;
  subtitle?: string;
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="text-2xl font-semibold text-ink">{value}</p>
    {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
  </div>
);

const formatTotalDuration = (tracks: TrackRecord[]) => {
  const totalSeconds = tracks.reduce(
    (acc, track) => acc + (track.durationMs ?? 0) / 1000,
    0
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default function LibraryStats({ tracks }: Props) {
  const uniqueArtists = new Set<string>();
  const uniqueAlbums = new Set<string>();
  const genres = new Set<string>();

  tracks.forEach((track) => {
    if (track.artist) uniqueArtists.add(track.artist.toLowerCase());
    if (track.album) uniqueAlbums.add(track.album.toLowerCase());
    track.genre
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .forEach((genre) => genres.add(genre));
  });

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatBlock
        label="Tracks"
        value={tracks.length.toString()}
        subtitle={`${tracks.filter((track) => track.dirty).length} edited`}
      />
      <StatBlock
        label="Artists"
        value={uniqueArtists.size.toString()}
        subtitle="Unique performers"
      />
      <StatBlock label="Albums" value={uniqueAlbums.size.toString()} />
      <StatBlock label="Playtime" value={formatTotalDuration(tracks)} />
    </div>
  );
}
