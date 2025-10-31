"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

type Props = {
  onFiles: (files: FileList) => void | Promise<void>;
};

export default function FileDropZone({ onFiles }: Props) {
  const [isDragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      void onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={clsx(
        "glass-panel p-6 transition-all cursor-pointer border-dashed border-2",
        isDragging ? "border-accent bg-accent/10" : "border-transparent"
      )}
      role="presentation"
      onClick={() => {
        inputRef.current?.click();
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          🎵
        </div>
        <div>
          <p className="font-semibold text-ink">Drop audio files or folders</p>
          <p className="text-sm text-slate-600">
            MP3, FLAC, WAV, AAC and more. Files stay on your device.
          </p>
        </div>
        <button
          type="button"
          className="mt-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent/90"
        >
          Browse Library
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
