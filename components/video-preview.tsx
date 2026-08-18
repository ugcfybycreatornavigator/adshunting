"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, VolumeX } from "lucide-react";

export function VideoPreview({
  src,
  poster,
  className = "",
  controls = false,
  objectFit = "cover",
  onMetadata,
}: {
  src: string;
  poster?: string | null;
  className?: string;
  controls?: boolean;
  objectFit?: "cover" | "contain";
  onMetadata?: (metadata: { width: number; height: number }) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pendingPlay = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [nearby, setNearby] = useState(controls);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNearby(true);
        if (!entry.isIntersecting) {
          ref.current?.pause();
          setPlaying(false);
        }
      },
      { rootMargin: "100px", threshold: 0.15 }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearby || !pendingPlay.current) return;
    pendingPlay.current = false;
    const video = ref.current;
    if (!video) return;
    video.load();
    void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [nearby, src]);

  async function toggle(event: React.MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!nearby) {
      pendingPlay.current = true;
      setNearby(true);
      return;
    }
    const video = ref.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setPlaying(true);
      } else {
        video.pause();
        setPlaying(false);
      }
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`group relative overflow-hidden bg-zinc-100 ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster || undefined}
        muted
        playsInline
        preload={controls ? "metadata" : "none"}
        controls={controls && !failed}
        className={`h-full w-full ${objectFit === "contain" ? "object-contain" : "object-cover"} ${failed && poster ? "opacity-50" : ""}`}
        onLoadedMetadata={(event) => {
          setFailed(false);
          const video = event.currentTarget;
          if (video.videoWidth && video.videoHeight) {
            onMetadata?.({ width: video.videoWidth, height: video.videoHeight });
          }
        }}
        onError={() => setFailed(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/40 text-white backdrop-blur-[2px]">
          <span className="text-xs font-semibold">Video unavailable</span>
        </div>
      )}
      {!controls && !failed && <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause preview" : "Play muted preview"}
        className="absolute bottom-3 left-3 z-10 grid size-11 place-items-center rounded-full bg-black/75 text-white backdrop-blur transition hover:bg-black focus-visible:ring-2 focus-visible:ring-white"
      >
        {playing ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play className="ml-0.5" size={16} fill="currentColor" />
        )}
      </button>}
      {!controls && <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
        <VolumeX size={11} /> Muted
      </span>}
    </div>
  );
}
