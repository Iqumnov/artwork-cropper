import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Download,
  Share2,
  Undo2,
  Redo2,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import {
  LightroomAdjustments,
  ScanPoint,
  CropArea,
  AspectRatio,
  EditorTab,
  ASPECT_RATIOS,
  ArtworkInfo
} from '../types'
import { getDefaultAdjustments } from '../lib/presets'
import { applyLightroomAdjustments } from '../lib/color-engine'
import { warpPerspectiveCanvas, detectDocumentCorners, orderCorners } from '../lib/perspective-warp'
import { LightroomStudio } from './LightroomStudio'
import { ExportModal } from './ExportModal'
import { WallViewModal } from './WallViewModal'
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
  initialFileName?: string
  initialArtworkInfo?: ArtworkInfo
  initialTab?: EditorTab
  initialCropMode?: 'scan' | 'fixed'
  initialScanPoints?: ScanPoint[]
  initialFixedCropArea?: CropArea
  initialDrawerHeight?: number
  queueTotal?: number
  queueCurrentIndex?: number
  onNextImage?: () => void
  onPrevImage?: () => void
  onAddImages?: (files: FileList | File[]) => void
  onBack: () => void
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialImageUrl,
  initialAdjustments,
  initialArtworkId,
  initialFileName,
  initialArtworkInfo,
  initialTab,
  initialCropMode,
  initialScanPoints,
  initialFixedCropArea,
  initialDrawerHeight,
  queueTotal,
  queueCurrentIndex,
  onNextImage,
  onPrevImage,
  onAddImages,
  onBack
}) => {
  const [artworkId, setArtworkId] = useState(initialArtworkId || `art_${Date.now()}`)
  const [baseImage, setBaseImage] = useState<HTMLImageElement | HTMLCanvasElement | null>(null)
  const untransformedSourceRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null)
  const [fileName, setFileName] = useState<string>(initialFileName || '')
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo>(() => {
    return (
      initialArtworkInfo || {
        title: '',
        artist: '',
        medium: '',
        dimensions: '',
        year: ''
      }
    )
  })

  // Wall View Modal State
  const [isWallModalOpen, setIsWallModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState<string>('')

  const handleOpenWallView = () => {
    renderCanvas(false)
    const src = canvasRef.current?.toDataURL('image/jpeg', 0.95) || initialImageUrl
    setModalImageSrc(src)
    setIsWallModalOpen(true)
  }

  const handleOpenExportModal = () => {
    renderCanvas(false)
    setShowExportModal(true)
  }

  // Drawer & Tabs — defaults to 'crop' (Кадрирование) as requested
  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab || 'crop')
  const [drawerHeight, setDrawerHeight] = useState(initialDrawerHeight || 270)

  // Cropping State & Extreme Pixel Sensitivity
  const [cropMode, setCropMode] = useState<'scan' | 'fixed'>(initialCropMode || 'scan')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0])
  const [isExtremePrecision, setIsExtremePrecision] = useState(false)
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null)
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
    | { type: 'fixed-side'; side: 'top' | 'right' | 'bottom' | 'left' }
    | { type: 'fixed-box' }
    | null
  >(null)

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
  const lastClientPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragScanPointsRef = useRef<ScanPoint[]>([])
  const dragFixedCropRef = useRef<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const addFilesRef = useRef<HTMLInputElement>(null)

  const startDragging = (
    target: typeof draggingTarget,
    clientX: number,
    clientY: number
  ) => {
    setDraggingTarget(target)
    if (target?.type === 'scan-point') {
      setSelectedPointIndex(target.index)
    }
    lastClientPosRef.current = { x: clientX, y: clientY }
    dragScanPointsRef.current = scanPoints.map(p => ({ x: p.x, y: p.y }))
    dragFixedCropRef.current = { ...fixedCropArea }
  }

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
      untransformedSourceRef.current = img
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

  // Fast low-overhead preview buffer for real-time 60 FPS slider dragging
  const previewSourceRef = useRef<HTMLCanvasElement | null>(null)
  const previewRawPixelsRef = useRef<Uint8ClampedArray | null>(null)
  const previewWorkingImageDataRef = useRef<ImageData | null>(null)
  const fastOffscreenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const isRafScheduledRef = useRef(false)
  const idleSettleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingSliderRef = useRef(false)
  const isActivelyAdjustingRef = useRef(false)
  const activeAdjustmentsRef = useRef(adjustments)
  activeAdjustmentsRef.current = adjustments

  const handleSliderDragStart = useCallback(() => {
    isDraggingSliderRef.current = true
    isActivelyAdjustingRef.current = true
    if (idleSettleTimerRef.current) clearTimeout(idleSettleTimerRef.current)
  }, [])

  const handleSliderDragEnd = useCallback(() => {
    isDraggingSliderRef.current = false
    if (idleSettleTimerRef.current) clearTimeout(idleSettleTimerRef.current)
    idleSettleTimerRef.current = setTimeout(() => {
      isActivelyAdjustingRef.current = false
      renderCanvas(false)
    }, 350)
  }, [])

  useEffect(() => {
    if (!baseImage) {
      previewSourceRef.current = null
      previewRawPixelsRef.current = null
      previewWorkingImageDataRef.current = null
      return
    }
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
    // Downscale preview to max 640px: ~200k pixels computing in <2ms for locked 60 FPS slider dragging
    const maxDim = 640
    const scale = Math.min(1, maxDim / Math.max(w, h))
    const pw = Math.max(10, Math.round(w * scale))
    const ph = Math.max(10, Math.round(h * scale))
    const pCanvas = document.createElement('canvas')
    pCanvas.width = pw
    pCanvas.height = ph
    const pCtx = pCanvas.getContext('2d', { willReadFrequently: true })
    if (pCtx) {
      pCtx.imageSmoothingEnabled = true
      pCtx.imageSmoothingQuality = 'high'
      pCtx.drawImage(baseImage, 0, 0, pw, ph)
      previewSourceRef.current = pCanvas

      const raw = pCtx.getImageData(0, 0, pw, ph)
      previewRawPixelsRef.current = new Uint8ClampedArray(raw.data)
      previewWorkingImageDataRef.current = pCtx.createImageData(pw, ph)
    }
  }, [baseImage])

  // Automatically persist session across browser refresh (debounced to avoid blocking slider dragging)
  useEffect(() => {
    if (!initialImageUrl) return
    const timer = setTimeout(() => {
      saveEditorSession({
        imageUrl: initialImageUrl,
        artworkId,
        adjustments,
        activeTab,
        cropMode,
        aspectRatioLabel: selectedAspectRatio.name,
        scanPoints,
        fixedCropArea,
        drawerHeight,
        fileName,
        artworkInfo
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [initialImageUrl, artworkId, adjustments, activeTab, cropMode, selectedAspectRatio, scanPoints, fixedCropArea, drawerHeight, fileName, artworkInfo])

  // Render Pipeline: Draws image with Lightroom corrections
  // isFastPreview: if true, renders via zero-readback in-memory buffer for locked 60 FPS slider responsiveness
  const renderCanvas = useCallback((isFastPreview = false) => {
    if (!baseImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const w = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
    const h = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
    const currentAdjustments = activeAdjustmentsRef.current

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Show Before/Original
    if (showBefore) {
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      // Fill solid background to prevent iOS GPU tile artifacts from the body SVG noise texture
      ctx.fillStyle = '#faf8f8'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(baseImage, 0, 0)
      return
    }

    // Fast Preview path during active slider dragging on large photos
    if (isFastPreview && previewSourceRef.current && previewRawPixelsRef.current && previewWorkingImageDataRef.current) {
      const pCanvas = previewSourceRef.current
      const pw = pCanvas.width
      const ph = pCanvas.height
      const workingImageData = previewWorkingImageDataRef.current
      const rawPixels = previewRawPixelsRef.current

      if (!fastOffscreenCanvasRef.current) {
        fastOffscreenCanvasRef.current = document.createElement('canvas')
      }
      const offCanvas = fastOffscreenCanvasRef.current
      if (offCanvas.width !== pw || offCanvas.height !== ph) {
        offCanvas.width = pw
        offCanvas.height = ph
      }
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true })
      if (!offCtx) return

      if (currentAdjustments.straighten) {
        offCtx.fillStyle = '#faf8f8'
        offCtx.fillRect(0, 0, pw, ph)
        offCtx.save()
        offCtx.translate(pw / 2, ph / 2)
        offCtx.rotate((currentAdjustments.straighten * Math.PI) / 180)
        offCtx.drawImage(pCanvas, -pw / 2, -ph / 2)
        offCtx.restore()

        const pImageData = offCtx.getImageData(0, 0, pw, ph)
        applyLightroomAdjustments(pImageData, currentAdjustments)
        offCtx.putImageData(pImageData, 0, 0)
      } else {
        // ULTRA-FAST ZERO-READBACK PATH: ~2ms total execution time!
        workingImageData.data.set(rawPixels)
        applyLightroomAdjustments(workingImageData, currentAdjustments)
        offCtx.putImageData(workingImageData, 0, 0)
      }

      // During active slider dragging on mobile/retina, keep the main canvas backing buffer at fast preview resolution (pw, ph)
      // The CSS 'w-full h-full' automatically stretches it via hardware GPU sampler with ZERO compositor stalls!
      if (isActivelyAdjustingRef.current || isDraggingSliderRef.current) {
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw
          canvas.height = ph
        }
        ctx.drawImage(offCanvas, 0, 0)
      } else {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
        }
        ctx.clearRect(0, 0, w, h)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'low'
        ctx.drawImage(offCanvas, 0, 0, w, h)
      }
      return
    }

    // Full Resolution Render — solid fill first to prevent iOS checkerboard tile artifact
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.fillStyle = '#faf8f8'
    ctx.fillRect(0, 0, w, h)
    ctx.save()
    if (currentAdjustments.straighten) {
      ctx.translate(w / 2, h / 2)
      ctx.rotate((currentAdjustments.straighten * Math.PI) / 180)
      ctx.drawImage(baseImage, -w / 2, -h / 2)
    } else {
      ctx.drawImage(baseImage, 0, 0)
    }
    ctx.restore()

    const imageData = ctx.getImageData(0, 0, w, h)
    applyLightroomAdjustments(imageData, currentAdjustments)
    ctx.putImageData(imageData, 0, 0)
  }, [baseImage, showBefore])

  // Coalesced RAF render scheduler: schedules at most one render per screen vsync refresh without starvation
  const scheduleFastRender = useCallback(() => {
    if (isRafScheduledRef.current) return
    isRafScheduledRef.current = true
    rafRef.current = requestAnimationFrame(() => {
      isRafScheduledRef.current = false
      renderCanvas(true)
    })
  }, [renderCanvas])

  // Adjustments Change: Immediate state update with RAF coalescing and debounced history push
  const handleAdjustmentsChange = useCallback((nextAdj: LightroomAdjustments) => {
    activeAdjustmentsRef.current = nextAdj
    isActivelyAdjustingRef.current = true
    setAdjustments(nextAdj)

    // Trigger coalesced fast render
    scheduleFastRender()

    // Settle high resolution when user pauses or stops adjusting for 400ms
    if (idleSettleTimerRef.current) clearTimeout(idleSettleTimerRef.current)
    idleSettleTimerRef.current = setTimeout(() => {
      isActivelyAdjustingRef.current = false
      renderCanvas(false)
    }, 400)

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current)
    }
    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1)
        newHistory.push(nextAdj)
        if (newHistory.length > 30) newHistory.shift()
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      })
    }, 400)
  }, [historyIndex, scheduleFastRender, renderCanvas])

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      handleAdjustmentsChange(prev)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      handleAdjustmentsChange(next)
    }
  }

  // Effect to re-render when showBefore toggles or baseImage changes
  useEffect(() => {
    renderCanvas(false)
  }, [showBefore, baseImage, renderCanvas])

  // Save snapshot to history
  const saveSnapshotToHistory = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
    saveArtworkToHistory({
      id: artworkId,
      title: artworkInfo.title || 'Отредактированное изображение',
      dataUrl,
      originalUrl: initialImageUrl,
      adjustments,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height,
      fileName,
      artworkInfo
    })
    loadHistory()
  }

  // Direct Download Button (Strictly 100% JPEG quality as requested)
  const handleDirectDownload = () => {
    if (!canvasRef.current) return
    renderCanvas(false)
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0)
    const rawName = artworkInfo.title?.trim() || fileName?.replace(/\.[^/.]+$/, '').trim() || `artwork_${Date.now()}`
    const safeName = rawName.replace(/[/\\?%*:|"<>]/g, '-')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${safeName}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    saveSnapshotToHistory()

    // Auto-advance to next image in queue immediately RIGHT as download is clicked!
    if (onNextImage && queueTotal && queueTotal > 1 && (queueCurrentIndex ?? 0) < queueTotal - 1) {
      onNextImage()
    }
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
      untransformedSourceRef.current = croppedCanvas
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
      untransformedSourceRef.current = out
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
    const w = (baseImage as HTMLImageElement).naturalWidth || (baseImage as HTMLCanvasElement).width
    const h = (baseImage as HTMLImageElement).naturalHeight || (baseImage as HTMLCanvasElement).height

    let detectionSource: CanvasImageSource = baseImage
    let detW = w
    let detH = h

    // Burn straighten rotation into a temporary canvas so the detector sees exactly
    // what the user sees (rotation is normally applied as CSS transform on the canvas element,
    // not baked into the image data — this caused detection to fail on rotated images)
    if (adjustments.straighten) {
      const rad = (adjustments.straighten * Math.PI) / 180
      const cosA = Math.abs(Math.cos(rad))
      const sinA = Math.abs(Math.sin(rad))
      // Bounding box of rotated image
      detW = Math.ceil(w * cosA + h * sinA)
      detH = Math.ceil(w * sinA + h * cosA)

      const rotCanvas = document.createElement('canvas')
      rotCanvas.width = detW
      rotCanvas.height = detH
      const rotCtx = rotCanvas.getContext('2d')
      if (rotCtx) {
        rotCtx.fillStyle = '#faf8f8'
        rotCtx.fillRect(0, 0, detW, detH)
        rotCtx.save()
        rotCtx.translate(detW / 2, detH / 2)
        rotCtx.rotate(rad)
        rotCtx.drawImage(baseImage, -w / 2, -h / 2)
        rotCtx.restore()
        detectionSource = rotCanvas
      }
    }

    const detected = await detectDocumentCorners(detectionSource, detW, detH)
    if (detected && detected.length === 4) {
      let finalPoints = detected

      // If we detected on a rotated canvas, transform corners back to original image coords
      if (adjustments.straighten && detW !== w) {
        const rad = (adjustments.straighten * Math.PI) / 180
        const cos = Math.cos(-rad)
        const sin = Math.sin(-rad)
        const cxDet = detW / 2
        const cyDet = detH / 2
        const cx = w / 2
        const cy = h / 2
        finalPoints = orderCorners(
          detected.map(p => {
            const dx = p.x - cxDet
            const dy = p.y - cyDet
            const rx = dx * cos - dy * sin + cx
            const ry = dx * sin + dy * cos + cy
            return {
              x: Math.max(0, Math.min(w, Math.round(rx))),
              y: Math.max(0, Math.min(h, Math.round(ry)))
            }
          })
        )
      }

      setScanPoints(finalPoints)
      const xs = finalPoints.map(p => p.x)
      const ys = finalPoints.map(p => p.y)
      const minX = Math.max(0, Math.min(...xs))
      const maxX = Math.min(w, Math.max(...xs))
      const minY = Math.max(0, Math.min(...ys))
      const maxY = Math.min(h, Math.max(...ys))
      setFixedCropArea({
        x: minX,
        y: minY,
        width: Math.max(10, maxX - minX),
        height: Math.max(10, maxY - minY)
      })
    } else {
      initCropBounds(w, h)
    }
  }


  const handleResetCropPoints = () => {
    // 1. Reset gradual angle manipulation to 0
    if (adjustments.straighten !== 0) {
      handleAdjustmentsChange({ ...adjustments, straighten: 0 })
    }

    // 2. Restore original untransformed base image, resetting any 90° rotations and flips
    const targetSource = untransformedSourceRef.current || baseImage
    if (targetSource) {
      setBaseImage(targetSource)
      const w = (targetSource as HTMLImageElement).naturalWidth || (targetSource as HTMLCanvasElement).width
      const h = (targetSource as HTMLImageElement).naturalHeight || (targetSource as HTMLCanvasElement).height
      initCropBounds(w, h)
      resetViewport(w, h)
    }
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
    const w = (baseImage as HTMLImageElement).naturalWidth || (baseImage as HTMLCanvasElement).width
    const h = (baseImage as HTMLImageElement).naturalHeight || (baseImage as HTMLCanvasElement).height

    ctx.clearRect(0, 0, size, size)

    const zoomFactor = 2.8
    ctx.save()
    // Circular clip
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()

    // Subtle dark backdrop behind magnified image
    ctx.fillStyle = '#1e1a1b'
    ctx.fillRect(0, 0, size, size)

    // Center inspected point (imgX, imgY) in the loupe
    ctx.translate(size / 2, size / 2)
    ctx.scale(zoomFactor, zoomFactor)
    ctx.translate(-imgX, -imgY)

    // Draw base image, respecting straighten rotation angle identically to canvas
    if (adjustments.straighten) {
      ctx.translate(w / 2, h / 2)
      ctx.rotate((adjustments.straighten * Math.PI) / 180)
      ctx.drawImage(baseImage, -w / 2, -h / 2)
    } else {
      ctx.drawImage(baseImage, 0, 0)
    }

    ctx.restore()

    // Minecraft Crosshair and Unified Border (Reacts dynamically to background via difference blend mode)
    ctx.save()
    ctx.globalCompositeOperation = 'difference'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1

    const center = Math.floor(size / 2) + 0.5
    // Crosshair lines (exact crisp 1px without subpixel blur)
    ctx.beginPath()
    ctx.moveTo(center, 0)
    ctx.lineTo(center, size)
    ctx.moveTo(0, center)
    ctx.lineTo(size, center)
    ctx.stroke()

    // Circular perimeter border (SAME color, crisp 1px ring)
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 0.5, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }, [baseImage, adjustments.straighten])

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
    lastClientPosRef.current = { x: clientX, y: clientY }
  }

  const handlePointerMove = (clientX: number, clientY: number, e?: { shiftKey?: boolean; altKey?: boolean }) => {
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

    const prevClient = lastClientPosRef.current
    const stepX = clientX - prevClient.x
    const stepY = clientY - prevClient.y
    lastClientPosRef.current = { x: clientX, y: clientY }

    const stepDist = Math.hypot(stepX, stepY)
    if (stepDist === 0) return

    // Continuous Velocity & Extreme Precision:
    // Completely eliminates flinch/discontinuity because coordinates accumulate smoothly in ref
    const isShiftOrAlt = e?.shiftKey || e?.altKey
    const extremeActive = isExtremePrecision || isShiftOrAlt

    let s = 1.0
    if (extremeActive) {
      s = 0.10 // Extreme sub-pixel precision (10x sensitivity reduction for pixel-by-pixel alignment)
    } else {
      if (stepDist <= 1.5) {
        s = 0.15 // Micro-precision damping when moving slowly
      } else if (stepDist < 6.0) {
        const t = (stepDist - 1.5) / 4.5
        const smoothT = t * t * (3 - 2 * t)
        s = 0.15 + 0.85 * smoothT
      } else {
        s = 1.0 // Full 1:1 speed for swift drags
      }
    }

    const deltaImgX = (stepX * s) / zoom
    const deltaImgY = (stepY * s) / zoom

    if (draggingTarget.type === 'scan-point') {
      const idx = draggingTarget.index
      const curPts = dragScanPointsRef.current
      if (!curPts[idx]) return

      curPts[idx].x = Math.max(0, Math.min(imgW, curPts[idx].x + deltaImgX))
      curPts[idx].y = Math.max(0, Math.min(imgH, curPts[idx].y + deltaImgY))

      const roundedX = Math.round(curPts[idx].x)
      const roundedY = Math.round(curPts[idx].y)

      setScanPoints(curPts.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })))

      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: roundedX,
        imgY: roundedY
      })
    } else if (draggingTarget.type === 'scan-side') {
      const idx = draggingTarget.index
      const nextIdx = (idx + 1) % 4
      const curPts = dragScanPointsRef.current
      if (!curPts[idx] || !curPts[nextIdx]) return

      curPts[idx].x = Math.max(0, Math.min(imgW, curPts[idx].x + deltaImgX))
      curPts[idx].y = Math.max(0, Math.min(imgH, curPts[idx].y + deltaImgY))
      curPts[nextIdx].x = Math.max(0, Math.min(imgW, curPts[nextIdx].x + deltaImgX))
      curPts[nextIdx].y = Math.max(0, Math.min(imgH, curPts[nextIdx].y + deltaImgY))

      setScanPoints(curPts.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) })))

      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: Math.round((curPts[idx].x + curPts[nextIdx].x) / 2),
        imgY: Math.round((curPts[idx].y + curPts[nextIdx].y) / 2)
      })
    } else if (draggingTarget.type === 'fixed-corner') {
      const corner = draggingTarget.corner
      const cur = dragFixedCropRef.current

      if (corner === 'br') {
        const newW = Math.max(40, Math.min(imgW - cur.x, cur.width + deltaImgX))
        const newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : Math.max(40, Math.min(imgH - cur.y, cur.height + deltaImgY))
        cur.width = newW
        cur.height = newH
      } else if (corner === 'tl') {
        const targetX = Math.max(0, Math.min(cur.x + cur.width - 40, cur.x + deltaImgX))
        const targetY = Math.max(0, Math.min(cur.y + cur.height - 40, cur.y + deltaImgY))
        const newW = cur.x + cur.width - targetX
        const newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : cur.y + cur.height - targetY
        cur.x = targetX
        cur.y = targetY
        cur.width = newW
        cur.height = newH
      } else if (corner === 'tr') {
        const newW = Math.max(40, Math.min(imgW - cur.x, cur.width + deltaImgX))
        const targetY = Math.max(0, Math.min(cur.y + cur.height - 40, cur.y + deltaImgY))
        const newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : cur.y + cur.height - targetY
        cur.width = newW
        cur.y = targetY
        cur.height = newH
      } else if (corner === 'bl') {
        const targetX = Math.max(0, Math.min(cur.x + cur.width - 40, cur.x + deltaImgX))
        const newW = cur.x + cur.width - targetX
        const newH = selectedAspectRatio.ratio > 0 ? newW / selectedAspectRatio.ratio : Math.max(40, Math.min(imgH - cur.y, cur.height + deltaImgY))
        cur.x = targetX
        cur.width = newW
        cur.height = newH
      }

      setFixedCropArea({
        x: Math.round(cur.x),
        y: Math.round(cur.y),
        width: Math.round(cur.width),
        height: Math.round(cur.height)
      })

      const cornerImgX = corner === 'tl' || corner === 'bl' ? cur.x : cur.x + cur.width
      const cornerImgY = corner === 'tl' || corner === 'tr' ? cur.y : cur.y + cur.height
      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: Math.round(cornerImgX),
        imgY: Math.round(cornerImgY)
      })
    } else if (draggingTarget.type === 'fixed-side') {
      const side = draggingTarget.side
      const cur = dragFixedCropRef.current

      if (side === 'top') {
        const targetY = Math.max(0, Math.min(cur.y + cur.height - 40, cur.y + deltaImgY))
        cur.height = cur.y + cur.height - targetY
        cur.y = targetY
        if (selectedAspectRatio.ratio > 0) {
          cur.width = Math.min(imgW, cur.height * selectedAspectRatio.ratio)
          cur.x = Math.max(0, Math.min(imgW - cur.width, cur.x + (cur.width - cur.width) / 2))
        }
      } else if (side === 'bottom') {
        cur.height = Math.max(40, Math.min(imgH - cur.y, cur.height + deltaImgY))
        if (selectedAspectRatio.ratio > 0) {
          cur.width = Math.min(imgW, cur.height * selectedAspectRatio.ratio)
        }
      } else if (side === 'left') {
        const targetX = Math.max(0, Math.min(cur.x + cur.width - 40, cur.x + deltaImgX))
        cur.width = cur.x + cur.width - targetX
        cur.x = targetX
        if (selectedAspectRatio.ratio > 0) {
          cur.height = Math.min(imgH, cur.width / selectedAspectRatio.ratio)
        }
      } else if (side === 'right') {
        cur.width = Math.max(40, Math.min(imgW - cur.x, cur.width + deltaImgX))
        if (selectedAspectRatio.ratio > 0) {
          cur.height = Math.min(imgH, cur.width / selectedAspectRatio.ratio)
        }
      }

      setFixedCropArea({
        x: Math.round(cur.x),
        y: Math.round(cur.y),
        width: Math.round(cur.width),
        height: Math.round(cur.height)
      })

      let sideImgX = cur.x + cur.width / 2
      let sideImgY = cur.y + cur.height / 2
      if (side === 'top') sideImgY = cur.y
      else if (side === 'bottom') sideImgY = cur.y + cur.height
      else if (side === 'left') sideImgX = cur.x
      else if (side === 'right') sideImgX = cur.x + cur.width

      setLoupe({
        visible: true,
        screenX: clientX,
        screenY: clientY,
        imgX: Math.round(sideImgX),
        imgY: Math.round(sideImgY)
      })
    } else if (draggingTarget.type === 'fixed-box') {
      const cur = dragFixedCropRef.current
      cur.x = Math.max(0, Math.min(imgW - cur.width, cur.x + deltaImgX))
      cur.y = Math.max(0, Math.min(imgH - cur.height, cur.y + deltaImgY))
      setFixedCropArea({
        x: Math.round(cur.x),
        y: Math.round(cur.y),
        width: Math.round(cur.width),
        height: Math.round(cur.height)
      })
    }
  }

  const handlePointerUp = () => {
    setIsPanning(false)
    setDraggingTarget(null)
    setLoupe(null)
  }

  // Window-level pointer tracking during active drag: prevents dropped events outside viewport
  useEffect(() => {
    if (!draggingTarget && !isPanning) return
    const handleWinMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY, e)
    }
    const handleWinUp = () => {
      handlePointerUp()
    }
    window.addEventListener('mousemove', handleWinMove)
    window.addEventListener('mouseup', handleWinUp)
    return () => {
      window.removeEventListener('mousemove', handleWinMove)
      window.removeEventListener('mouseup', handleWinUp)
    }
  }, [draggingTarget, isPanning, handlePointerMove, handlePointerUp])

  // Keyboard Arrow Nudging for Extreme Pixel Precision
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!baseImage || activeTab !== 'crop') return
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (cropMode === 'scan' && selectedPointIndex !== null && selectedPointIndex >= 0 && selectedPointIndex < 4) {
          e.preventDefault()
          const step = e.shiftKey ? 5 : 1
          const imgW = (baseImage as HTMLImageElement).naturalWidth || baseImage.width
          const imgH = (baseImage as HTMLImageElement).naturalHeight || baseImage.height
          setScanPoints(prev => {
            const next = [...prev]
            const pt = { ...next[selectedPointIndex] }
            if (e.key === 'ArrowLeft') pt.x = Math.max(0, pt.x - step)
            if (e.key === 'ArrowRight') pt.x = Math.min(imgW, pt.x + step)
            if (e.key === 'ArrowUp') pt.y = Math.max(0, pt.y - step)
            if (e.key === 'ArrowDown') pt.y = Math.min(imgH, pt.y + step)
            next[selectedPointIndex] = pt
            return next
          })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [baseImage, activeTab, cropMode, selectedPointIndex])

  // Window paste listener to append clipboard images directly to the queue
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) files.push(file)
        }
      }
      if (files.length > 0 && onAddImages) {
        onAddImages(files)
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [onAddImages])

  // Global and Viewport Wheel/Pinch Protection: prevents browser UI zoom
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    }
    const handleGesture = (e: Event) => {
      e.preventDefault()
    }

    window.addEventListener('wheel', handleGlobalWheel, { passive: false })
    window.addEventListener('gesturestart', handleGesture, { passive: false })
    window.addEventListener('gesturechange', handleGesture, { passive: false })
    window.addEventListener('gestureend', handleGesture, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleGlobalWheel)
      window.removeEventListener('gesturestart', handleGesture)
      window.removeEventListener('gesturechange', handleGesture)
      window.removeEventListener('gestureend', handleGesture)
    }
  }, [])

  // Non-passive viewport wheel listener: zooms strictly the canvas, never the UI
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    const handleVpWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()

      let factor = 1
      if (e.ctrlKey) {
        // Trackpad pinch
        factor = Math.exp(-e.deltaY * 0.01)
      } else {
        // Standard mouse wheel
        factor = e.deltaY < 0 ? 1.12 : 0.88
      }

      setZoom(prevZoom => {
        const nextZoom = Math.max(0.15, Math.min(8, prevZoom * factor))
        setPan(prevPan => clampPan(prevPan.x, prevPan.y, nextZoom))
        return nextZoom
      })
    }

    vp.addEventListener('wheel', handleVpWheel, { passive: false })
    return () => {
      vp.removeEventListener('wheel', handleVpWheel)
    }
  }, [baseImage])

  const w = baseImage ? (baseImage as HTMLImageElement).naturalWidth || baseImage.width : 0
  const h = baseImage ? (baseImage as HTMLImageElement).naturalHeight || baseImage.height : 0

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onAddImages) {
          onAddImages(e.dataTransfer.files)
        }
      }}
      className="h-full w-full flex flex-col justify-between overflow-hidden bg-[#faf8f8] text-[#0f0b0c] select-none relative"
    >
      {/* Hidden File Input for Adding Images to Batch Queue */}
      <input
        ref={addFilesRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.dng,.tiff,.tif,.avif,.webp,.png,.jpg,.jpeg,.bmp"
        onChange={(e) => {
          if (e.target.files && onAddImages) {
            onAddImages(e.target.files)
          }
          e.target.value = ''
        }}
        className="hidden"
      />

      {/* Top App Bar — strictly icon-only buttons with shrink protection */}
      <header className="flex items-center justify-between px-2 sm:px-3 py-2 z-30 border-b border-[#e3dbdc] bg-[#faf8f8] shrink-0 gap-1 sm:gap-1.5 min-w-0">
        {/* Left: Back & History & Queue Controller */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={async () => {
              saveSnapshotToHistory()
              await clearEditorSession()
              onBack()
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 text-[#565051]" />
          </button>

          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
              showHistoryDrawer
                ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                : 'bg-transparent border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
            }`}
            title="История изменений"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Multi-image queue pagination < x / N > [+] */}
          {queueTotal && queueTotal > 1 ? (
            <div className="flex items-center border border-[#0f0b0c] bg-white text-xs select-none shadow-xs shrink-0">
              <button
                onClick={onPrevImage}
                disabled={queueCurrentIndex === 0}
                className="w-6 sm:w-7 h-7 flex items-center justify-center text-[#0f0b0c] hover:bg-[#faf8f8] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="px-1.5 sm:px-2 font-mono font-medium text-xs text-[#0f0b0c] whitespace-nowrap">
                {(queueCurrentIndex ?? 0) + 1} / {queueTotal}
              </span>
              <button
                onClick={onNextImage}
                disabled={queueCurrentIndex === queueTotal - 1}
                className="w-6 sm:w-7 h-7 flex items-center justify-center text-[#0f0b0c] hover:bg-[#faf8f8] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                title="Следующее фото"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => addFilesRef.current?.click()}
                className="w-6 sm:w-7 h-7 border-l border-[#e3dbdc] flex items-center justify-center text-[#565051] hover:text-[#0f0b0c] hover:bg-[#faf8f8] transition-colors"
                title="Добавить ещё фото в очередь"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addFilesRef.current?.click()}
              className="h-7 sm:h-8 px-1.5 sm:px-2 border border-[#e3dbdc] hover:border-[#34292a] bg-white text-[#565051] hover:text-[#0f0b0c] flex items-center gap-1 text-xs transition-colors cursor-pointer shrink-0"
              title="Добавить фото для пакетной серии"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-normal">Пакет</span>
            </button>
          )}
        </div>

        {/* Center: Undo, Redo, Before/After */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] disabled:opacity-30 transition-colors cursor-pointer"
            title="Отменить"
          >
            <Undo2 className="w-3.5 h-3.5 text-[#565051]" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] disabled:opacity-30 transition-colors cursor-pointer"
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
            className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
              showBefore
                ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                : 'bg-transparent border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
            }`}
            title="Удерживайте для сравнения До/После"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Mode Toggles, Direct Download & Export */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* View on Wall Button */}
          <button
            onClick={handleOpenWallView}
            className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 shrink-0 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent items-center justify-center text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer group"
            title="Примерка на стене"
          >
            <img
              src="/images/gallery.svg"
              alt=""
              className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <button
            onClick={handleDirectDownload}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] text-[#faf8f8] flex items-center justify-center transition-colors cursor-pointer"
            title="Быстрое скачивание (переход к след. фото)"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={handleOpenExportModal}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
            title="Параметры экспорта"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#565051]" />
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
                    untransformedSourceRef.current = img
                    setBaseImage(img)
                    setArtworkId(item.id)
                    if (item.adjustments) {
                      setAdjustments(item.adjustments)
                      setHistory([item.adjustments])
                      setHistoryIndex(0)
                    }
                    if (item.fileName) {
                      setFileName(item.fileName)
                    }
                    if (item.artworkInfo) {
                      setArtworkInfo(item.artworkInfo)
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
            e.preventDefault()
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            )
            const factor = dist / touchDistance
            setZoom(prevZoom => {
              const nextZoom = Math.max(0.2, Math.min(6, prevZoom * factor))
              setPan(prevPan => clampPan(prevPan.x, prevPan.y, nextZoom))
              return nextZoom
            })
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
          <div className="absolute top-4 left-4 z-20 px-2.5 py-0.5 bg-[#faf8f8] border border-[#e3dbdc] text-xs font-mono text-[#0f0b0c] uppercase pointer-events-none">
            Оригинал
          </div>
        )}

        {/* Transformed Image & Interactive Crop Coordinate Space (1px black border, NO shadow) */}
        <div
          className="absolute top-0 left-0 origin-top-left border border-[#0f0b0c] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: w,
            height: h
          }}
        >
          {/* Base Canvas — explicit background prevents iOS GPU tile artifact */}
          <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" style={{ backgroundColor: '#faf8f8' }} />

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
                    const hitSize = Math.max(44, Math.round(48 / zoom))
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
                          startDragging({ type: 'scan-point', index }, e.clientX, e.clientY)
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            startDragging({ type: 'scan-point', index }, e.touches[0].clientX, e.touches[0].clientY)
                          }
                        }}
                      >
                        {/* Centered touch/click hitbox guaranteed >= 44 screen px */}
                        <div
                          className="absolute pointer-events-auto"
                          style={{
                            width: `${hitSize}px`,
                            height: `${hitSize}px`,
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
                    const hitSize = Math.max(44, Math.round(48 / zoom))
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
                          startDragging({ type: 'scan-side', index }, e.clientX, e.clientY)
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            startDragging({ type: 'scan-side', index }, e.touches[0].clientX, e.touches[0].clientY)
                          }
                        }}
                      >
                        <div
                          className="absolute pointer-events-auto"
                          style={{
                            width: `${hitSize}px`,
                            height: `${hitSize}px`,
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
                    startDragging({ type: 'fixed-box' }, e.clientX, e.clientY)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    if (e.touches.length === 1) {
                      startDragging({ type: 'fixed-box' }, e.touches[0].clientX, e.touches[0].clientY)
                    }
                  }}
                >
                  {/* 4 Corner Pins for Fixed Aspect (Exact same visual styling as perspective) */}
                  {(['tl', 'tr', 'br', 'bl'] as const).map(corner => {
                    const isLeft = corner === 'tl' || corner === 'bl'
                    const isTop = corner === 'tl' || corner === 'tr'
                    const pinSize = Math.max(12, Math.round(14 / zoom))
                    const hitSize = Math.max(44, Math.round(48 / zoom))
                    return (
                      <div
                        key={`fixed-corner-${corner}`}
                        className="absolute z-30 flex items-center justify-center cursor-move select-none"
                        style={{
                          left: isLeft ? 0 : '100%',
                          top: isTop ? 0 : '100%',
                          width: `${pinSize}px`,
                          height: `${pinSize}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          startDragging({ type: 'fixed-corner', corner }, e.clientX, e.clientY)
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            startDragging({ type: 'fixed-corner', corner }, e.touches[0].clientX, e.touches[0].clientY)
                          }
                        }}
                      >
                        {/* Guaranteed >= 44 screen px touch hitbox */}
                        <div
                          className="absolute pointer-events-auto"
                          style={{
                            width: `${hitSize}px`,
                            height: `${hitSize}px`,
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                        {/* Clean 1px Square Pin with Inner Dot — Identical to Perspective */}
                        <div className="w-full h-full border border-[#0f0b0c] bg-[#faf8f8] shadow-sm flex items-center justify-center pointer-events-none">
                          <div className="w-1.5 h-1.5 bg-[#0f0b0c]" />
                        </div>
                      </div>
                    )
                  })}

                  {/* 4 Edge Midpoint Handles for Fixed Aspect (Edge manipulation) */}
                  {(['top', 'right', 'bottom', 'left'] as const).map(side => {
                    const midSize = Math.max(8, Math.round(10 / zoom))
                    const hitSize = Math.max(44, Math.round(48 / zoom))
                    let leftPos = '50%'
                    let topPos = '50%'
                    if (side === 'top') { leftPos = '50%'; topPos = '0%' }
                    else if (side === 'bottom') { leftPos = '50%'; topPos = '100%' }
                    else if (side === 'left') { leftPos = '0%'; topPos = '50%' }
                    else if (side === 'right') { leftPos = '100%'; topPos = '50%' }

                    return (
                      <div
                        key={`fixed-side-${side}`}
                        className="absolute z-20 flex items-center justify-center cursor-move select-none"
                        style={{
                          left: leftPos,
                          top: topPos,
                          width: `${midSize}px`,
                          height: `${midSize}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          startDragging({ type: 'fixed-side', side }, e.clientX, e.clientY)
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          if (e.touches.length === 1) {
                            startDragging({ type: 'fixed-side', side }, e.touches[0].clientX, e.touches[0].clientY)
                          }
                        }}
                      >
                        <div
                          className="absolute pointer-events-auto"
                          style={{
                            width: `${hitSize}px`,
                            height: `${hitSize}px`,
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        />
                        <div className="w-full h-full border border-[#0f0b0c] bg-[#faf8f8] shadow-sm pointer-events-none" />
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

      {/* SNIPER LOUPE (MAGNIFYING GLASS) — MINECRAFT INVERTED DIFFERENCE CROSSHAIR & UNIFIED BORDER */}
      {loupe?.visible && (
        <div
          className="fixed pointer-events-none z-50 overflow-hidden shadow-2xl bg-black"
          style={{
            left: `${Math.max(10, Math.min(window.innerWidth - 120, loupe.screenX - 55))}px`,
            top: `${Math.max(10, loupe.screenY - 130)}px`,
            width: '110px',
            height: '110px',
            borderRadius: '50%'
          }}
        >
          <canvas ref={loupeCanvasRef} width={110} height={110} className="w-full h-full block" />
          {isExtremePrecision && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-[#0f0b0c]/90 text-[#faf8f8] text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-white/20 uppercase tracking-wider whitespace-nowrap">
              0.1× Пиксель
            </div>
          )}
        </div>
      )}

      {/* Bottom Resizable Lightroom & Cropping Studio Drawer */}
      <div className="shrink-0 z-30">
        <LightroomStudio
          adjustments={adjustments}
          onChange={handleAdjustmentsChange}
          onReset={() => handleAdjustmentsChange(getDefaultAdjustments())}
          onSliderDragStart={handleSliderDragStart}
          onSliderDragEnd={handleSliderDragEnd}
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
          isExtremePrecision={isExtremePrecision}
          onToggleExtremePrecision={() => setIsExtremePrecision(prev => !prev)}
        />
      </div>

      {/* Export Modal (Supports direct export and Export as Post 3:4) */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportComplete={() => {
          setShowExportModal(false)
          // Immediate synchronous auto-advance RIGHT as download is clicked!
          if (onNextImage && queueTotal && queueTotal > 1 && (queueCurrentIndex ?? 0) < queueTotal - 1) {
            onNextImage()
          }
        }}
        canvas={canvasRef.current}
        originalFileName={fileName}
        artworkTitle={artworkInfo.title}
        artworkInfo={artworkInfo}
        onUpdateArtworkInfo={setArtworkInfo}
        queueTotal={queueTotal}
        queueCurrentIndex={queueCurrentIndex}
        onNextImage={onNextImage}
        onPrevImage={onPrevImage}
      />

      {/* Wall View Modal (Interactive AR / Wall preview from ourdynasty) */}
      <WallViewModal
        isOpen={isWallModalOpen}
        onClose={() => setIsWallModalOpen(false)}
        imageSrc={modalImageSrc || initialImageUrl}
        title={artworkInfo.title || 'Картина'}
        dimensions={artworkInfo.dimensions?.trim() || ''}
      />
    </div>
  )
}
