import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Download,
  Share2,
  Undo2,
  Redo2,
  Eye,
  Clock
} from 'lucide-react'
import {
  LightroomAdjustments,
  ScanPoint,
  CropArea,
  AspectRatio,
  EditorTab,
  ASPECT_RATIOS
} from '../types'
import { getDefaultAdjustments } from '../lib/presets'
import { applyLightroomAdjustments } from '../lib/color-engine'
import { warpPerspectiveCanvas, detectDocumentCorners } from '../lib/perspective-warp'
import { LightroomStudio } from './LightroomStudio'
import { ExportModal } from './ExportModal'
import { ArtworkHistoryCarousel } from './ArtworkHistoryCarousel'
import {
  getArtworkHistory,
  saveArtworkToHistory,
  deleteArtworkFromHistory,
  clearArtworkHistory,
  saveEditorSession,
  clearEditorSession,
  HistoryArtwork
} from '../lib/history-storage'

interface EditorViewProps {
  initialImageUrl: string
  initialAdjustments?: LightroomAdjustments
  initialArtworkId?: string
  initialTab?: EditorTab
  initialCropMode?: 'scan' | 'fixed'
  initialScanPoints?: ScanPoint[]
  initialFixedCropArea?: CropArea
  initialDrawerHeight?: number
  onBack: () => void
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialImageUrl,
  initialAdjustments,
  initialArtworkId,
  initialTab,
  initialCropMode,
  initialScanPoints,
  initialFixedCropArea,
  initialDrawerHeight,
  onBack
}) => {
  const [artworkId, setArtworkId] = useState(initialArtworkId || `art_${Date.now()}`)
  const [baseImage, setBaseImage] = useState<HTMLImageElement | HTMLCanvasElement | null>(null)

  // Drawer & Tabs — defaults to 'crop' (Кадрирование) as requested
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab || 'crop')
  const [drawerHeight, setDrawerHeight] = useState(initialDrawerHeight || 270)

  // Cropping State
  const [cropMode, setCropMode] = useState<'scan' | 'fixed'>(initialCropMode || 'scan')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0])
  const [scanPoints, setScanPoints] = useState<ScanPoint[]>(
    initialScanPoints && initialScanPoints.length === 4
      ? initialScanPoints
      : [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 0 }
        ]
  )
  const [fixedCropArea, setFixedCropArea] = useState<CropArea>(
    initialFixedCropArea || {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  )

  // Dragging crop handles state
  const [draggingTarget, setDraggingTarget] = useState<
    | { type: 'scan-point'; index: number }
    | { type: 'scan-side'; index: number }
    | { type: 'fixed-corner'; corner: 'tl' | 'tr' | 'br' | 'bl' }
    | { type: 'fixed-box' }
    | null
  >(null)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [scanPointsStart, setScanPointsStart] = useState<ScanPoint[]>([])
  const [fixedCropStart, setFixedCropStart] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })

  // Sniper Loupe state (Magnifying Glass, NO red dot)
  const [loupe, setLoupe] = useState<{
    visible: boolean
    screenX: number
    screenY: number
    imgX: number
    imgY: number
  } | null>(null)

  // Adjustments & History Stack
  const [adjustments, setAdjustments] = useState<LightroomAdjustments>(
    initialAdjustments || getDefaultAdjustments()
  )
  const [history, setHistory] = useState<LightroomAdjustments[]>([
    initialAdjustments || getDefaultAdjustments()
  ])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Before / After Press & Hold Toggle
  const [showBefore, setShowBefore] = useState(false)

  // Modals & Drawers
  const [showExportModal, setShowExportModal] = useState(false)
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
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null)

  const loadHistory = async () => {
    const items = await getArtworkHistory()
    setHistoryItems(items)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Initialize crop boundaries
  const initCropBounds = useCallback((imgW: number, imgH: number) => {
    setScanPoints([
      { x: Math.round(imgW * 0.08), y: Math.round(imgH * 0.08) },
      { x: Math.round(imgW * 0.92), y: Math.round(imgH * 0.08) },
      { x: Math.round(imgW * 0.92), y: Math.round(imgH * 0.92) },
      { x: Math.round(imgW * 0.08), y: Math.round(imgH * 0.92) }
    ])
    setFixedCropArea({
      x: Math.round(imgW * 0.08),
      y: Math.round(imgH * 0.08),
      width: Math.round(imgW * 0.84),
      height: Math.round(imgH * 0.84)
    })
  }, [])

  // Center & Fit Image inside Viewport (Ensures clean centering on open / return)
  const resetViewport = useCallback((imgW: number, imgH: number) => {
    if (!viewportRef.current) return
    const rect = viewportRef.current.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    // Available height takes drawer into account
    const availW = rect.width
    const availH = rect.height

    const fitScale = Math.min((availW * 0.86) / imgW, (availH * 0.86) / imgH, 1.8)
    const initialX = Math.round((availW - imgW * fitScale) / 2)
    const initialY = Math.round((availH - imgH * fitScale) / 2)

    setZoom(fitScale)
    setPan({ x: initialX, y: initialY })
  }, [])

  // Clamp Pan so the image cannot be fully moved off-screen
  const clampPan = (targetX: number, targetY: number, currentZoom: number) => {
    if (!viewportRef.current || !baseImage) return { x: targetX, y: targetY }
    const rect = viewportRef.current.getBoundingClientRect()
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height

    const renderedW = w * currentZoom
    const renderedH = h * currentZoom

    // Keep at least 60px inside the visible viewport
    const minX = -renderedW + 60
    const maxX = rect.width - 60
    const minY = -renderedH + 60
    const maxY = rect.height - 60

    return {
      x: Math.max(minX, Math.min(maxX, targetX)),
      y: Math.max(minY, Math.min(maxY, targetY))
    }
  }

  // Load initial image into baseImage
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      setBaseImage(img)
      resetViewport(img.naturalWidth, img.naturalHeight)

      if (initialScanPoints && initialScanPoints.length === 4 && initialScanPoints[1].x > 0) {
        setScanPoints(initialScanPoints)
      } else {
        // Automatically trigger auto-detection on first load as requested
        const detected = await detectDocumentCorners(img, img.naturalWidth, img.naturalHeight)
        if (detected && detected.length === 4) {
          setScanPoints(detected)
        } else {
          initCropBounds(img.naturalWidth, img.naturalHeight)
        }
      }
    }
    img.src = initialImageUrl
  }, [initialImageUrl, initCropBounds, resetViewport, initialScanPoints])

  // Keep canvas centered when drawer height changes or window resizes
  useEffect(() => {
    if (!viewportRef.current || !baseImage) return
    const ro = new ResizeObserver(() => {
      const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
      const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
      resetViewport(w, h)
    })
    ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [baseImage, resetViewport, drawerHeight])

  // Automatically persist session across browser refresh
  useEffect(() => {
    if (!initialImageUrl) return
    saveEditorSession({
      imageUrl: initialImageUrl,
      artworkId,
      adjustments,
      activeTab,
      cropMode,
      aspectRatioLabel: selectedAspectRatio.name,
      scanPoints,
      fixedCropArea,
      drawerHeight
    })
  }, [initialImageUrl, artworkId, adjustments, activeTab, cropMode, selectedAspectRatio, scanPoints, fixedCropArea, drawerHeight])

  // Adjustments History
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

  // Render Pipeline: Draws image with Lightroom corrections
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
    ctx.save()
    if (adjustments.straighten) {
      ctx.translate(w / 2, h / 2)
      ctx.rotate((adjustments.straighten * Math.PI) / 180)
      ctx.drawImage(baseImage, -w / 2, -h / 2)
    } else {
      ctx.drawImage(baseImage, 0, 0)
    }
    ctx.restore()

    if (showBefore) return

    const imageData = ctx.getImageData(0, 0, w, h)
    applyLightroomAdjustments(imageData, adjustments)
    ctx.putImageData(imageData, 0, 0)
  }, [baseImage, adjustments, showBefore])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Save snapshot to history
  const saveSnapshotToHistory = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    saveArtworkToHistory({
      id: artworkId,
      title: 'Отредактированное изображение',
      dataUrl,
      originalUrl: initialImageUrl,
      adjustments,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height
    })
    loadHistory()
  }

  // Direct Download Button (Strictly 100% JPEG quality as requested)
  const handleDirectDownload = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `artwork_${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    saveSnapshotToHistory()
  }

  // --- CROP ACTIONS ---
  const handleApplyCrop = () => {
    if (!baseImage) return
    const imgW = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const imgH = (baseImage as HTMLImageElement).naturalHeight || baseImage.height

    // If straighten is applied, produce rotated intermediate canvas first so crop captures rotated image inside frame
    let currentSource: CanvasImageSource = baseImage
    if (adjustments.straighten) {
      const rotCanvas = document.createElement('canvas')
      rotCanvas.width = imgW
      rotCanvas.height = imgH
      const rCtx = rotCanvas.getContext('2d')
      if (rCtx) {
        rCtx.translate(imgW / 2, imgH / 2)
        rCtx.rotate((adjustments.straighten * Math.PI) / 180)
        rCtx.drawImage(baseImage, -imgW / 2, -imgH / 2)
        currentSource = rotCanvas
      }
    }

    if (cropMode === 'scan') {
      const croppedCanvas = warpPerspectiveCanvas(currentSource, scanPoints, imgW, imgH)
      setBaseImage(croppedCanvas)
      if (adjustments.straighten) {
        handleAdjustmentsChange({ ...adjustments, straighten: 0 })
      }
      initCropBounds(croppedCanvas.width, croppedCanvas.height)
      resetViewport(croppedCanvas.width, croppedCanvas.height)
    } else {
      const out = document.createElement('canvas')
      out.width = Math.max(1, Math.round(fixedCropArea.width))
      out.height = Math.max(1, Math.round(fixedCropArea.height))
      const ctx = out.getContext('2d')
      if (ctx) {
        ctx.drawImage(
          currentSource,
          fixedCropArea.x,
          fixedCropArea.y,
          fixedCropArea.width,
          fixedCropArea.height,
          0,
          0,
          out.width,
          out.height
        )
      }
      setBaseImage(out)
      if (adjustments.straighten) {
        handleAdjustmentsChange({ ...adjustments, straighten: 0 })
      }
      initCropBounds(out.width, out.height)
      resetViewport(out.width, out.height)
    }
    saveSnapshotToHistory()
  }

  const handleAutoDetectCrop = async () => {
    if (!baseImage) return
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height

    const detected = await detectDocumentCorners(baseImage, w, h)
    if (detected && detected.length === 4) {
      setScanPoints(detected)
    } else {
      initCropBounds(w, h)
    }
  }

  const handleResetCropPoints = () => {
    if (!baseImage) return
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
    initCropBounds(w, h)
  }

  const handleRotateCW = () => {
    if (!baseImage) return
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
    const c = document.createElement('canvas')
    c.width = h
    c.height = w
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(c.width / 2, c.height / 2)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(baseImage, -w / 2, -h / 2)
      setBaseImage(c)
      initCropBounds(c.width, c.height)
      resetViewport(c.width, c.height)
    }
  }

  const handleFlipH = () => {
    if (!baseImage) return
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(c.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(baseImage, 0, 0)
      setBaseImage(c)
      initCropBounds(c.width, c.height)
    }
  }

  const handleFlipV = () => {
    if (!baseImage) return
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(0, c.height)
      ctx.scale(1, -1)
      ctx.drawImage(baseImage, 0, 0)
      setBaseImage(c)
      initCropBounds(c.width, c.height)
    }
  }

  // --- SNIPER LOUPE (MAGNIFYING GLASS) RENDERING ---
  const updateLoupeCanvas = useCallback((imgX: number, imgY: number) => {
    const canvas = loupeCanvasRef.current
    if (!canvas || !baseImage) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    ctx.clearRect(0, 0, size, size)

    const zoomFactor = 3
    const srcW = size / zoomFactor
    const srcH = size / zoomFactor
    const srcX = imgX - srcW / 2
    const srcY = imgY - srcH / 2

    ctx.save()
    // Circular clip
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(baseImage, srcX, srcY, srcW, srcH, 0, 0, size, size)

    // Fine 1px crosshair lines (NO RED DOT)
    ctx.strokeStyle = '#0f0b0c'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(size / 2, 0)
    ctx.lineTo(size / 2, size)
    ctx.moveTo(0, size / 2)
    ctx.lineTo(size, size / 2)
    ctx.stroke()

    ctx.restore()
  }, [baseImage])

  useEffect(() => {
    if (loupe?.visible) {
      updateLoupeCanvas(loupe.imgX, loupe.imgY)
    }
  }, [loupe, updateLoupeCanvas])

  // --- POINTER / TOUCH DISPATCHER ---
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (draggingTarget) return
    setIsPanning(true)
    setPanStart({ x: clientX - pan.x, y: clientY - pan.y })
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!baseImage) return
    const imgW = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const imgH = (baseImage as HTMLImageElement).naturalHeight || baseImage.height

    if (isPanning) {
      const rawX = clientX - panStart.x
      const rawY = clientY - panStart.y
      setPan(clampPan(rawX, rawY, zoom))
      return
    }

    if (!draggingTarget) return

    // Delta in natural image pixels
    const deltaImgX = (clientX - dragStartPos.x) / zoom
    const deltaImgY = (clientY - dragStartPos.y) / zoom

    if (draggingTarget.type === 'scan-point') {
      const idx = draggingTarget.index
      const initialPt = scanPointsStart[idx]
      const newX = Math.max(0, Math.min(imgW, Math.round(initialPt.x + deltaImgX)))
      const newY = Math.max(0, Math.min(imgH, Math.round(initialPt.y + deltaImgY)))

      setScanPoints(prev => {
        const next = [...prev]
        next[idx] = { x: newX, y: newY }
        return next
      })

      // Update sniper loupe
      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: newX,
        imgY: newY
      })
    } else if (draggingTarget.type === 'scan-side') {
      const idx = draggingTarget.index
      const nextIdx = (idx + 1) % 4
      const p1 = scanPointsStart[idx]
      const p2 = scanPointsStart[nextIdx]

      const newP1X = Math.max(0, Math.min(imgW, Math.round(p1.x + deltaImgX)))
      const newP1Y = Math.max(0, Math.min(imgH, Math.round(p1.y + deltaImgY)))
      const newP2X = Math.max(0, Math.min(imgW, Math.round(p2.x + deltaImgX)))
      const newP2Y = Math.max(0, Math.min(imgH, Math.round(p2.y + deltaImgY)))

      setScanPoints(prev => {
        const next = [...prev]
        next[idx] = { x: newP1X, y: newP1Y }
        next[nextIdx] = { x: newP2X, y: newP2Y }
        return next
      })

      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: (newP1X + newP2X) / 2,
        imgY: (newP1Y + newP2Y) / 2
      })
    } else if (draggingTarget.type === 'fixed-corner') {
      const corner = draggingTarget.corner
      const start = fixedCropStart
      let newX = start.x
      let newY = start.y
      let newW = start.width
      let newH = start.height

      if (corner === 'br') {
        newW = Math.max(40, Math.min(imgW - start.x, start.width + deltaImgX))
        newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : Math.max(40, Math.min(imgH - start.y, start.height + deltaImgY))
      } else if (corner === 'tl') {
        const targetX = Math.max(0, Math.min(start.x + start.width - 40, start.x + deltaImgX))
        const targetY = Math.max(0, Math.min(start.y + start.height - 40, start.y + deltaImgY))
        newW = start.x + start.width - targetX
        newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : start.y + start.height - targetY
        newX = targetX
        newY = targetY
      } else if (corner === 'tr') {
        newW = Math.max(40, Math.min(imgW - start.x, start.width + deltaImgX))
        const targetY = Math.max(0, Math.min(start.y + start.height - 40, start.y + deltaImgY))
        newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : start.y + start.height - targetY
        newY = targetY
      } else if (corner === 'bl') {
        const targetX = Math.max(0, Math.min(start.x + start.width - 40, start.x + deltaImgX))
        newW = start.x + start.width - targetX
        newX = targetX
        newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : Math.max(40, Math.min(imgH - start.y, start.height + deltaImgY))
      }

      setFixedCropArea({ x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) })

      // Active sniper loupe on corner
      const cornerImgX = corner === 'tl' || corner === 'bl' ? newX : newX + newW
      const cornerImgY = corner === 'tl' || corner === 'tr' ? newY : newY + newH
      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: cornerImgX,
        imgY: cornerImgY
      })
    } else if (draggingTarget.type === 'fixed-box') {
      const start = fixedCropStart
      const newX = Math.max(0, Math.min(imgW - start.width, Math.round(start.x + deltaImgX)))
      const newY = Math.max(0, Math.min(imgH - start.height, Math.round(start.y + deltaImgY)))
      setFixedCropArea(prev => ({ ...prev, x: newX, y: newY }))
    }
  }

  const handlePointerUp = () => {
    setIsPanning(false)
    setDraggingTarget(null)
    setLoupe(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY < 0 ? 1.12 : 0.88
    const nextZoom = Math.max(0.15, Math.min(8, zoom * factor))
    setZoom(nextZoom)
    setPan(prev => clampPan(prev.x, prev.y, nextZoom))
  }

  const w = baseImage ? (baseImage as HTMLImageElement).naturalWidth || baseImage.width : 0
  const h = baseImage ? (baseImage as HTMLImageElement).naturalHeight || baseImage.height : 0

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden bg-[#faf8f8] text-[#0f0b0c] select-none relative">
      {/* Top App Bar — strictly icon-only buttons */}
      <header className="flex items-center justify-between px-3 py-2 z-30 border-b border-[#e3dbdc] bg-[#faf8f8] shrink-0">
        {/* Left: Back & History */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={async () => {
              saveSnapshotToHistory()
              await clearEditorSession()
              onBack()
            }}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 text-[#565051]" />
          </button>

          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer ${
              showHistoryDrawer
                ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                : 'bg-transparent border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
            }`}
            title="История изменений"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Undo, Redo, Before/After */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] disabled:opacity-30 transition-colors cursor-pointer"
            title="Отменить"
          >
            <Undo2 className="w-3.5 h-3.5 text-[#565051]" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] disabled:opacity-30 transition-colors cursor-pointer"
            title="Повторить"
          >
            <Redo2 className="w-3.5 h-3.5 text-[#565051]" />
          </button>

          <button
            onMouseDown={() => setShowBefore(true)}
            onMouseUp={() => setShowBefore(false)}
            onMouseLeave={() => setShowBefore(false)}
            onTouchStart={() => setShowBefore(true)}
            onTouchEnd={() => setShowBefore(false)}
            className={`w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer ${
              showBefore
                ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                : 'bg-transparent border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
            }`}
            title="Удерживайте для сравнения До/После"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Direct Download & Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDirectDownload}
            className="w-8 h-8 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] text-[#faf8f8] flex items-center justify-center transition-colors cursor-pointer"
            title="Скачать файл"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
            title="Параметры экспорта"
          >
            <Share2 className="w-4 h-4 text-[#565051]" />
          </button>
        </div>
      </header>

      {/* History Drawer (Direct horizontal carousel, no extra title header row) */}
      {showHistoryDrawer && (
        <div className="absolute top-11 left-0 right-0 z-40 bg-[#faf8f8] border-b border-[#e3dbdc] p-3 shadow-lg">
          <div className="max-w-2xl mx-auto">
            {historyItems.length > 0 ? (
              <ArtworkHistoryCarousel
                items={historyItems}
                onSelect={(item) => {
                  const img = new Image()
                  img.onload = () => {
                    setBaseImage(img)
                    setArtworkId(item.id)
                    if (item.adjustments) {
                      setAdjustments(item.adjustments)
                      setHistory([item.adjustments])
                      setHistoryIndex(0)
                    }
                    initCropBounds(img.naturalWidth, img.naturalHeight)
                    resetViewport(img.naturalWidth, img.naturalHeight)
                    setShowHistoryDrawer(false)
                  }
                  img.src = item.originalUrl || item.dataUrl
                }}
                onDelete={async (id) => {
                  await deleteArtworkFromHistory(id)
                  setHistoryItems(prev => prev.filter(i => i.id !== id))
                }}
                onClearAll={async () => {
                  await clearArtworkHistory()
                  setHistoryItems([])
                }}
              />
            ) : (
              <div className="text-xs text-[#565051] text-center py-2">История изменений пуста</div>
            )}
          </div>
        </div>
      )}

      {/* Center Main Canvas Viewport */}
      <div
        ref={viewportRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing touch-none flex items-center justify-center bg-[#f2efef]"
        onWheel={handleWheel}
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
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
            const nextZoom = Math.max(0.2, Math.min(6, zoom * factor))
            setZoom(nextZoom)
            setPan(prev => clampPan(prev.x, prev.y, nextZoom))
            setTouchDistance(dist)
          }
        }}
        onTouchEnd={() => {
          handlePointerUp()
          setTouchDistance(null)
        }}
      >
        {/* Before watermark */}
        {showBefore && (
          <div className="absolute top-4 left-4 z-20 px-2.5 py-0.5 bg-[#faf8f8] border border-[#e3dbdc] text-[11px] font-mono text-[#0f0b0c] uppercase pointer-events-none">
            Оригинал
          </div>
        )}

        {/* Transformed Image & Interactive Crop Coordinate Space */}
        {/* Transformed Image & Interactive Crop Coordinate Space (Anchored strictly to top-left for 100% exact canvas centering) */}
        <div
          className="absolute top-0 left-0 origin-top-left shadow-sm transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: w,
            height: h
          }}
        >
          {/* Base Canvas */}
          <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

          {/* --- INTEGRATED CROP OVERLAYS (WHEN CROP TAB IS ACTIVE) --- */}
          {activeTab === 'crop' && (
            <div className="absolute inset-0 w-full h-full">
              {/* PERSPECTIVE SCANNER WARP MODE */}
              {cropMode === 'scan' ? (
                <>
                  {/* Perfectly Aligned SVG Polygon (Coordinates share identical image scale) */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox={`0 0 ${w} ${h}`}
                    preserveAspectRatio="none"
                  >
                    <polygon
                      points={scanPoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(15, 11, 12, 0.08)"
                      stroke="#0f0b0c"
                      strokeWidth={1.5 / zoom}
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>

                  {/* 4 Corner Pins (100% exact sub-pixel center aligned with polygon vertices) */}
                  {scanPoints.map((point, index) => {
                    const pinSize = Math.max(12, Math.round(14 / zoom))
                    return (
                      <div
                        key={`corner-${index}`}
                        className="absolute z-30 flex items-center justify-center cursor-move select-none"
                        style={{
                          left: `${point.x}px`,
                          top: `${point.y}px`,
                          width: `${pinSize}px`,
                          height: `${pinSize}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setDraggingTarget({ type: 'scan-point', index })
                          setDragStartPos({ x: e.clientX, y: e.clientY })
                          setScanPointsStart([...scanPoints])
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            setDraggingTarget({ type: 'scan-point', index })
                            setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
                            setScanPointsStart([...scanPoints])
                          }
                        }}
                      >
                        {/* Centered touch/click hitbox */}
                        <div
                          className="absolute pointer-events-auto"
                          style={{
                            width: '48px',
                            height: '48px',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                        {/* Clean 1px Square Pin */}
                        <div className="w-full h-full border border-[#0f0b0c] bg-[#faf8f8] shadow-sm flex items-center justify-center pointer-events-none">
                          <div className="w-1.5 h-1.5 bg-[#0f0b0c]" />
                        </div>
                      </div>
                    )
                  })}

                  {/* 4 Midpoint Handles (100% exact center aligned on polygon line segments) */}
                  {scanPoints.map((point, index) => {
                    const nextIdx = (index + 1) % 4
                    const nextPt = scanPoints[nextIdx]
                    const midX = (point.x + nextPt.x) / 2
                    const midY = (point.y + nextPt.y) / 2
                    const midSize = Math.max(8, Math.round(10 / zoom))
                    return (
                      <div
                        key={`mid-${index}`}
                        className="absolute z-20 flex items-center justify-center cursor-move select-none"
                        style={{
                          left: `${midX}px`,
                          top: `${midY}px`,
                          width: `${midSize}px`,
                          height: `${midSize}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setDraggingTarget({ type: 'scan-side', index })
                          setDragStartPos({ x: e.clientX, y: e.clientY })
                          setScanPointsStart([...scanPoints])
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            setDraggingTarget({ type: 'scan-side', index })
                            setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
                            setScanPointsStart([...scanPoints])
                          }
                        }}
                      >
                        <div
                          className="absolute pointer-events-auto"
                          style={{
                            width: '40px',
                            height: '40px',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                        <div className="w-full h-full border border-[#0f0b0c] bg-[#faf8f8] shadow-sm pointer-events-none" />
                      </div>
                    )
                  })}
                </>
              ) : (
                /* FIXED ASPECT CROP MODE */
                <div
                  className="absolute border border-[#0f0b0c] z-20 cursor-move"
                  style={{
                    left: `${fixedCropArea.x}px`,
                    top: `${fixedCropArea.y}px`,
                    width: `${fixedCropArea.width}px`,
                    height: `${fixedCropArea.height}px`,
                    boxShadow: '0 0 0 9999px rgba(15, 11, 12, 0.4)'
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    setDraggingTarget({ type: 'fixed-box' })
                    setDragStartPos({ x: e.clientX, y: e.clientY })
                    setFixedCropStart({ ...fixedCropArea })
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    if (e.touches.length === 1) {
                      setDraggingTarget({ type: 'fixed-box' })
                      setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
                      setFixedCropStart({ ...fixedCropArea })
                    }
                  }}
                >
                  {/* 4 Corner Handles for Fixed Aspect */}
                  {(['tl', 'tr', 'br', 'bl'] as const).map(corner => {
                    const isLeft = corner === 'tl' || corner === 'bl'
                    const isTop = corner === 'tl' || corner === 'tr'
                    return (
                      <div
                        key={corner}
                        className="absolute cursor-pointer z-30"
                        style={{
                          left: isLeft ? 0 : '100%',
                          top: isTop ? 0 : '100%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setDraggingTarget({ type: 'fixed-corner', corner })
                          setDragStartPos({ x: e.clientX, y: e.clientY })
                          setFixedCropStart({ ...fixedCropArea })
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            setDraggingTarget({ type: 'fixed-corner', corner })
                            setDragStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
                            setFixedCropStart({ ...fixedCropArea })
                          }
                        }}
                      >
                        <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 pointer-events-auto" />
                        <div
                          className="border border-[#0f0b0c] bg-[#faf8f8] pointer-events-none"
                          style={{
                            width: `${Math.max(10, 14 / zoom)}px`,
                            height: `${Math.max(10, 14 / zoom)}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zoom percentage readout */}
        <div className="absolute bottom-2 left-3 z-10 text-[10px] font-mono text-[#565051] pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* SNIPER LOUPE (MAGNIFYING GLASS) — ACTIVATES ON PERSPECTIVE & FIXED CROP HANDLES */}
      {loupe?.visible && (
        <div
          className="fixed pointer-events-none z-50 overflow-hidden border border-[#34292a] shadow-xl bg-white"
          style={{
            left: `${Math.max(10, Math.min(window.innerWidth - 120, loupe.screenX - 55))}px`,
            top: `${Math.max(10, loupe.screenY - 130)}px`,
            width: '110px',
            height: '110px',
            borderRadius: '50%'
          }}
        >
          <canvas ref={loupeCanvasRef} width={110} height={110} className="w-full h-full block" />
        </div>
      )}

      {/* Bottom Resizable Lightroom & Cropping Studio Drawer */}
      <div className="shrink-0 z-30">
        <LightroomStudio
          adjustments={adjustments}
          onChange={handleAdjustmentsChange}
          onReset={() => handleAdjustmentsChange(getDefaultAdjustments())}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cropMode={cropMode}
          onCropModeChange={setCropMode}
          selectedAspectRatio={selectedAspectRatio}
          onAspectRatioChange={setSelectedAspectRatio}
          onAutoDetectCrop={handleAutoDetectCrop}
          onResetCropPoints={handleResetCropPoints}
          onRotateCW={handleRotateCW}
          onFlipH={handleFlipH}
          onFlipV={handleFlipV}
          onApplyCrop={handleApplyCrop}
          drawerHeight={drawerHeight}
          onDrawerHeightChange={setDrawerHeight}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        canvas={canvasRef.current}
      />
    </div>
  )
}
