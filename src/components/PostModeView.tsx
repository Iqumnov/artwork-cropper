import React, { useState, useRef, useEffect } from 'react'
import { ArtworkInfo } from '../types'

interface PostModeViewProps {
  isOpen: boolean
  imageSrc: string
  artworkInfo: ArtworkInfo
  onUpdateArtworkInfo: (info: ArtworkInfo) => void
  onClose: () => void
}

export const PostModeView: React.FC<PostModeViewProps> = ({
  isOpen,
  imageSrc,
  artworkInfo,
  onUpdateArtworkInfo,
  onClose,
}) => {
  const [info, setInfo] = useState<ArtworkInfo>(artworkInfo)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const isLongPressingRef = useRef(false)
  const [pressProgress, setPressProgress] = useState(false)

  // Keep local info in sync when prop changes
  useEffect(() => {
    setInfo(artworkInfo)
  }, [artworkInfo])

  // Save changes on unmount or close
  useEffect(() => {
    return () => {
      onUpdateArtworkInfo(info)
    }
  }, [info, onUpdateArtworkInfo])

  // Keyboard escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onUpdateArtworkInfo(info)
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, info, onUpdateArtworkInfo, onClose])

  if (!isOpen) return null

  const handleFieldChange = (field: keyof ArtworkInfo, value: string) => {
    const updated = { ...info, [field]: value }
    setInfo(updated)
    onUpdateArtworkInfo(updated)
  }

  // Universal Long-Press Handler: Hold anywhere for 600ms to exit
  const handlePointerDown = (e: React.PointerEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY }
    isLongPressingRef.current = false
    setPressProgress(true)

    longPressTimerRef.current = setTimeout(() => {
      isLongPressingRef.current = true
      setPressProgress(false)
      if (navigator.vibrate) {
        try { navigator.vibrate(50) } catch {}
      }
      onUpdateArtworkInfo(info)
      onClose()
    }, 600)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!longPressTimerRef.current) return
    const dx = Math.abs(e.clientX - startPosRef.current.x)
    const dy = Math.abs(e.clientY - startPosRef.current.y)
    // Cancel if dragged or scrolled
    if (dx > 10 || dy > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
      setPressProgress(false)
    }
  }

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setPressProgress(false)
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-[9998] bg-[#faf8f8] flex items-center justify-center p-4 sm:p-8 select-none touch-none"
      style={{
        backgroundColor: '#faf8f8',
        cursor: 'default',
        overscrollBehavior: 'none',
      }}
    >
      {/* Subtle Visual Press Feedback Bar */}
      {pressProgress && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#0f0b0c]/30 z-[9999] animate-pulse pointer-events-none" />
      )}

      {/* 3:4 Post Card — Exact replica of ourdynasty layout and sizing */}
      <div
        className="w-full aspect-[3/4] max-h-full max-w-full bg-[#faf8f8] flex flex-col box-border"
        style={{
          maxHeight: 'calc(100vh - 2rem)',
          maxWidth: '100%',
        }}
      >
        {/* Artwork Image Container */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center mb-3 sm:mb-4 min-h-0">
          <img
            src={imageSrc}
            alt={info.title || 'Произведение искусства'}
            className="max-w-full max-h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Captions Section — Editable without blinking cursor */}
        <div className="flex flex-col items-center justify-center text-center pb-2 sm:pb-4 shrink-0 px-2 sm:px-4">
          {/* Editable Artwork Title */}
          <input
            type="text"
            value={info.title}
            placeholder="Название работы"
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="post-mode-input text-xl sm:text-2xl font-bold text-[#0f0b0c] mb-1 text-center w-full bg-transparent border-0 outline-none"
            style={{
              fontFamily: "'EBGaramond', Georgia, serif",
              caretColor: 'transparent',
              outline: 'none',
              lineHeight: 1.25,
            }}
          />

          {/* Editable Artist Name */}
          <input
            type="text"
            value={info.artist}
            placeholder="Имя автора"
            onChange={(e) => handleFieldChange('artist', e.target.value)}
            className="post-mode-input text-sm sm:text-base text-[#565051] mb-2 sm:mb-3 text-center w-full bg-transparent border-0 outline-none"
            style={{
              fontFamily: "'EBGaramond', Georgia, serif",
              caretColor: 'transparent',
              outline: 'none',
              lineHeight: 1.4,
            }}
          />

          {/* Editable Details: Medium · Dimensions · Year */}
          <div className="flex items-center justify-center flex-wrap gap-x-1.5 gap-y-1 text-xs sm:text-base text-[#565051] [font-variant-numeric:lining-nums_tabular-nums] max-w-full">
            <input
              type="text"
              value={info.medium || ''}
              placeholder="Техника"
              onChange={(e) => handleFieldChange('medium', e.target.value)}
              className="post-mode-input text-center bg-transparent border-0 outline-none"
              style={{
                fontFamily: "'EBGaramond', Georgia, serif",
                caretColor: 'transparent',
                outline: 'none',
                width: info.medium ? `${Math.max(4, info.medium.length + 1)}ch` : '10ch',
                maxWidth: '180px',
              }}
            />
            <span className="text-[#565051]/60 select-none">·</span>
            <input
              type="text"
              value={info.dimensions || ''}
              placeholder="Размер (напр. 80 × 60 см)"
              onChange={(e) => handleFieldChange('dimensions', e.target.value)}
              className="post-mode-input text-center bg-transparent border-0 outline-none"
              style={{
                fontFamily: "'EBGaramond', Georgia, serif",
                caretColor: 'transparent',
                outline: 'none',
                width: info.dimensions ? `${Math.max(6, info.dimensions.length + 1)}ch` : '18ch',
                maxWidth: '220px',
              }}
            />
            <span className="text-[#565051]/60 select-none">·</span>
            <input
              type="text"
              value={info.year || ''}
              placeholder="Год"
              onChange={(e) => handleFieldChange('year', e.target.value)}
              className="post-mode-input text-center bg-transparent border-0 outline-none"
              style={{
                fontFamily: "'EBGaramond', Georgia, serif",
                caretColor: 'transparent',
                outline: 'none',
                width: info.year ? `${Math.max(4, info.year.length + 1)}ch` : '5ch',
                maxWidth: '70px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Global Style Override to ensure NO blinking text cursor in post mode */}
      <style>{`
        .post-mode-input {
          caret-color: transparent !important;
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          -webkit-user-select: text;
          user-select: text;
        }
        .post-mode-input::placeholder {
          color: rgba(86, 80, 81, 0.4);
        }
      `}</style>
    </div>
  )
}
