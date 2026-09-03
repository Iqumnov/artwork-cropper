import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Crop,
  Download,
  Share2,
  Undo2,
  Redo2,
  Eye,
  Activity,
  Clock,
  ChevronDown
} from 'lucide-react'
import { LightroomAdjustments } from '../types'
import { getDefaultAdjustments } from '../lib/presets'
import { applyLightroomAdjustments, computeHistogram } from '../lib/color-engine'
import { LightroomStudio } from './LightroomStudio'
import { CropStudio } from './CropStudio'
import { ExportModal } from './ExportModal'
import { Histogram } from './Histogram'
import { ArtworkHistoryCarousel } from './ArtworkHistoryCarousel'
import {
  getArtworkHistory,
  saveArtworkToHistory,
  deleteArtworkFromHistory,
  clearArtworkHistory,
  HistoryArtwork
} from '../lib/history-storage'

interface EditorViewProps {
  initialImageUrl: string
  initialAdjustments?: LightroomAdjustments
  initialArtworkId?: string
  onBack: () => void
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialImageUrl,
  initialAdjustments,
  initialArtworkId,
  onBack
}) => {
  const [artworkId, setArtworkId] = useState(initialArtworkId || `art_${Date.now()}`)
  const [baseImage, setBaseImage] = useState<HTMLImageElement | HTMLCanvasElement | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  // Current adjustments
  const [adjustments, setAdjustments] = useState<LightroomAdjustments>(
    initialAdjustments || getDefaultAdjustments()
  )

  // Undo / Redo History Stack
  const [history, setHistory] = useState<LightroomAdjustments[]>([
    initialAdjustments || getDefaultAdjustments()
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Before / After Press & Hold Toggle
  const [showBefore, setShowBefore] = useState(false)

  // Histogram Toggle & Data
  const [showHistogram, setShowHistogram] = useState(true)
  const [histogramData, setHistogramData] = useState<any>(null)

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false)

  // History Drawer Toggle & Items
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [historyItems, setHistoryItems] = useState<HistoryArtwork[]>([])

  // Viewport Pan & Zoom
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [touchDistance, setTouchDistance] = useState<number | null>(null)

  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadHistory = async () => {
    const items = await getArtworkHistory()
    setHistoryItems(items)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setBaseImage(img)
      resetViewport(img.naturalWidth, img.naturalHeight)
    }
    img.src = initialImageUrl
  }, [initialImageUrl])

  const resetViewport = (imgW: number, imgH: number) => {
    if (!viewportRef.current) return
    const rect = viewportRef.current.getBoundingClientRect()
    const fitX = (rect.width * 0.9) / imgW
    const fitY = (rect.height * 0.85) / imgH
    const fitScale = Math.min(fitX, fitY, 1.2)

    setZoom(fitScale)
    setPan({
      x: (rect.width - imgW * fitScale) / 2,
      y: (rect.height - imgH * fitScale) / 2
    })
  }

  const handleAdjustmentsChange = (nextAdj: LightroomAdjustments) => {
    setAdjustments(nextAdj)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(nextAdj)
    if (newHistory.length > 30) newHistory.shift()
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      setAdjustments(prev)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      setAdjustments(next)
    }
  }

  const renderCanvas = useCallback(() => {
    if (!baseImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(baseImage, 0, 0)

    if (showBefore) {
      const rawData = ctx.getImageData(0, 0, w, h)
      setHistogramData(computeHistogram(rawData))
      return
    }

    const imageData = ctx.getImageData(0, 0, w, h)
    applyLightroomAdjustments(imageData, adjustments)
    ctx.putImageData(imageData, 0, 0)

    setHistogramData(computeHistogram(imageData))
  }, [baseImage, adjustments, showBefore])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  const saveSnapshotToHistory = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    saveArtworkToHistory({
      id: artworkId,
      title: 'Edited Artwork',
      dataUrl,
      originalUrl: initialImageUrl,
      adjustments,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height
    })
    loadHistory()
  }

  const handleDirectDownload = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `artwork_${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    saveSnapshotToHistory()
  }

  const handleCropComplete = (croppedCanvas: HTMLCanvasElement) => {
    setBaseImage(croppedCanvas)
    setIsCropping(false)
    resetViewport(croppedCanvas.width, croppedCanvas.height)
    saveSnapshotToHistory()
  }

  const handleSelectHistoryArtwork = (item: HistoryArtwork) => {
    const img = new Image()
    img.onload = () => {
      setBaseImage(img)
      setArtworkId(item.id)
      if (item.adjustments) {
        setAdjustments(item.adjustments)
        setHistory([item.adjustments])
        setHistoryIndex(0)
      }
      resetViewport(img.naturalWidth, img.naturalHeight)
      setShowHistoryDrawer(false)
    }
    img.src = item.originalUrl || item.dataUrl
  }

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteArtworkFromHistory(id)
    setHistoryItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleClearAllHistory = async () => {
    await clearArtworkHistory()
    setHistoryItems([])
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY < 0 ? 1.12 : 0.88
    setZoom((z) => Math.max(0.15, Math.min(8, z * factor)))
  }

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsPanning(true)
    setPanStart({ x: clientX - pan.x, y: clientY - pan.y })
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isPanning) return
    setPan({
      x: clientX - panStart.x,
      y: clientY - panStart.y
    })
  }

  const handlePointerUp = () => {
    setIsPanning(false)
  }

  const handleDoubleClick = () => {
    if (baseImage) {
      const imgW = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
      const imgH = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
      resetViewport(imgW, imgH)
    }
  }

  const w = baseImage ? (baseImage as HTMLImageElement).naturalWidth || baseImage.width : 0
  const h = baseImage ? (baseImage as HTMLImageElement).naturalHeight || baseImage.height : 0

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden bg-[#faf8f8] text-[#0f0b0c] select-none relative">
      {/* Top App Bar — strictly functional controls, no logo or branding title */}
      <header className="flex items-center justify-between px-3 py-2 z-30 border-b border-[#e3dbdc] bg-[#faf8f8] shrink-0">
        {/* Left Section: Back & History */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveSnapshotToHistory()
              onBack()
            }}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
            title="Back to Studio"
          >
            <ArrowLeft className="w-4 h-4 text-[#565051]" />
          </button>

          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
              showHistoryDrawer
                ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                : 'bg-transparent border-[#e3dbdc] hover:border-[#34292a] text-[#0f0b0c]'
            }`}
            title="View edit history"
          >
            <Clock className="w-3.5 h-3.5 text-[#565051]" />
            <span className="hidden sm:inline">History</span>
            {historyItems.length > 0 && (
              <span className="text-[10px] text-[#565051] ml-0.5">
                ({historyItems.length})
              </span>
            )}
          </button>
        </div>

        {/* Center Section: Undo/Redo, Crop, Before, Histogram */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] disabled:opacity-30 transition-colors cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5 text-[#565051]" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] disabled:opacity-30 transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5 text-[#565051]" />
          </button>

          <button
            onClick={() => setIsCropping(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs border border-[#e3dbdc] hover:border-[#34292a] bg-transparent text-[#0f0b0c] transition-colors cursor-pointer ml-1"
            title="Perspective Scanner Crop"
          >
            <Crop className="w-3.5 h-3.5 text-[#565051]" />
            <span>Crop</span>
          </button>

          <button
            onMouseDown={() => setShowBefore(true)}
            onMouseUp={() => setShowBefore(false)}
            onMouseLeave={() => setShowBefore(false)}
            onTouchStart={() => setShowBefore(true)}
            onTouchEnd={() => setShowBefore(false)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
              showBefore
                ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                : 'bg-transparent border-[#e3dbdc] hover:border-[#34292a] text-[#0f0b0c]'
            }`}
            title="Hold to see original unedited photo"
          >
            <Eye className="w-3.5 h-3.5 text-[#565051]" />
            <span className="hidden sm:inline">Before</span>
          </button>

          <button
            onClick={() => setShowHistogram(!showHistogram)}
            className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer ${
              showHistogram
                ? 'border-[#34292a] bg-[#e3dbdc]/30 text-[#0f0b0c]'
                : 'border-[#e3dbdc] text-[#565051]'
            }`}
            title="Toggle Histogram"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Section: Direct Download & Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDirectDownload}
            className="flex items-center gap-1.5 px-3.5 py-1 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] hover:border-[#34292a] text-[#faf8f8] text-xs font-normal transition-colors cursor-pointer"
            title="Direct 1-Click Download"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
            title="Export Options"
          >
            <Share2 className="w-3.5 h-3.5 text-[#565051]" />
          </button>
        </div>
      </header>

      {/* History Drawer Overlay (Slide-down from top bar) */}
      {showHistoryDrawer && (
        <div className="absolute top-11 left-0 right-0 z-40 bg-[#faf8f8] border-b border-[#e3dbdc] p-3 shadow-lg">
          <div className="max-w-xl mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#0f0b0c] font-normal tracking-wide">Switch / Re-edit Artwork</span>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-[#565051] hover:text-[#0f0b0c] text-xs p-1"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            {historyItems.length > 0 ? (
              <ArtworkHistoryCarousel
                items={historyItems}
                onSelect={handleSelectHistoryArtwork}
                onDelete={handleDeleteHistoryItem}
                onClearAll={handleClearAllHistory}
              />
            ) : (
              <div className="text-xs text-[#565051] text-center py-4">No edit history yet</div>
            )}
          </div>
        </div>
      )}

      {/* Center Image Viewport */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing touch-none flex items-center justify-center bg-[#f5f3f3]"
        onWheel={handleWheel}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
          } else if (e.touches.length === 2) {
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            )
            setTouchDistance(dist)
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
          } else if (e.touches.length === 2 && touchDistance !== null) {
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            )
            const factor = dist / touchDistance
            setZoom((z) => Math.max(0.2, Math.min(6, z * factor)))
            setTouchDistance(dist)
          }
        }}
        onTouchEnd={() => {
          handlePointerUp()
          setTouchDistance(null)
        }}
      >
        {/* Floating Mini Histogram */}
        {showHistogram && (
          <div className="absolute top-3 right-3 z-20 pointer-events-none">
            <Histogram data={histogramData} />
          </div>
        )}

        {/* Before indicator watermark */}
        {showBefore && (
          <div className="absolute top-4 left-4 z-20 px-2.5 py-1 bg-[#faf8f8] border border-[#e3dbdc] text-[11px] font-mono tracking-wider text-[#0f0b0c] uppercase pointer-events-none">
            Original Unedited
          </div>
        )}

        {/* Viewport Canvas Container */}
        <div
          className="absolute origin-top-left pointer-events-none shadow-md transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: w,
            height: h
          }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-2 left-3 z-10 text-[10px] font-mono text-[#565051] pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Bottom Lightroom Controls Drawer */}
      <div className="shrink-0 z-30 border-t border-[#e3dbdc] bg-[#faf8f8]">
        <LightroomStudio
          adjustments={adjustments}
          onChange={handleAdjustmentsChange}
          onReset={() => handleAdjustmentsChange(getDefaultAdjustments())}
        />
      </div>

      {/* Crop & Perspective Modal Overlay */}
      {isCropping && baseImage && (
        <CropStudio
          imageSource={baseImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropping(false)}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        canvas={canvasRef.current}
      />
    </div>
  )
}
