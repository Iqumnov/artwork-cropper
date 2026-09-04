import React, { useState, useEffect, useRef } from 'react'
import PerspT from 'perspective-transform'
import {
  WALL_SLIDER_TRACK_FILL,
  WALL_SLIDER_TRACK_REST,
  WALL_SLIDER_THUMB,
  WALL_BLACK_SHADOW,
  wallIconImageStyle,
  wallTextStyle,
} from '../lib/wallViewUi'

interface WallViewModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  title?: string
  dimensions?: string
}

export const WallViewModal: React.FC<WallViewModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title = 'Картина',
  dimensions,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [backgroundMode, setBackgroundMode] = useState<'camera' | 'image'>('camera')
  const [imageFitMode, setImageFitMode] = useState<'cover' | 'contain'>('cover')
  const [artworkPosition, setArtworkPosition] = useState({ x: 50, y: 50 })
  const [artworkSize, setArtworkSize] = useState(30)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [error, setError] = useState<string>('')

  const [cornerOffsets, setCornerOffsets] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ])
  const [activeCorner, setActiveCorner] = useState<number | null>(null)
  const [matrix3dString, setMatrix3dString] = useState<string>('')

  const [activePointers, setActivePointers] = useState<Map<number, { x: number; y: number }>>(new Map())
  const [isInterfaceVisible, setIsInterfaceVisible] = useState(true)
  const pinchStartDist = useRef<number | null>(null)
  const pinchStartSize = useRef<number | null>(null)

  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastPointerPosition = useRef({ x: 0, y: 0 })

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const artworkRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fade out interface after 4 seconds of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleActivity = () => {
      setIsInterfaceVisible(true)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsInterfaceVisible(false)
      }, 4000)
    }

    handleActivity()

    window.addEventListener('pointermove', handleActivity)
    window.addEventListener('pointerdown', handleActivity)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('pointermove', handleActivity)
      window.removeEventListener('pointerdown', handleActivity)
    }
  }, [])

  // Calculate matrix3d whenever cornerOffsets or size changes
  useEffect(() => {
    if (!artworkRef.current) return
    const w = artworkRef.current.offsetWidth
    const h = artworkRef.current.offsetHeight
    if (w === 0 || h === 0) return

    const hasOffset = cornerOffsets.some((c) => c.x !== 0 || c.y !== 0)
    if (!hasOffset) {
      setMatrix3dString('')
      return
    }

    const srcPts = [0, 0, w, 0, w, h, 0, h]
    const dstPts = [
      0 + cornerOffsets[0].x,
      0 + cornerOffsets[0].y,
      w + cornerOffsets[1].x,
      0 + cornerOffsets[1].y,
      w + cornerOffsets[2].x,
      h + cornerOffsets[2].y,
      0 + cornerOffsets[3].x,
      h + cornerOffsets[3].y,
    ]

    try {
      const transform = PerspT(srcPts, dstPts)
      const c = transform.coeffs
      const matrix = [
        c[0], c[3], 0, c[6],
        c[1], c[4], 0, c[7],
        0, 0, 1, 0,
        c[2], c[5], 0, 1,
      ]
        .map((n) => n.toFixed(6))
        .join(', ')
      setMatrix3dString(matrix)
    } catch (e) {
      console.error('Error calculating perspective matrix:', e)
    }
  }, [cornerOffsets, artworkSize, isOpen])

  const startCamera = async () => {
    try {
      setError('')
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Камера не поддерживается на этом устройстве')
        return
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setStream(newStream)

      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      console.warn('Error accessing camera:', err)
      setError('Не удалось подключиться к камере. Выберите фото стены.')
      setBackgroundMode('image')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setBackgroundImage(e.target.result as string)
          setBackgroundMode('image')
          stopCamera()
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const switchToCamera = () => {
    setBackgroundMode('camera')
    startCamera()
  }

  // Handle modal opening and camera access
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      if (backgroundMode === 'camera') {
        startCamera()
      }
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, facingMode, backgroundMode])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // Keyboard Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Smart Gestures for dragging and perspective skewing
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement
    const isButton = target.closest('button') || target.tagName === 'INPUT'
    if (isButton) return

    let isArtwork = target.closest('.wall-artwork') !== null
    let closestCornerIndex = -1

    if (artworkRef.current) {
      const rect = artworkRef.current.getBoundingClientRect()
      const corners = [
        { x: rect.left, y: rect.top },
        { x: rect.right, y: rect.top },
        { x: rect.right, y: rect.bottom },
        { x: rect.left, y: rect.bottom },
      ]

      const hitboxRadius = Math.max(40, 120 * (artworkSize / 100))
      for (let i = 0; i < corners.length; i++) {
        const dist = Math.hypot(e.clientX - corners[i].x, e.clientY - corners[i].y)
        if (dist < hitboxRadius) {
          closestCornerIndex = i
          isArtwork = true
          break
        }
      }
    }

    if (isArtwork) {
      e.preventDefault()
    }

    const newPointers = new Map(activePointers)
    newPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    setActivePointers(newPointers)

    if (newPointers.size === 2) {
      const pts = Array.from(newPointers.values())
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      pinchStartDist.current = dist
      pinchStartSize.current = artworkSize

      setIsDragging(false)
      setActiveCorner(null)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      return
    }

    if (newPointers.size > 2 || !isArtwork) return

    setIsDragging(true)
    const clientX = e.clientX
    const clientY = e.clientY
    lastPointerPosition.current = { x: clientX, y: clientY }

    if (closestCornerIndex !== -1) {
      setActiveCorner(closestCornerIndex)
      return
    }

    setDragStart({
      x: clientX - (artworkPosition.x * window.innerWidth) / 100,
      y: clientY - (artworkPosition.y * window.innerHeight) / 100,
    })

    longPressTimer.current = setTimeout(() => {
      if (!artworkRef.current) return
      const rect = artworkRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let cornerIndex = 0
      if (clientX < centerX && clientY < centerY) cornerIndex = 0
      else if (clientX >= centerX && clientY < centerY) cornerIndex = 1
      else if (clientX >= centerX && clientY >= centerY) cornerIndex = 2
      else if (clientX < centerX && clientY >= centerY) cornerIndex = 3

      setActiveCorner(cornerIndex)
      if (navigator.vibrate) {
        try { navigator.vibrate(50) } catch {}
      }
    }, 400)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const newPointers = new Map(activePointers)
    if (newPointers.has(e.pointerId)) {
      newPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      setActivePointers(newPointers)
    }

    if (
      newPointers.size === 2 &&
      pinchStartDist.current !== null &&
      pinchStartSize.current !== null
    ) {
      const pts = Array.from(newPointers.values())
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const ratio = dist / pinchStartDist.current
      const newSize = pinchStartSize.current * ratio
      setArtworkSize(Math.max(10, Math.min(80, newSize)))
      return
    }

    if (!isDragging) return

    const scale = artworkSize / 100
    const clientX = e.clientX
    const clientY = e.clientY
    const dx = (clientX - lastPointerPosition.current.x) / scale
    const dy = (clientY - lastPointerPosition.current.y) / scale

    if (activeCorner === null && longPressTimer.current) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    if (activeCorner !== null) {
      if (artworkRef.current) {
        const w = artworkRef.current.offsetWidth
        const h = artworkRef.current.offsetHeight

        setCornerOffsets((prev) => {
          const newOffsets = [...prev]
          let nx = prev[activeCorner].x + dx
          let ny = prev[activeCorner].y + dy

          const maxInwardX = w * 0.45
          const maxInwardY = h * 0.45
          const maxOutwardX = w * 1.5
          const maxOutwardY = h * 1.5

          if (activeCorner === 0) {
            if (nx > maxInwardX) nx = maxInwardX
            if (ny > maxInwardY) ny = maxInwardY
            if (nx < -maxOutwardX) nx = -maxOutwardX
            if (ny < -maxOutwardY) ny = -maxOutwardY
          } else if (activeCorner === 1) {
            if (nx < -maxInwardX) nx = -maxInwardX
            if (ny > maxInwardY) ny = maxInwardY
            if (nx > maxOutwardX) nx = maxOutwardX
            if (ny < -maxOutwardY) ny = -maxOutwardY
          } else if (activeCorner === 2) {
            if (nx < -maxInwardX) nx = -maxInwardX
            if (ny < -maxInwardY) ny = -maxInwardY
            if (nx > maxOutwardX) nx = maxOutwardX
            if (ny > maxOutwardY) ny = maxOutwardY
          } else if (activeCorner === 3) {
            if (nx > maxInwardX) nx = maxInwardX
            if (ny < -maxInwardY) ny = -maxInwardY
            if (nx < -maxOutwardX) nx = -maxOutwardX
            if (ny > maxOutwardY) ny = maxOutwardY
          }

          newOffsets[activeCorner] = { x: nx, y: ny }
          return newOffsets
        })
      }
      lastPointerPosition.current = { x: clientX, y: clientY }
    } else if (!longPressTimer.current) {
      const newX = ((clientX - dragStart.x) / window.innerWidth) * 100
      const newY = ((clientY - dragStart.y) / window.innerHeight) * 100
      setArtworkPosition({
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY)),
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    const newPointers = new Map(activePointers)
    newPointers.delete(e.pointerId)
    setActivePointers(newPointers)

    if (newPointers.size < 2) {
      pinchStartDist.current = null
      pinchStartSize.current = null
    }

    if (newPointers.size === 0) {
      setIsDragging(false)
      setActiveCorner(null)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }

  // Trackpad pinch-to-zoom
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const container = containerRef.current
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = -e.deltaY
        setArtworkSize((prev) => Math.max(10, Math.min(80, prev + delta * 0.1)))
      }
    }
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [isOpen])

  // Double click resets corner perspective
  const handleBackgroundDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'INPUT') {
      return
    }
    setCornerOffsets([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ])
  }

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[100] transition-all duration-300 ease-out overflow-hidden touch-none overscroll-none select-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: '#faf8f8' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleBackgroundDoubleClick}
    >
      {/* Background - Camera or Image */}
      {backgroundMode === 'camera' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: imageFitMode,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#faf8f8',
          }}
        />
      )}

      {/* Error / Fallback Notice */}
      {error && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bg-transparent text-[#0f0b0c] p-4 text-center text-sm font-sans"
          style={{ top: 'calc(50% + 150px)' }}
        >
          {error}
        </div>
      )}

      {/* Artwork Overlay */}
      <div
        className="absolute cursor-move select-none wall-artwork pointer-events-auto"
        style={{
          left: `${artworkPosition.x}%`,
          top: `${artworkPosition.y}%`,
          width: '100vw',
          transform: `translate(-50%, -50%) scale(${artworkSize / 100})`,
          touchAction: 'none',
        }}
      >
        <div
          ref={artworkRef}
          style={{
            transformOrigin: '0 0',
            transform: matrix3dString ? `matrix3d(${matrix3dString})` : 'none',
          }}
        >
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-auto object-contain select-none pointer-events-none"
            style={{
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.32))',
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Top Controls (Close Button) */}
      <button
        type="button"
        onClick={handleClose}
        className={`group absolute top-0 right-0 z-50 flex h-12 w-16 cursor-pointer items-center justify-center sm:h-[4.5rem] sm:w-20 pointer-events-auto transition-opacity duration-500 ${
          isInterfaceVisible ? 'opacity-100' : 'opacity-0 !pointer-events-none'
        }`}
        title="Закрыть примерку"
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          <img
            src="/images/cross.svg"
            alt=""
            width={20}
            height={20}
            className="absolute h-5 w-5 transition-opacity duration-500 ease-in-out group-hover:opacity-60 pointer-events-none"
            style={wallIconImageStyle}
          />
        </span>
      </button>

      {/* Bottom Controls - Dimensions, Buttons & Slider */}
      <div
        className={`absolute bottom-4 left-4 right-4 flex flex-col items-center justify-end gap-1.5 z-10 pointer-events-none transition-opacity duration-500 ${
          isInterfaceVisible ? 'opacity-100' : 'opacity-0 !pointer-events-none'
        }`}
      >
        {/* Dimensions Display only if explicitly filled in post mode */}
        {dimensions && dimensions.trim().length > 0 && (
          <div className="pointer-events-auto">
            <p
              className="text-sm font-medium"
              style={{
                color: '#3c2d2e',
                textShadow: '0 1px 1px #faf8f8, 0 0 3px #faf8f8',
                fontVariantNumeric: 'lining-nums tabular-nums',
                fontFamily: "'EBGaramond', Georgia, serif",
              }}
            >
              {dimensions.trim()}
            </p>
          </div>
        )}

        <div className="flex w-full justify-center items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            {/* Upload Background Image */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex h-10 w-10 cursor-pointer items-center justify-center"
              title="Загрузить фото стены"
            >
              <img
                src="/images/gallery.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 transition-opacity duration-500 ease-in-out group-hover:opacity-60 pointer-events-none"
                style={wallIconImageStyle}
              />
            </button>

            {/* Switch Camera */}
            {backgroundMode === 'camera' && (
              <button
                type="button"
                onClick={switchCamera}
                className="group flex h-10 w-10 cursor-pointer items-center justify-center"
                title="Сменить камеру"
              >
                <img
                  src="/images/switch.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 transition-opacity duration-500 ease-in-out group-hover:opacity-60 pointer-events-none"
                  style={wallIconImageStyle}
                />
              </button>
            )}

            {/* Use Camera when in Image Mode */}
            {backgroundMode === 'image' && (
              <>
                <button
                  type="button"
                  onClick={switchToCamera}
                  className="group flex h-10 w-10 cursor-pointer items-center justify-center"
                  title="Включить камеру"
                >
                  <img
                    src="/images/switch.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 transition-opacity duration-500 ease-in-out group-hover:opacity-60 pointer-events-none"
                    style={wallIconImageStyle}
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImageFitMode(imageFitMode === 'cover' ? 'contain' : 'cover')
                  }
                  className="group flex h-10 w-10 cursor-pointer items-center justify-center px-1 text-sm font-medium transition-opacity duration-500 ease-in-out group-hover:opacity-60"
                  style={wallTextStyle}
                  title={imageFitMode === 'cover' ? 'Показать полностью' : 'Заполнить'}
                >
                  {imageFitMode === 'cover' ? 'Вместить' : 'Заполнить'}
                </button>
              </>
            )}
          </div>

          {/* Wall Size Range Slider */}
          <input
            type="range"
            min="10"
            max="80"
            value={artworkSize}
            onChange={(e) => setArtworkSize(Number(e.target.value))}
            className="slider-wall w-48 sm:w-64 h-2 cursor-pointer appearance-none rounded-lg"
            style={{
              boxShadow: WALL_BLACK_SHADOW,
              background: `linear-gradient(to right, ${WALL_SLIDER_TRACK_FILL} 0%, ${WALL_SLIDER_TRACK_FILL} ${
                ((artworkSize - 10) / 70) * 100
              }%, ${WALL_SLIDER_TRACK_REST} ${
                ((artworkSize - 10) / 70) * 100
              }%, ${WALL_SLIDER_TRACK_REST} 100%)`,
            }}
          />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />

      {/* Custom Slider Styles */}
      <style>{`
        .slider-wall::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${WALL_SLIDER_THUMB};
          cursor: pointer;
          border: 1px solid rgba(253, 252, 252, 0.75);
          box-shadow: 0 1px 3px rgba(15, 11, 12, 0.42);
        }

        .slider-wall::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${WALL_SLIDER_THUMB};
          cursor: pointer;
          border: 1px solid rgba(253, 252, 252, 0.75);
          box-shadow: 0 1px 3px rgba(15, 11, 12, 0.42);
        }
      `}</style>
    </div>
  )
}
