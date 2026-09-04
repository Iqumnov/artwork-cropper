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
      setError('Не удалось подключиться к камере. Проверьте разрешения.')
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
    <div className="fixed inset-0 z-[100] bg-[#faf8f8] flex flex-col justify-between overflow-hidden text-[#0f0b0c]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e3dbdc] bg-[#faf8f8] z-10">
        <span className="text-xs font-normal tracking-wider uppercase text-[#565051]">Снимок камерой</span>
        <button
          onClick={onClose}
          className="w-8 h-8 border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
          title="Закрыть"
        >
          <X className="w-4 h-4 text-[#565051]" />
        </button>
      </div>

      {/* Camera / Preview Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-[#161415]">
        {error ? (
          <div className="p-6 text-center text-red-400 text-sm">{error}</div>
        ) : capturedUrl ? (
          <img src={capturedUrl} alt="Снимок" className="max-h-full max-w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {/* Alignment Box */}
            <div className="absolute inset-8 border border-[#e3dbdc]/40 pointer-events-none flex items-center justify-center">
              <span className="text-[11px] text-white/50 tracking-wider uppercase">Поместите работу в рамку</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 flex items-center justify-around z-10 bg-[#faf8f8] border-t border-[#e3dbdc]">
        {capturedUrl ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetake}
              className="px-4 py-2 border border-[#e3dbdc] hover:border-[#34292a] text-xs font-normal text-[#0f0b0c] flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#565051]" />
              <span>Переснять</span>
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] hover:border-[#34292a] text-[#faf8f8] text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Использовать</span>
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleToggleFacingMode}
              className="w-10 h-10 border border-[#e3dbdc] hover:border-[#34292a] bg-white flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
              title="Сменить камеру"
            >
              <RefreshCw className="w-4 h-4 text-[#565051]" />
            </button>

            {/* Shutter Button */}
            <button
              onClick={handleTakeSnapshot}
              className="w-14 h-14 border-2 border-[#0f0b0c] bg-white hover:bg-[#34292a] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Сделать снимок"
            >
              <Camera className="w-5 h-5 text-[#0f0b0c]" />
            </button>

            <div className="w-10 h-10" />
          </>
        )}
      </div>
    </div>
  )
}
