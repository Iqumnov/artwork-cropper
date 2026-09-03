import React from 'react'
import { X, Download, Trash2, Clock } from 'lucide-react'
import { HistoryArtwork } from '../lib/history-storage'

interface ArtworkHistoryCarouselProps {
  items: HistoryArtwork[]
  onSelect: (item: HistoryArtwork) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  className?: string
}

export const ArtworkHistoryCarousel: React.FC<ArtworkHistoryCarouselProps> = ({
  items,
  onSelect,
  onDelete,
  onClearAll,
  className = ''
}) => {
  if (items.length === 0) return null

  const handleDownload = (item: HistoryArtwork) => {
    const a = document.createElement('a')
    a.href = item.dataUrl
    a.download = `${item.title.replace(/\s+/g, '_')}_${item.id.slice(-6)}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(ts).toLocaleDateString()
  }

  return (
    <div className={`w-full flex flex-col gap-2 select-none ${className}`}>
      {/* Header with Title and Clear All */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-white/70">
          <Clock className="w-3.5 h-3.5 text-[oklch(var(--brand-green))]" />
          <span className="text-xs font-semibold tracking-wide uppercase">
            Edit History ({items.length})
          </span>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-red-400 transition-colors cursor-pointer px-2 py-0.5 rounded-full hover:bg-white/5"
          title="Clear all history"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Horizontal Carousel (styled directly after ARTEI's adaptive-image-manager) */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {items.map((item, index) => {
          const aspectRatio = item.width && item.height ? item.width / item.height : 1
          const calculatedWidth = Math.max(70, Math.min(180, Math.round(100 * aspectRatio)))

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="relative group squircle-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-transform duration-200 active:scale-95"
              style={{
                height: '100px',
                width: `${calculatedWidth}px`,
                minWidth: `${calculatedWidth}px`
              }}
              title="Click to re-edit this artwork"
            >
              <img
                src={item.dataUrl}
                alt={item.title}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />

              {/* Time / Main Badge */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white/80 pointer-events-none">
                {index === 0 ? 'Latest' : formatTime(item.timestamp)}
              </div>

              {/* Delete Button (Matching /artei adaptive-image-manager) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                className="absolute top-1.5 right-1.5 text-white/80 hover:text-white p-1 squircle-full glass-pill hover:bg-red-500/80 transition-all z-10 hover:scale-110"
                title="Delete artwork from history"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Download Button (Matching /artei adaptive-image-manager) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(item)
                }}
                className="absolute bottom-1.5 right-1.5 text-white/80 hover:text-white p-1 squircle-full glass-pill hover:bg-white/25 transition-all z-10 hover:scale-110"
                title="Download artwork"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-medium text-white px-2 py-0.5 rounded-full bg-black/60">
                  Edit
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
