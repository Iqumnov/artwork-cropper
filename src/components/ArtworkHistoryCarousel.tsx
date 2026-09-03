import React from 'react'
import { Trash2, Download, Clock } from 'lucide-react'
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
    a.download = `artwork_${item.id.slice(-6)}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return 'Только что'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
    return new Date(ts).toLocaleDateString('ru-RU')
  }

  return (
    <div className={`w-full flex flex-col gap-2 select-none ${className}`}>
      {/* Header with Title and Clear All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#0f0b0c]">
          <Clock className="w-3.5 h-3.5 text-[#565051]" />
          <span className="text-xs font-normal tracking-wider uppercase">
            История изменений ({items.length})
          </span>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer px-2 py-0.5 border border-transparent hover:border-[#e3dbdc]"
          title="Очистить всю историю"
        >
          <Trash2 className="w-3 h-3" />
          <span>Очистить всё</span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
        {items.map((item) => {
          const aspectRatio = item.width && item.height ? item.width / item.height : 1
          const calculatedWidth = Math.max(70, Math.min(180, Math.round(90 * aspectRatio)))

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="relative group overflow-hidden bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-200"
              style={{
                height: '90px',
                width: `${calculatedWidth}px`,
                minWidth: `${calculatedWidth}px`
              }}
              title="Нажмите для повторного редактирования"
            >
              <img
                src={item.dataUrl}
                alt={item.title}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />

              {/* Timestamp Badge (No 'Latest' tag) */}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#faf8f8]/95 border border-[#e3dbdc] text-[9px] font-mono text-[#0f0b0c] pointer-events-none">
                {formatTime(item.timestamp)}
              </div>

              {/* Delete Button (Trash2 Icon) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                className="absolute top-1 right-1 text-[#565051] bg-[#faf8f8]/95 border border-[#e3dbdc] hover:border-[#34292a] hover:bg-[#34292a] hover:text-[#faf8f8] p-1 transition-colors z-10"
                title="Удалить из истории"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {/* Download Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(item)
                }}
                className="absolute bottom-1 right-1 text-[#565051] bg-[#faf8f8]/95 border border-[#e3dbdc] hover:border-[#34292a] hover:bg-[#0f0b0c] hover:text-[#faf8f8] p-1 transition-colors z-10"
                title="Скачать изображение"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
