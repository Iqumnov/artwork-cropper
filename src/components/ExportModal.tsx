import React, { useState, useEffect, useMemo } from 'react'
import { X, Download, Copy, Check, RotateCcw, LayoutTemplate, ChevronLeft, ChevronRight } from 'lucide-react'
import { ArtworkInfo } from '../types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExportComplete?: () => void
  canvas: HTMLCanvasElement | null
  originalFileName?: string
  artworkTitle?: string
  artworkInfo?: ArtworkInfo
  onUpdateArtworkInfo?: (info: ArtworkInfo) => void
  queueTotal?: number
  queueCurrentIndex?: number
  onNextImage?: () => void
  onPrevImage?: () => void
}

function createPostCanvas(
  artworkCanvas: HTMLCanvasElement,
  info: ArtworkInfo
): HTMLCanvasElement {
  const postW = 1200
  const postH = 1600

  const canvas = document.createElement('canvas')
  canvas.width = postW
  canvas.height = postH
  const ctx = canvas.getContext('2d')
  if (!ctx) return artworkCanvas

  // Background matching design system #faf8f8
  ctx.fillStyle = '#faf8f8'
  ctx.fillRect(0, 0, postW, postH)

  // Artwork Container: 74% of total height, with 64px margins
  const marginX = 64
  const marginTop = 64
  const artAreaW = postW - marginX * 2
  const artAreaH = Math.round(postH * 0.72)

  // Fit artwork preserving aspect ratio
  const artAspect = artworkCanvas.width / artworkCanvas.height
  const containerAspect = artAreaW / artAreaH

  let drawW = artAreaW
  let drawH = artAreaH
  if (artAspect > containerAspect) {
    drawW = artAreaW
    drawH = Math.round(artAreaW / artAspect)
  } else {
    drawH = artAreaH
    drawW = Math.round(artAreaH * artAspect)
  }

  const drawX = marginX + Math.round((artAreaW - drawW) / 2)
  const drawY = marginTop + Math.round((artAreaH - drawH) / 2)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(artworkCanvas, drawX, drawY, drawW, drawH)

  // Captions Area below artwork
  const captionsStartY = marginTop + artAreaH + 48
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  let currentY = captionsStartY

  // Title: EBGaramond, bold, 38px, color #0f0b0c
  if (info.title && info.title.trim()) {
    ctx.font = '600 38px "EBGaramond", Georgia, serif'
    ctx.fillStyle = '#0f0b0c'
    ctx.fillText(info.title.trim(), postW / 2, currentY)
    currentY += 46
  }

  // Artist: EBGaramond, normal, 26px, color #565051
  if (info.artist && info.artist.trim()) {
    ctx.font = '400 26px "EBGaramond", Georgia, serif'
    ctx.fillStyle = '#565051'
    ctx.fillText(info.artist.trim(), postW / 2, currentY)
    currentY += 38
  }

  // Details: Medium · Dimensions · Year
  const detailsParts: string[] = []
  if (info.medium && info.medium.trim()) detailsParts.push(info.medium.trim())
  if (info.dimensions && info.dimensions.trim()) detailsParts.push(info.dimensions.trim())
  if (info.year && info.year.trim()) detailsParts.push(info.year.trim())

  if (detailsParts.length > 0) {
    ctx.font = '400 20px "EBGaramond", Georgia, serif'
    ctx.fillStyle = '#565051'
    ctx.fillText(detailsParts.join(' · '), postW / 2, currentY)
  }

  return canvas
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExportComplete,
  canvas,
  originalFileName,
  artworkTitle,
  artworkInfo,
  onUpdateArtworkInfo,
  queueTotal,
  queueCurrentIndex,
  onNextImage,
  onPrevImage,
}) => {
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [quality, setQuality] = useState(0.92)
  const [copied, setCopied] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState<string>('')
  const [isExportAsPost, setIsExportAsPost] = useState(false)

  // Local editable artwork fields
  const [localInfo, setLocalInfo] = useState<ArtworkInfo>(() => ({
    title: artworkInfo?.title || artworkTitle || '',
    artist: artworkInfo?.artist || '',
    medium: artworkInfo?.medium || '',
    dimensions: artworkInfo?.dimensions || '',
    year: artworkInfo?.year || ''
  }))

  useEffect(() => {
    if (isOpen && artworkInfo) {
      setLocalInfo({
        title: artworkInfo.title || artworkTitle || '',
        artist: artworkInfo.artist || '',
        medium: artworkInfo.medium || '',
        dimensions: artworkInfo.dimensions || '',
        year: artworkInfo.year || ''
      })
    }
  }, [isOpen, artworkInfo, artworkTitle])

  const handleInfoChange = (field: keyof ArtworkInfo, value: string) => {
    const updated = { ...localInfo, [field]: value }
    setLocalInfo(updated)
    if (onUpdateArtworkInfo) {
      onUpdateArtworkInfo(updated)
    }
  }

  // Clean original file name (remove extension)
  const getCleanOriginalName = () => {
    if (!originalFileName) return `artwork_${Date.now()}`
    return originalFileName.replace(/\.[^/.]+$/, '').trim() || `artwork_${Date.now()}`
  }

  // Initial file name: prioritizes artworkTitle, then originalFileName
  const getDefaultName = () => {
    const title = localInfo.title || artworkTitle
    if (title && title.trim().length > 0) {
      return title.trim()
    }
    return getCleanOriginalName()
  }

  const [fileName, setFileName] = useState<string>(getDefaultName)

  // Reset file name when modal opens or inputs change
  useEffect(() => {
    if (isOpen) {
      setFileName(getDefaultName())
    }
  }, [isOpen, artworkTitle, originalFileName])

  // Get final active canvas (post canvas or direct artwork canvas)
  const activeCanvas = useMemo(() => {
    if (!canvas) return null
    if (isExportAsPost) {
      return createPostCanvas(canvas, localInfo)
    }
    return canvas
  }, [canvas, isExportAsPost, localInfo])

  useEffect(() => {
    if (!activeCanvas || !isOpen) return
    activeCanvas.toBlob(
      (blob) => {
        if (blob) {
          const kb = blob.size / 1024
          if (kb >= 1024) {
            setEstimatedSize(`${(kb / 1024).toFixed(2)} МБ`)
          } else {
            setEstimatedSize(`${Math.round(kb)} КБ`)
          }
        }
      },
      format,
      quality
    )
  }, [activeCanvas, format, quality, isOpen])

  if (!isOpen || !canvas) return null

  const width = activeCanvas ? activeCanvas.width : canvas.width
  const height = activeCanvas ? activeCanvas.height : canvas.height
  const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'

  const handleDownload = () => {
    if (!activeCanvas) return
    const safeName = (fileName.trim() || getDefaultName()).replace(/[/\\?%*:|"<>]/g, '-')
    const suffix = isExportAsPost ? '_post' : ''
    const dataUrl = activeCanvas.toDataURL(format, quality)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${safeName}${suffix}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    if (onExportComplete) onExportComplete()
    onClose()
  }

  const handleResetToOriginal = () => {
    setFileName(getCleanOriginalName())
  }

  const handleCopyToClipboard = async () => {
    if (!activeCanvas) return
    try {
      activeCanvas.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    } catch (e) {
      console.error('Copy to clipboard failed:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#faf8f8] border border-[#e3dbdc] p-5 sm:p-6 max-w-md w-full shadow-xl flex flex-col gap-3.5 text-[#0f0b0c] max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header without additional border */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-base font-normal text-[#0f0b0c] tracking-tight m-0">
                Экспорт работы
              </h3>
              <p className="text-xs text-[#565051] font-mono mt-0.5">
                {width} × {height} px {isExportAsPost ? '(Пост 3:4) ' : ''}{estimatedSize ? `• ~${estimatedSize}` : ''}
              </p>
            </div>
            {queueTotal && queueTotal > 1 ? (
              <div className="flex items-center border border-[#34292a] bg-white text-xs select-none shadow-xs ml-1">
                <button
                  type="button"
                  onClick={onPrevImage}
                  disabled={queueCurrentIndex === 0}
                  className="w-6 h-6 flex items-center justify-center text-[#0f0b0c] hover:bg-[#faf8f8] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Предыдущее фото"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="px-1.5 font-mono font-medium text-xs text-[#0f0b0c] whitespace-nowrap">
                  {(queueCurrentIndex ?? 0) + 1} / {queueTotal}
                </span>
                <button
                  type="button"
                  onClick={onNextImage}
                  disabled={queueCurrentIndex === queueTotal - 1}
                  className="w-6 h-6 flex items-center justify-center text-[#0f0b0c] hover:bg-[#faf8f8] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Следующее фото"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toggle: Export as Post (3:4) */}
        <div className="flex items-center justify-between p-2.5 bg-white border border-[#e3dbdc] hover:border-[#34292a] transition-colors">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-[#565051]" />
            <div className="flex flex-col">
              <span className="text-xs font-normal text-[#0f0b0c]">Экспортировать как пост</span>
              <span className="text-xs text-[#565051]">Карточка 3:4 с подписью автора и техники</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExportAsPost(!isExportAsPost)}
            className={`w-10 h-5 border transition-colors flex items-center px-0.5 cursor-pointer ${
              isExportAsPost ? 'bg-[#0f0b0c] border-[#0f0b0c]' : 'bg-[#e3dbdc] border-[#e3dbdc]'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white transition-transform ${
                isExportAsPost ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Artwork Metadata Fields (Visible when Export as Post is active) */}
        {isExportAsPost && (
          <div className="flex flex-col gap-2 p-3 bg-white border border-[#e3dbdc]">
            <span className="text-xs font-normal uppercase tracking-wider text-[#565051]">
              Данные для карточки поста
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#565051]">Название работы</label>
                <input
                  type="text"
                  value={localInfo.title}
                  onChange={(e) => handleInfoChange('title', e.target.value)}
                  placeholder="Название картины..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#565051]">Автор</label>
                <input
                  type="text"
                  value={localInfo.artist}
                  onChange={(e) => handleInfoChange('artist', e.target.value)}
                  placeholder="Имя автора..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#565051]">Техника</label>
                <input
                  type="text"
                  value={localInfo.medium || ''}
                  onChange={(e) => handleInfoChange('medium', e.target.value)}
                  placeholder="Холст, масло..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#565051]">Размер</label>
                <input
                  type="text"
                  value={localInfo.dimensions || ''}
                  onChange={(e) => handleInfoChange('dimensions', e.target.value)}
                  placeholder="80 × 60 см..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#565051]">Год создания</label>
                <input
                  type="text"
                  value={localInfo.year || ''}
                  onChange={(e) => handleInfoChange('year', e.target.value)}
                  placeholder="2024..."
                  className="px-2 py-1 text-xs border border-[#e3dbdc] focus:border-[#34292a] outline-none text-[#0f0b0c] bg-[#faf8f8]"
                />
              </div>
            </div>
          </div>
        )}

        {/* File Name Field with Reset Button */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-normal text-[#565051] uppercase tracking-wider">
              Название файла
            </label>
            <button
              type="button"
              onClick={handleResetToOriginal}
              className="flex items-center gap-1 text-[11px] text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer"
              title="Вернуться к изначальному названию файла"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить</span>
            </button>
          </div>

          <div className="flex items-center border border-[#e3dbdc] hover:border-[#34292a] bg-white transition-colors">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Введите название..."
              className="flex-1 px-2.5 py-1.5 text-xs text-[#0f0b0c] bg-transparent outline-none border-none"
            />
            <span className="px-2 text-xs font-mono text-[#565051] select-none bg-[#faf8f8] border-l border-[#e3dbdc] py-1.5">
              {isExportAsPost ? '_post' : ''}.{ext}
            </span>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-normal text-[#565051] uppercase tracking-wider">
            Формат файла
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'image/jpeg', label: 'JPG' },
              { id: 'image/png', label: 'PNG' },
              { id: 'image/webp', label: 'WebP' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`py-1.5 text-xs font-normal transition-colors border cursor-pointer ${
                  format === f.id
                    ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                    : 'bg-white border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (for JPG and WebP) */}
        {format !== 'image/png' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#565051] font-normal uppercase tracking-wider">
                Качество сжатия
              </span>
              <span className="font-mono text-[#0f0b0c]">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full lr-slider"
            />
          </div>
        )}

        {/* Dynamic Estimated Size readout */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="text-[#565051]">Примерный размер:</span>
          <span className="font-mono text-[#0f0b0c] font-normal">
            {estimatedSize || 'расчёт...'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] hover:border-[#34292a] text-[#faf8f8] text-xs font-normal flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Скачать {isExportAsPost ? 'карточку поста' : 'файл'}</span>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="w-full py-2 bg-white hover:bg-[#faf8f8] border border-[#e3dbdc] hover:border-[#34292a] text-[#0f0b0c] text-xs font-normal flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Скопировано в буфер!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#565051]" />
                <span>Копировать в буфер</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
