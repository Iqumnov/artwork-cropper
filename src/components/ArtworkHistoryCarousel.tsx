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

  const handleDownload = (e: React.MouseEvent, item: HistoryArtwork) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = item.dataUrl
    a.download = `artwork_${item.id.slice(-6)}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    onDelete(id)
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
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer px-1.5 py-0.5 border border-transparent hover:border-[#e3dbdc]"
          title="Очистить всю историю"
        >
          <Trash2 className="w-3 h-3" />
          <span>Очистить всё</span>
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {items.map((item) => {
          const aspectRatio = item.width && item.height ? item.width / item.height : 1
          const calculatedWidth = Math.max(88, Math.min(160, Math.round(72 * aspectRatio)))

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex flex-col bg-white border border-[#e3dbdc] hover:border-[#34292a] shrink-0 cursor-pointer transition-colors duration-200 group"
              style={{
                width: `${calculatedWidth}px`,
                minWidth: `${calculatedWidth}px`
              }}
              title="Нажмите для редактирования"
            >
              {/* Clean Image View */}
              <div className="relative w-full h-[68px] overflow-hidden bg-[#faf8f8] flex items-center justify-center">
                <img
                  src={item.dataUrl}
                  alt={item.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  loading="lazy"
                />
              </div>

              {/* Tags & Action Buttons UNDER the Image */}
              <div className="flex items-center justify-between px-1.5 py-1 border-t border-[#e3dbdc] bg-[#faf8f8]">
                <span className="text-[9px] font-mono text-[#565051] truncate max-w-[55%]">
                  {formatTime(item.timestamp)}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, item)}
                    className="text-[#565051] hover:text-[#0f0b0c] p-0.5 transition-colors cursor-pointer"
                    title="Скачать файл"
                  >
                    <Download className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="text-[#565051] hover:text-[#0f0b0c] p-0.5 transition-colors cursor-pointer"
                    title="Удалить из истории"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
