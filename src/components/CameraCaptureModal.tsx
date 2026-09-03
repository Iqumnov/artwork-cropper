import { useState, useRef, useEffect } from 'react'
import { X, Camera, RefreshCw, Check } from 'lucide-react'

interface CameraCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (dataUrl: string) => void
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isOpen) {
      stopStream()
      setCapturedUrl(null)
      return
    }

    startCamera()

    return () => {
      stopStream()
    }
  }, [isOpen, facingMode])

  const startCamera = async () => {
    stopStream()
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
        },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (e: any) {
      console.error('Camera access error:', e)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1920
    canvas.height = video.videoHeight || 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
    setCapturedUrl(dataUrl)
    stopStream()
  }

  const handleRetake = () => {
    setCapturedUrl(null)
    startCamera()
  }

  const handleConfirm = () => {
    if (capturedUrl) {
      onCapture(capturedUrl)
      onClose()
    }
  }

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 z-10">
        <span className="text-sm font-medium tracking-wide text-white/80">Scan Artwork / Document</span>
        <button
          onClick={onClose}
          className="w-10 h-10 squircle-full glass-pill flex items-center justify-center text-white hover:bg-white/20 transition-transform active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera / Preview Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="p-6 text-center text-red-400 text-sm">{error}</div>
        ) : capturedUrl ? (
          <img src={capturedUrl} alt="Captured" className="max-h-full max-w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {/* Guide overlay */}
            <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-white/40 tracking-wider uppercase">Align artwork within frame</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-6 pb-8 flex items-center justify-around z-10 glass-panel border-t border-white/10">
        {capturedUrl ? (
          <>
            <button
              onClick={handleRetake}
              className="px-5 py-2.5 squircle-full glass-pill text-sm font-medium text-white flex items-center gap-2 hover:bg-white/20 transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 squircle-full bg-[oklch(var(--button-green))] hover:bg-[oklch(var(--button-green-hover))] text-white text-sm font-medium flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              Use Photo
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleToggleFacingMode}
              className="w-12 h-12 squircle-full glass-pill flex items-center justify-center text-white hover:bg-white/20 transition-transform active:scale-95"
              title="Flip camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleTakeSnapshot}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-white active:bg-white/80 transition-colors flex items-center justify-center">
                <Camera className="w-6 h-6 text-black" />
              </div>
            </button>

            <div className="w-12 h-12" />
          </>
        )}
      </div>
    </div>
  )
}
