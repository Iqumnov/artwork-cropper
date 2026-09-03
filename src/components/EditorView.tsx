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

  // Load History items
  const loadHistory = async () => {
    const items = await getArtworkHistory()
    setHistoryItems(items)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Load initial image into baseImage
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setBaseImage(img)
      resetViewport(img.naturalWidth, img.naturalHeight)
    }
    img.src = initialImageUrl
  }, [initialImageUrl])

  // Center & fit image in viewport
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

  // Record adjustments history
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

  // Render pipeline: Draws base image, executes color correction filter, updates histogram
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

    // If 'showBefore' is active, show unmodified base image
    if (showBefore) {
      const rawData = ctx.getImageData(0, 0, w, h)
      setHistogramData(computeHistogram(rawData))
      return
    }

    // Apply Lightroom color processing
    const imageData = ctx.getImageData(0, 0, w, h)
    applyLightroomAdjustments(imageData, adjustments)
    ctx.putImageData(imageData, 0, 0)

    // Update histogram
    setHistogramData(computeHistogram(imageData))
  }, [baseImage, adjustments, showBefore])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Save current snapshot into persistent history
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

  // 1-Click Direct Download Button
  const handleDirectDownload = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `artei_edit_${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    saveSnapshotToHistory()
  }

  // Crop completion callback
  const handleCropComplete = (croppedCanvas: HTMLCanvasElement) => {
    setBaseImage(croppedCanvas)
    setIsCropping(false)
    resetViewport(croppedCanvas.width, croppedCanvas.height)
    saveSnapshotToHistory()
  }

  // Select another artwork from History carousel
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

  // Pan & Zoom gestures
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
    <div className="h-full w-full flex flex-col justify-between overflow-hidden bg-[#0c0d0e] select-none relative">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-3 py-2 z-30 glass-panel border-b border-white/10 shrink-0">
        {/* Left Section: Back, Logo & History Drawer Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveSnapshotToHistory()
              onBack()
            }}
            className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
            title="Back to Upload"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shadow">
            <img src="/artei-logo.svg" alt="ARTEI" className="w-full h-full object-contain" />
          </div>

          {/* History Drawer Toggle Button */}
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 squircle-full text-xs font-medium transition-all ${
              showHistoryDrawer
                ? 'bg-white text-black font-semibold shadow'
                : 'glass-pill text-white/80 hover:text-white'
            }`}
            title="View edit history"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {historyItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Center Section: Undo/Redo & Crop Launcher */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 transition-transform active:scale-95"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 transition-transform active:scale-95"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Crop & Perspective Tool Button */}
          <button
            onClick={() => setIsCropping(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 squircle-full glass-pill text-xs font-medium text-white hover:bg-white/15 transition-transform active:scale-95 ml-0.5"
            title="Perspective Scanner Crop"
          >
            <Crop className="w-3.5 h-3.5 text-white" />
            <span>Crop</span>
          </button>

          {/* Before / After Hold Toggle */}
          <button
            onMouseDown={() => setShowBefore(true)}
            onMouseUp={() => setShowBefore(false)}
            onMouseLeave={() => setShowBefore(false)}
            onTouchStart={() => setShowBefore(true)}
            onTouchEnd={() => setShowBefore(false)}
            className={`flex items-center gap-1 px-2.5 py-1.5 squircle-full text-xs font-medium transition-all ${
              showBefore
                ? 'bg-white text-black font-bold scale-105'
                : 'glass-pill text-white/70 hover:text-white'
            }`}
            title="Hold to see original unedited photo"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Before</span>
          </button>

          {/* Histogram Toggle */}
          <button
            onClick={() => setShowHistogram(!showHistogram)}
            className={`w-8 h-8 squircle-full text-xs flex items-center justify-center transition-all ${
              showHistogram ? 'glass-pill text-white' : 'text-white/40 hover:text-white'
            }`}
            title="Toggle Histogram"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Section: Direct Download & Export Dialog */}
        <div className="flex items-center gap-1.5">
          {/* Direct 1-Click Download Button */}
          <button
            onClick={handleDirectDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 squircle-full bg-[oklch(var(--button-green))] hover:bg-[oklch(var(--button-green-hover))] text-white text-xs font-semibold shadow-md transition-transform active:scale-95"
            title="Direct 1-Click Download"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Export Options Modal Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
            title="Export Options (PNG, WebP, Quality)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* History Drawer Overlay (Slide-down from top bar) */}
      {showHistoryDrawer && (
        <div className="absolute top-12 left-0 right-0 z-40 bg-[#141619]/95 backdrop-blur-xl border-b border-white/10 p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-xl mx-auto flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/90">Switch / Re-edit Artwork</span>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="text-white/50 hover:text-white text-xs p-1"
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
              <div className="text-xs text-white/40 text-center py-4">No edit history yet</div>
            )}
          </div>
        </div>
      )}

      {/* Center Image Viewport (Strictly non-scrollable, gesture pan/zoom) */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing touch-none flex items-center justify-center bg-[#090a0c]"
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
          <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-[11px] font-mono tracking-wider text-white uppercase pointer-events-none">
            Original Unedited
          </div>
        )}

        {/* Viewport Canvas Container */}
        <div
          className="absolute origin-top-left pointer-events-none shadow-2xl transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: w,
            height: h
          }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-2 left-3 z-10 text-[10px] font-mono text-white/30 pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Bottom Lightroom Controls Drawer */}
      <div className="shrink-0 z-30">
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
