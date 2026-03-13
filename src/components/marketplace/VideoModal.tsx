import { useState } from "react";

interface Video {
  id: string;
  title: string;
  type?: "video" | "short";
}

interface Props {
  serverName: string;
  videos: Video[];
  onClose: () => void;
}

function VideoModal({ serverName, videos, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = videos[activeIndex];
  const isShort = active.type === "short";
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < videos.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div
        className={`relative bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden w-full mx-4 ${
          isShort ? "max-w-2xl" : "max-w-4xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-red-500/15 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">{serverName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-overlay text-text-muted font-medium">
                  {videos.length} tutorial{videos.length !== 1 ? "s" : ""}
                </span>
                {isShort && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">
                    Short
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-muted truncate max-w-xs mt-0.5">{active.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1 rounded hover:bg-surface-overlay transition-colors flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0" style={{ height: isShort ? "560px" : "440px" }}>
          {/* Player */}
          <div className={`bg-black flex items-center justify-center min-w-0 ${isShort ? "flex-none w-[315px]" : "flex-1"}`}>
            <iframe
              key={active.id}
              src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1&rel=0&modestbranding=1&color=white`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Playlist sidebar */}
          {videos.length > 1 && (
            <div className="flex-1 border-l border-border flex flex-col bg-base/50 min-w-0">
              <div className="px-3 py-2 border-b border-border flex-shrink-0">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Playlist · {activeIndex + 1} / {videos.length}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {videos.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveIndex(i)}
                    className={`w-full text-left p-2.5 border-b border-border/40 transition-colors group ${
                      i === activeIndex
                        ? "bg-primary/8 border-l-2 border-l-primary"
                        : "hover:bg-surface-overlay border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex gap-2.5 items-start">
                      {/* Thumbnail — portrait for Shorts, landscape otherwise */}
                      <div
                        className={`relative flex-shrink-0 rounded overflow-hidden bg-surface-overlay ${
                          v.type === "short" ? "w-[25px] h-[45px]" : "w-20 h-[45px]"
                        }`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {i === activeIndex && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-primary/90 flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-base ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Title + number */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] leading-snug line-clamp-2 ${i === activeIndex ? "text-primary font-medium" : "text-text-muted group-hover:text-text"}`}>
                          {v.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-mono ${i === activeIndex ? "text-primary/60" : "text-text-muted/40"}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {v.type === "short" && (
                            <span className="text-[9px] px-1 rounded bg-red-500/10 text-red-400/70 font-medium">Short</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — prev/next nav */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border flex-shrink-0">
          <button
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            disabled={!hasPrev}
            className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <span className="text-[11px] text-text-muted/50 font-mono">{activeIndex + 1} / {videos.length}</span>
          <button
            onClick={() => setActiveIndex((i) => Math.min(videos.length - 1, i + 1))}
            disabled={!hasNext}
            className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoModal;
