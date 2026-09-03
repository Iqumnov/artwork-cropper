import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Crop,
  Download,
  Undo2,
  Redo2,
  Eye,
  Activity
} from 'lucide-react'
import { LightroomAdjustments } from '../types'
import { getDefaultAdjustments } from '../lib/presets'
import { applyLightroomAdjustments, computeHistogram } from '../lib/color-engine'
import { LightroomStudio } from './LightroomStudio'
import { CropStudio } from './CropStudio'
import { ExportModal } from './ExportModal'
import { Histogram } from './Histogram'

interface EditorViewProps {
  initialImageUrl: string
  onBack: () => void
}

export const EditorView: React.FC<EditorViewProps> = ({ initialImageUrl, onBack }) => {
  // Base image (can be modified by crop)
  const [baseImage, setBaseImage] = useState<HTMLImageElement | HTMLCanvasElement | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  // Current adjustments
  const [adjustments, setAdjustments] = useState<LightroomAdjustments>(getDefaultAdjustments())

  // Undo / Redo History Stack
  const [history, setHistory] = useState<LightroomAdjustments[]>([getDefaultAdjustments()])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Before / After Press & Hold Toggle
  const [showBefore, setShowBefore] = useState(false)

  // Histogram Toggle & Data
  const [showHistogram, setShowHistogram] = useState(true)
  const [histogramData, setHistogramData] = useState<any>(null)

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false)

  // Viewport Pan & Zoom
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Touch pinch-to-zoom tracking
  const [touchDistance, setTouchDistance] = useState<number | null>(null)

  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Record history snapshot (debounced or on user pause)
  const handleAdjustmentsChange = (nextAdj: LightroomAdjustments) => {
    setAdjustments(nextAdj)

    // Append to history stack
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

  // Crop completion callback
  const handleCropComplete = (croppedCanvas: HTMLCanvasElement) => {
    setBaseImage(croppedCanvas)
    setIsCropping(false)
    resetViewport(croppedCanvas.width, croppedCanvas.height)
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

  // Double tap / double click to reset zoom
  const handleDoubleClick = () => {
    if (baseImage) {
      const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
      const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
      resetViewport(w, h)
    }
  }

  const w = baseImage ? ((baseImage as HTMLImageElement).naturalWidth || baseImage.width) : 0
  const h = baseImage ? ((baseImage as HTMLImageElement).naturalHeight || baseImage.height) : 0

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden bg-[#0c0d0e] select-none">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-3.5 py-2.5 z-30 glass-panel border-b border-white/10 shrink-0">
        {/* Left Section: Back & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
            title="Back to Upload"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shadow">
            <img src="/artei-logo.svg" alt="ARTEI" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-white hidden sm:inline">
            ARTEI STUDIO
          </span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 squircle-full glass-pill text-xs font-medium text-white hover:bg-white/15 transition-transform active:scale-95 ml-1"
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
              showBefore ? 'bg-white text-black font-bold scale-105' : 'glass-pill text-white/70 hover:text-white'
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

        {/* Right Section: Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 squircle-full bg-[oklch(var(--button-green))] hover:bg-[oklch(var(--button-green-hover))] text-white text-xs font-medium shadow-md transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold">Export</span>
          </button>
        </div>
      </header>

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
