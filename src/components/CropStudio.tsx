import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Check, X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Sparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { ScanPoint, CropArea, AspectRatio } from '../types'
import { validateScanPoints, warpPerspectiveCanvas, loadOpenCV } from '../lib/perspective-warp'

interface CropStudioProps {
  imageSource: HTMLCanvasElement | HTMLImageElement
  onCropComplete: (croppedCanvas: HTMLCanvasElement) => void
  onCancel: () => void
}

const ASPECT_RATIOS: AspectRatio[] = [
  { name: 'Free', ratio: 0 },
  { name: '1:1', ratio: 1 },
  { name: '4:3', ratio: 4 / 3 },
  { name: '3:4', ratio: 3 / 4 },
  { name: '16:9', ratio: 16 / 9 },
  { name: '9:16', ratio: 9 / 16 },
  { name: '3:2', ratio: 3 / 2 },
  { name: '2:3', ratio: 2 / 3 }
]

type CropMode = 'edit_scan' | 'fixed'

interface ZoomCircle {
  visible: boolean
  x: number
  y: number
  imageX: number
  imageY: number
}

export const CropStudio: React.FC<CropStudioProps> = ({
  imageSource,
  onCropComplete,
  onCancel
}) => {
  const [mode, setMode] = useState<CropMode>('edit_scan')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0])

  const naturalWidth = (imageSource as HTMLImageElement).naturalWidth || imageSource.width
  const naturalHeight = (imageSource as HTMLImageElement).naturalHeight || imageSource.height

  // Viewport transform
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  // 4 corners for scan mode
  const [scanPoints, setScanPoints] = useState<ScanPoint[]>([
    { x: 0, y: 0 },
    { x: naturalWidth, y: 0 },
    { x: naturalWidth, y: naturalHeight },
    { x: 0, y: naturalHeight }
  ])

  // Crop area for fixed mode (in image coordinates)
  const [cropAreaImage, setCropAreaImage] = useState<CropArea>({
    x: 0,
    y: 0,
    width: naturalWidth,
    height: naturalHeight
  })

  // Dragging states
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null)
  const [draggedSideIndices, setDraggedSideIndices] = useState<[number, number] | null>(null)
  const [isDraggingCrop, setIsDraggingCrop] = useState(false)
  const [isResizingCrop, setIsResizingCrop] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string>('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Panning image
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Magnifying Loupe
  const [zoomCircle, setZoomCircle] = useState<ZoomCircle | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null)

  // Load OpenCV in background for contour detection if available
  useEffect(() => {
    loadOpenCV()
  }, [])

  // Fit image to viewport initially
  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const fitScaleX = (rect.width * 0.85) / naturalWidth
    const fitScaleY = (rect.height * 0.75) / naturalHeight
    const initScale = Math.min(fitScaleX, fitScaleY, 1.5)

    const w = naturalWidth * initScale
    const h = naturalHeight * initScale
    const tx = (rect.width - w) / 2
    const ty = (rect.height - h) / 2

    setScale(initScale)
    setTranslateX(tx)
    setTranslateY(ty)
  }, [naturalWidth, naturalHeight])

  // Coordinate conversions
  const screenToImage = useCallback((sx: number, sy: number): ScanPoint => {
    return {
      x: (sx - translateX) / scale,
      y: (sy - translateY) / scale
    }
  }, [translateX, translateY, scale])

  const imageToScreen = useCallback((ix: number, iy: number): ScanPoint => {
    return {
      x: ix * scale + translateX,
      y: iy * scale + translateY
    }
  }, [translateX, translateY, scale])

  // Update loupe canvas whenever zoomCircle changes
  useEffect(() => {
    if (!zoomCircle?.visible || !loupeCanvasRef.current) return
    const canvas = loupeCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 150
    canvas.height = 150
    ctx.clearRect(0, 0, 150, 150)

    const zoom = 3
    const srcSize = 150 / zoom
    const srcX = zoomCircle.imageX - srcSize / 2
    const srcY = zoomCircle.imageY - srcSize / 2

    ctx.drawImage(imageSource, srcX, srcY, srcSize, srcSize, 0, 0, 150, 150)

    // Crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(75, 0)
    ctx.lineTo(75, 150)
    ctx.moveTo(0, 75)
    ctx.lineTo(150, 75)
    ctx.stroke()
  }, [zoomCircle, imageSource])

  // Unified Pointer/Touch Handler
  const handlePointerDown = (clientX: number, clientY: number, target: string, param?: any) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const screenX = clientX - rect.left
    const screenY = clientY - rect.top
    const imgCoords = screenToImage(screenX, screenY)

    if (target === 'point') {
      setDraggedPointIndex(param)
    } else if (target === 'side') {
      setDraggedSideIndices(param)
    } else if (target === 'crop-move') {
      setIsDraggingCrop(true)
      setDragStart({ x: imgCoords.x - cropAreaImage.x, y: imgCoords.y - cropAreaImage.y })
    } else if (target === 'crop-resize') {
      setIsResizingCrop(true)
      setResizeHandle(param)
      setDragStart({ x: imgCoords.x, y: imgCoords.y })
    } else if (target === 'bg-pan') {
      setIsPanning(true)
      setPanStart({ x: clientX - translateX, y: clientY - translateY })
    }
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const screenX = clientX - rect.left
    const screenY = clientY - rect.top

    if (draggedPointIndex !== null) {
      const imgCoords = screenToImage(screenX, screenY)
      const clamped = {
        x: Math.max(0, Math.min(naturalWidth, imgCoords.x)),
        y: Math.max(0, Math.min(naturalHeight, imgCoords.y))
      }

      const nextPoints = scanPoints.map((pt, i) => (i === draggedPointIndex ? clamped : pt))
      if (validateScanPoints(nextPoints, { width: naturalWidth, height: naturalHeight })) {
        setScanPoints(nextPoints)
      }

      // Show loupe offset from touch/cursor
      const offsetX = screenX > rect.width / 2 ? -90 : 90
      const offsetY = screenY > rect.height / 2 ? -90 : 90
      setZoomCircle({
        visible: true,
        x: Math.max(80, Math.min(rect.width - 80, screenX + offsetX)),
        y: Math.max(80, Math.min(rect.height - 80, screenY + offsetY)),
        imageX: clamped.x,
        imageY: clamped.y
      })
    } else if (draggedSideIndices !== null) {
      const [idx1, idx2] = draggedSideIndices
      const imgCoords = screenToImage(screenX, screenY)
      const clamped = {
        x: Math.max(0, Math.min(naturalWidth, imgCoords.x)),
        y: Math.max(0, Math.min(naturalHeight, imgCoords.y))
      }

      const origMid = {
        x: (scanPoints[idx1].x + scanPoints[idx2].x) / 2,
        y: (scanPoints[idx1].y + scanPoints[idx2].y) / 2
      }
      const dx = clamped.x - origMid.x
      const dy = clamped.y - origMid.y

      const nextPoints = scanPoints.map((pt, i) => {
        if (i === idx1 || i === idx2) {
          return {
            x: Math.max(0, Math.min(naturalWidth, pt.x + dx)),
            y: Math.max(0, Math.min(naturalHeight, pt.y + dy))
          }
        }
        return pt
      })

      if (validateScanPoints(nextPoints, { width: naturalWidth, height: naturalHeight })) {
        setScanPoints(nextPoints)
      }

      const offsetX = screenX > rect.width / 2 ? -90 : 90
      const offsetY = screenY > rect.height / 2 ? -90 : 90
      setZoomCircle({
        visible: true,
        x: Math.max(80, Math.min(rect.width - 80, screenX + offsetX)),
        y: Math.max(80, Math.min(rect.height - 80, screenY + offsetY)),
        imageX: clamped.x,
        imageY: clamped.y
      })
    } else if (isPanning) {
      setTranslateX(clientX - panStart.x)
      setTranslateY(clientY - panStart.y)
    } else if (isDraggingCrop && !isResizingCrop) {
      const imgCoords = screenToImage(screenX, screenY)
      const newX = Math.max(0, Math.min(naturalWidth - cropAreaImage.width, imgCoords.x - dragStart.x))
      const newY = Math.max(0, Math.min(naturalHeight - cropAreaImage.height, imgCoords.y - dragStart.y))
      setCropAreaImage(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizingCrop) {
      const imgCoords = screenToImage(screenX, screenY)
      const dx = imgCoords.x - dragStart.x
      const dy = imgCoords.y - dragStart.y

      setCropAreaImage(prev => {
        let n = { ...prev }
        const minSize = 40

        if (resizeHandle === 'top-left') {
          const nw = Math.max(minSize, prev.width - dx)
          const nh = Math.max(minSize, prev.height - dy)
          n.x = prev.x + (prev.width - nw)
          n.y = prev.y + (prev.height - nh)
          n.width = nw
          n.height = nh
        } else if (resizeHandle === 'bottom-right') {
          n.width = Math.max(minSize, Math.min(naturalWidth - prev.x, prev.width + dx))
          n.height = Math.max(minSize, Math.min(naturalHeight - prev.y, prev.height + dy))
        } else if (resizeHandle === 'top-right') {
          const nw = Math.max(minSize, Math.min(naturalWidth - prev.x, prev.width + dx))
          const nh = Math.max(minSize, prev.height - dy)
          n.y = prev.y + (prev.height - nh)
          n.width = nw
          n.height = nh
        } else if (resizeHandle === 'bottom-left') {
          const nw = Math.max(minSize, prev.width - dx)
          const nh = Math.max(minSize, Math.min(naturalHeight - prev.y, prev.height + dy))
          n.x = prev.x + (prev.width - nw)
          n.width = nw
          n.height = nh
        }

        if (selectedAspectRatio.ratio > 0) {
          n.height = n.width / selectedAspectRatio.ratio
        }

        n.x = Math.max(0, Math.min(naturalWidth - n.width, n.x))
        n.y = Math.max(0, Math.min(naturalHeight - n.height, n.y))
        return n
      })
      setDragStart({ x: imgCoords.x, y: imgCoords.y })
    }
  }

  const handlePointerUp = () => {
    setDraggedPointIndex(null)
    setDraggedSideIndices(null)
    setIsPanning(false)
    setIsDraggingCrop(false)
    setIsResizingCrop(false)
    setResizeHandle('')
    setZoomCircle(null)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    const nextScale = Math.max(0.2, Math.min(5, scale * factor))
    setScale(nextScale)
  }

  // Reset Scan Points
  const handleResetPoints = () => {
    setScanPoints([
      { x: 0, y: 0 },
      { x: naturalWidth, y: 0 },
      { x: naturalWidth, y: naturalHeight },
      { x: 0, y: naturalHeight }
    ])
    setCropAreaImage({
      x: 0,
      y: 0,
      width: naturalWidth,
      height: naturalHeight
    })
  }

  // Auto Detect paper corners using OpenCV or smart inset
  const handleAutoDetect = () => {
    if ((window as any).cv?.Mat) {
      try {
        const cv = (window as any).cv
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = naturalWidth
        tempCanvas.height = naturalHeight
        const tCtx = tempCanvas.getContext('2d')!
        tCtx.drawImage(imageSource, 0, 0)

        const img = cv.imread(tempCanvas)
        const gray = new cv.Mat()
        cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY)
        cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)
        cv.Canny(gray, gray, 50, 150)

        const contours = new cv.MatVector()
        const hierarchy = new cv.Mat()
        cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        let maxArea = 0
        let bestContour: any = null
        for (let i = 0; i < contours.size(); i++) {
          const c = contours.get(i)
          const area = cv.contourArea(c)
          if (area > maxArea) {
            maxArea = area
            bestContour = c
          }
        }

        if (bestContour && maxArea > (naturalWidth * naturalHeight) * 0.1) {
          const rect = cv.minAreaRect(bestContour)
          const pts = cv.RotatedRect.points(rect)
          setScanPoints([
            { x: Math.round(pts[0].x), y: Math.round(pts[0].y) },
            { x: Math.round(pts[1].x), y: Math.round(pts[1].y) },
            { x: Math.round(pts[2].x), y: Math.round(pts[2].y) },
            { x: Math.round(pts[3].x), y: Math.round(pts[3].y) },
          ])
          img.delete(); gray.delete(); contours.delete(); hierarchy.delete()
          return
        }
        img.delete(); gray.delete(); contours.delete(); hierarchy.delete()
      } catch (e) {
        console.warn('Contour detection error:', e)
      }
    }

    // Default smart inset quadrilateral
    const insetX = naturalWidth * 0.08
    const insetY = naturalHeight * 0.08
    setScanPoints([
      { x: insetX, y: insetY },
      { x: naturalWidth - insetX, y: insetY + 10 },
      { x: naturalWidth - insetX - 10, y: naturalHeight - insetY },
      { x: insetX + 10, y: naturalHeight - insetY }
    ])
  }

  // Execute Crop
  const handleApplyCrop = () => {
    if (mode === 'edit_scan') {
      const cropped = warpPerspectiveCanvas(imageSource, scanPoints, naturalWidth, naturalHeight)
      onCropComplete(cropped)
    } else {
      // Fixed Bounding Box
      const out = document.createElement('canvas')
      out.width = Math.round(cropAreaImage.width)
      out.height = Math.round(cropAreaImage.height)
      const ctx = out.getContext('2d')
      if (ctx) {
        ctx.drawImage(
          imageSource,
          cropAreaImage.x,
          cropAreaImage.y,
          cropAreaImage.width,
          cropAreaImage.height,
          0,
          0,
          out.width,
          out.height
        )
      }
      onCropComplete(out)
    }
  }

  const handleRotateCW = () => {
    const c = document.createElement('canvas')
    c.width = naturalHeight
    c.height = naturalWidth
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(c.width / 2, c.height / 2)
      ctx.rotate(Math.PI / 2)
      ctx.drawImage(imageSource, -naturalWidth / 2, -naturalHeight / 2)
      onCropComplete(c)
    }
  }

  const handleFlipH = () => {
    const c = document.createElement('canvas')
    c.width = naturalWidth
    c.height = naturalHeight
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(c.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(imageSource, 0, 0)
      onCropComplete(c)
    }
  }

  const handleFlipV = () => {
    const c = document.createElement('canvas')
    c.width = naturalWidth
    c.height = naturalHeight
    const ctx = c.getContext('2d')
    if (ctx) {
      ctx.translate(0, c.height)
      ctx.scale(1, -1)
      ctx.drawImage(imageSource, 0, 0)
      onCropComplete(c)
    }
  }

  // Screen coordinates for fixed crop
  const cropScreen = {
    x: cropAreaImage.x * scale + translateX,
    y: cropAreaImage.y * scale + translateY,
    width: cropAreaImage.width * scale,
    height: cropAreaImage.height * scale
  }

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 z-50 glass-panel border-b border-white/10">
        <button
          onClick={onCancel}
          className="w-9 h-9 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
          title="Cancel Crop"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10">
          <button
            onClick={() => setMode('edit_scan')}
            className={`px-3 py-1 squircle-full text-xs font-medium transition-all ${
              mode === 'edit_scan'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Scanner Warp
          </button>
          <button
            onClick={() => setMode('fixed')}
            className={`px-3 py-1 squircle-full text-xs font-medium transition-all ${
              mode === 'fixed'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Fixed Aspect
          </button>
        </div>

        {/* Confirm Crop Button */}
        <button
          onClick={handleApplyCrop}
          className="w-9 h-9 squircle-full bg-[oklch(var(--button-green))] hover:bg-[oklch(var(--button-green-hover))] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
          title="Apply Crop"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-crosshair touch-none"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY, 'bg-pan')}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, 'bg-pan')
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)
          }
        }}
        onTouchEnd={handlePointerUp}
      >
        {/* Render Image at Transformed Scale */}
        <div
          className="absolute origin-top-left pointer-events-none"
          style={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            width: naturalWidth,
            height: naturalHeight
          }}
        >
          <img
            src={(imageSource as HTMLImageElement).src || (imageSource as HTMLCanvasElement).toDataURL()}
            alt="Crop Preview"
            className="w-full h-full object-contain pointer-events-none select-none block"
            draggable={false}
          />
        </div>

        {/* --- SCANNER WARP MODE OVERLAYS --- */}
        {mode === 'edit_scan' && (
          <>
            {/* Quadrilateral SVG Border */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polygon
                points={scanPoints.map(p => {
                  const s = imageToScreen(p.x, p.y)
                  return `${s.x},${s.y}`
                }).join(' ')}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* 4 Corner Draggable Handles (120px Hitbox, 4px Visible Dot matching /artei) */}
            {scanPoints.map((point, index) => {
              const s = imageToScreen(point.x, point.y)
              return (
                <div
                  key={`corner-${index}`}
                  className="absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{ left: s.x, top: s.y }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handlePointerDown(e.clientX, e.clientY, 'point', index)
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    if (e.touches.length === 1) {
                      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, 'point', index)
                    }
                  }}
                >
                  {/* 120px invisible touch hitbox */}
                  <div className="absolute inset-0 w-[120px] h-[120px] -translate-x-1/2 -translate-y-1/2" />
                  {/* Visible 16px circular pin with white center */}
                  <div className="w-5 h-5 rounded-full bg-white shadow-xl flex items-center justify-center -translate-x-1/2 -translate-y-1/2 border-2 border-black hover:scale-125 transition-transform active:scale-150">
                    <div className="w-1.5 h-1.5 rounded-full bg-black" />
                  </div>
                </div>
              )
            })}

            {/* 4 Side Midpoint Handles */}
            {scanPoints.map((point, index) => {
              const nextIndex = (index + 1) % 4
              const nextPoint = scanPoints[nextIndex]
              const midX = (point.x + nextPoint.x) / 2
              const midY = (point.y + nextPoint.y) / 2
              const s = imageToScreen(midX, midY)

              return (
                <div
                  key={`side-${index}`}
                  className="absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 z-25"
                  style={{ left: s.x, top: s.y }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handlePointerDown(e.clientX, e.clientY, 'side', [index, nextIndex])
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    if (e.touches.length === 1) {
                      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, 'side', [index, nextIndex])
                    }
                  }}
                >
                  <div className="absolute inset-0 w-[100px] h-[100px] -translate-x-1/2 -translate-y-1/2" />
                  <div className="w-3.5 h-3.5 squircle-sm bg-white/90 border border-black/40 shadow -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform" />
                </div>
              )
            })}
          </>
        )}

        {/* --- FIXED BOUNDING BOX MODE OVERLAYS --- */}
        {mode === 'fixed' && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <rect
                x={cropScreen.x}
                y={cropScreen.y}
                width={cropScreen.width}
                height={cropScreen.height}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Draggable Area */}
            <div
              className="absolute cursor-move z-20"
              style={{
                left: cropScreen.x,
                top: cropScreen.y,
                width: cropScreen.width,
                height: cropScreen.height
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                handlePointerDown(e.clientX, e.clientY, 'crop-move')
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                if (e.touches.length === 1) {
                  handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, 'crop-move')
                }
              }}
            />

            {/* Corner Resize Handles */}
            {[
              { handle: 'top-left', x: cropScreen.x, y: cropScreen.y },
              { handle: 'top-right', x: cropScreen.x + cropScreen.width, y: cropScreen.y },
              { handle: 'bottom-left', x: cropScreen.x, y: cropScreen.y + cropScreen.height },
              { handle: 'bottom-right', x: cropScreen.x + cropScreen.width, y: cropScreen.y + cropScreen.height }
            ].map(({ handle, x, y }) => (
              <div
                key={handle}
                className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: x, top: y }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  handlePointerDown(e.clientX, e.clientY, 'crop-resize', handle)
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                  if (e.touches.length === 1) {
                    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, 'crop-resize', handle)
                  }
                }}
              >
                <div className="absolute inset-0 w-[100px] h-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="w-4 h-4 rounded-full bg-white border-2 border-black shadow-lg hover:scale-125 transition-transform" />
              </div>
            ))}
          </>
        )}

        {/* Magnifying Loupe (Zoom Circle) */}
        {zoomCircle?.visible && (
          <div
            className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: zoomCircle.x, top: zoomCircle.y }}
          >
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black relative">
              <canvas ref={loupeCanvasRef} className="w-full h-full block" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 rounded-full border border-white bg-red-500/80" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toolbar & Presets */}
      <div className="p-3 pb-4 z-50 glass-panel border-t border-white/10 flex flex-col gap-2.5">
        {/* Aspect Ratio Selector (Fixed mode only) */}
        {mode === 'fixed' && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar justify-center">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.name}
                onClick={() => {
                  setSelectedAspectRatio(ratio)
                  if (ratio.ratio > 0) {
                    setCropAreaImage(prev => ({
                      ...prev,
                      height: prev.width / ratio.ratio
                    }))
                  }
                }}
                className={`px-3 py-1 squircle-full text-xs font-medium whitespace-nowrap transition-transform active:scale-95 ${
                  selectedAspectRatio.name === ratio.name
                    ? 'bg-white text-black font-semibold'
                    : 'glass-pill text-white/80 hover:text-white'
                }`}
              >
                {ratio.name}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons: Auto Detect, Reset, Zoom */}
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto w-full">
          {mode === 'edit_scan' && (
            <button
              onClick={handleAutoDetect}
              className="flex items-center gap-1.5 px-3.5 py-1.5 squircle-full glass-pill text-xs font-medium text-white/90 hover:bg-white/15 transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Auto Detect
            </button>
          )}

          <button
            onClick={handleResetPoints}
            className="flex items-center gap-1.5 px-3.5 py-1.5 squircle-full glass-pill text-xs font-medium text-white/80 hover:bg-white/15 transition-transform active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Bounds
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRotateCW}
              className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFlipH}
              className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFlipV}
              className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
              title="Flip Vertical"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
              onClick={() => setScale(s => Math.min(4, s * 1.2))}
              className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(s => Math.max(0.3, s / 1.2))}
              className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/80 hover:text-white transition-transform active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
