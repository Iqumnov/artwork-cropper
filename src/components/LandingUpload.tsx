import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, Sparkles, Sliders, Crop, Loader2 } from 'lucide-react'
import { CameraCaptureModal } from './CameraCaptureModal'
import { generateSampleArtwork } from '../lib/sample-images'
import { ArtworkHistoryCarousel } from './ArtworkHistoryCarousel'
import { getArtworkHistory, deleteArtworkFromHistory, clearArtworkHistory, HistoryArtwork } from '../lib/history-storage'
import { LightroomAdjustments } from '../types'

interface LandingUploadProps {
  onImageSelect: (imageUrl: string, initialAdjustments?: LightroomAdjustments, artworkId?: string) => void
}

export const LandingUpload: React.FC<LandingUploadProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [historyItems, setHistoryItems] = useState<HistoryArtwork[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Load history from IndexedDB / localStorage
  const loadHistory = async () => {
    const items = await getArtworkHistory()
    setHistoryItems(items)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteArtworkFromHistory(id)
    setHistoryItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClearAllHistory = async () => {
    await clearArtworkHistory()
    setHistoryItems([])
  }

  // Unified File Processor supporting all formats
  const processFile = async (file: File) => {
    setIsProcessing(true)
    try {
      const fileNameLower = file.name.toLowerCase()
      const isHeic =
        fileNameLower.endsWith('.heic') ||
        fileNameLower.endsWith('.heif') ||
        file.type === 'image/heic' ||
        file.type === 'image/heif'

      if (isHeic) {
        try {
          const heic2anyModule = await import('heic2any')
          const heic2any = heic2anyModule.default || heic2anyModule
          const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.95,
          })
          const blob = Array.isArray(converted) ? converted[0] : converted
          const url = URL.createObjectURL(blob)
          onImageSelect(url)
          return
        } catch (heicErr) {
          console.warn('heic2any conversion error, falling back to standard reader:', heicErr)
        }
      }

      // Standard FileReader for JPG, PNG, WebP, AVIF, BMP, GIF, SVG
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelect(event.target.result as string)
        }
      }
      reader.onerror = (e) => {
        console.error('File read error:', e)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsProcessing(false)
    }
  }

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            processFile(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleCameraClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click()
    } else {
      setShowCameraModal(true)
    }
  }

  const handleLoadSample = (type: 'fine-art' | 'modern' | 'document') => {
    const sampleDataUrl = generateSampleArtwork(type)
    if (sampleDataUrl) {
      onImageSelect(sampleDataUrl)
    }
  }

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-y-auto no-scrollbar bg-[#0c0d0e] p-3 sm:p-5 select-none relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[oklch(var(--button-green))] animate-spin" />
          <span className="text-sm font-medium text-white/90">Processing image...</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif,.avif,.webp,.png,.jpg,.jpeg,.bmp,.gif,.tiff,.svg"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="flex items-center justify-between py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-1.5 shadow-md">
            <img src="/artei-logo.svg" alt="ARTEI" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
              ARTEI <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">STUDIO</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-white/50 tracking-wider">Perspective Scanner & Adobe Lightroom Grading</p>
          </div>
        </div>

        <button
          onClick={handleCameraClick}
          className="flex items-center gap-1.5 px-3 py-1.5 squircle-full glass-pill text-xs font-medium text-white hover:bg-white/15 transition-transform active:scale-95"
          title="Take photo with camera"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Take Photo</span>
        </button>
      </header>

      {/* Main Upload Dropzone Area */}
      <main className="flex-1 flex flex-col justify-center items-center max-w-xl w-full mx-auto my-auto py-3 gap-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full group cursor-pointer relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 border-2 border-dashed flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-[oklch(var(--brand-green))] bg-[oklch(var(--brand-green)/0.12)] scale-[1.01]'
              : 'border-white/15 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.05]'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[oklch(var(--brand-green)/0.2)] blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />

          {/* Icon Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 squircle-2xl bg-white/10 flex items-center justify-center mb-3 text-white shadow-xl group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-white/90" />
          </div>

          <h2 className="text-base sm:text-lg font-medium text-white mb-1.5 tracking-tight">
            Drop artwork or document here
          </h2>
          <p className="text-xs text-white/50 max-w-sm mb-4 leading-relaxed">
            Select from library, take photo with camera, or paste from clipboard (supports JPG, PNG, HEIC, WebP, AVIF, TIFF, SVG)
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="px-5 py-2 squircle-full bg-white text-black hover:bg-white/90 text-xs sm:text-sm font-medium tracking-wide shadow-lg transition-transform group-hover:scale-105 active:scale-95"
            >
              Select Photo
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleCameraClick()
              }}
              className="px-4 py-2 squircle-full glass-pill text-white hover:bg-white/15 text-xs sm:text-sm font-medium tracking-wide flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
          </div>
        </div>

        {/* Edit History Carousel (Persistent, Unlimited) */}
        {historyItems.length > 0 && (
          <div className="w-full glass-panel p-3 rounded-2xl border border-white/10">
            <ArtworkHistoryCarousel
              items={historyItems}
              onSelect={(item) => onImageSelect(item.dataUrl, item.adjustments, item.id)}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
            />
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="glass-panel p-2 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 squircle-sm bg-white/10 flex items-center justify-center shrink-0">
              <Crop className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-white/90 truncate">Scanner Warp</div>
              <div className="text-[8px] sm:text-[9px] text-white/50 truncate">4-Pin Perspective</div>
            </div>
          </div>

          <div className="glass-panel p-2 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 squircle-sm bg-white/10 flex items-center justify-center shrink-0">
              <Sliders className="w-3 h-3 text-[oklch(var(--brand-green))]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-white/90 truncate">Lightroom Suite</div>
              <div className="text-[8px] sm:text-[9px] text-white/50 truncate">HSL & Curves</div>
            </div>
          </div>

          <div className="glass-panel p-2 rounded-xl flex items-center gap-2">
            <div className="w-6 h-6 squircle-sm bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-medium text-white/90 truncate">12 Pro Presets</div>
              <div className="text-[8px] sm:text-[9px] text-white/50 truncate">Portra & Cinema</div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Test Samples Shelf */}
      <footer className="w-full max-w-xl mx-auto pt-1 pb-1 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-white/50">
            Quick Test Artworks
          </span>
          <span className="text-[9px] text-white/30">1-tap instant load</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleLoadSample('document')}
            className="group relative overflow-hidden rounded-xl p-2 glass-panel hover:border-white/30 text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px]">
                📐
              </div>
              <span className="text-[11px] font-medium text-white/90 group-hover:text-white truncate">Catalog Scan</span>
            </div>
            <p className="text-[9px] text-white/50 line-clamp-1">Perspective test</p>
          </button>

          <button
            onClick={() => handleLoadSample('fine-art')}
            className="group relative overflow-hidden rounded-xl p-2 glass-panel hover:border-white/30 text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center text-[9px]">
                🎨
              </div>
              <span className="text-[11px] font-medium text-white/90 group-hover:text-white truncate">Oil Portrait</span>
            </div>
            <p className="text-[9px] text-white/50 line-clamp-1">Rich skin tones</p>
          </button>

          <button
            onClick={() => handleLoadSample('modern')}
            className="group relative overflow-hidden rounded-xl p-2 glass-panel hover:border-white/30 text-left transition-all active:scale-95"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px]">
                ✨
              </div>
              <span className="text-[11px] font-medium text-white/90 group-hover:text-white truncate">Modern Art</span>
            </div>
            <p className="text-[9px] text-white/50 line-clamp-1">Vivid chromatic</p>
          </button>
        </div>
      </footer>

      {/* In-App Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={onImageSelect}
      />
    </div>
  )
}
