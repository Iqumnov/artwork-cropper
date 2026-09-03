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
          console.warn('heic2any conversion error:', heicErr)
        }
      }

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
    <div className="h-full w-full flex flex-col justify-between overflow-y-auto no-scrollbar bg-[#faf8f8] text-[#0f0b0c] p-4 sm:p-8 select-none relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-[#faf8f8]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 border border-[#e3dbdc]">
          <Loader2 className="w-8 h-8 text-[#0f0b0c] animate-spin" />
          <span className="text-base text-[#565051] font-normal">Processing image...</span>
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

      {/* Top action row without any logo or header */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between pb-2">
        <div className="text-2xl font-heading text-[#0f0b0c]">
          Studio
        </div>
        <button
          onClick={handleCameraClick}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e3dbdc] hover:border-[#34292a] bg-transparent text-[#0f0b0c] text-sm transition-colors cursor-pointer"
          title="Take photo with camera"
        >
          <Camera className="w-3.5 h-3.5 text-[#565051]" />
          <span>Camera</span>
        </button>
      </div>

      {/* Main Upload Dropzone Area */}
      <main className="flex-1 flex flex-col justify-center items-center max-w-2xl w-full mx-auto my-auto py-4 gap-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full group cursor-pointer relative p-8 sm:p-12 transition-all duration-200 border flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-[#34292a] bg-[#e3dbdc]/40'
              : 'border-[#e3dbdc] hover:border-[#34292a] bg-[#ffffff]/60 hover:bg-[#ffffff]'
          }`}
        >
          {/* Icon */}
          <div className="w-12 h-12 border border-[#e3dbdc] flex items-center justify-center mb-4 text-[#0f0b0c] group-hover:border-[#34292a] transition-colors">
            <Upload className="w-5 h-5 text-[#565051] group-hover:text-[#0f0b0c] transition-colors" />
          </div>

          <h2 className="text-xl sm:text-2xl font-normal text-[#0f0b0c] mb-2 font-body tracking-tight">
            Drop artwork or document here
          </h2>
          <p className="text-sm text-[#565051] max-w-md mb-6 leading-relaxed">
            Select from library, capture with camera, or paste from clipboard (JPG, PNG, HEIC, WebP, AVIF, TIFF)
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="px-6 py-2.5 bg-[#0f0b0c] text-[#faf8f8] hover:bg-[#34292a] border border-[#0f0b0c] hover:border-[#34292a] text-sm font-normal tracking-wide transition-colors cursor-pointer"
            >
              Select Photo
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleCameraClick()
              }}
              className="px-5 py-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-[#faf8f8] text-[#0f0b0c] text-sm font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#565051]" />
              <span>Camera</span>
            </button>
          </div>
        </div>

        {/* Edit History Carousel (Persistent, Unlimited, 1px unrounded borders) */}
        {historyItems.length > 0 && (
          <div className="w-full border border-[#e3dbdc] p-3 bg-white/70">
            <ArtworkHistoryCarousel
              items={historyItems}
              onSelect={(item) => onImageSelect(item.dataUrl, item.adjustments, item.id)}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
            />
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="border border-[#e3dbdc] p-3 bg-white/50 flex items-center gap-2.5">
            <div className="w-6 h-6 border border-[#e3dbdc] flex items-center justify-center shrink-0">
              <Crop className="w-3.5 h-3.5 text-[#565051]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#0f0b0c] font-normal truncate">Scanner Warp</div>
              <div className="text-[11px] text-[#565051] truncate">4-Pin Perspective</div>
            </div>
          </div>

          <div className="border border-[#e3dbdc] p-3 bg-white/50 flex items-center gap-2.5">
            <div className="w-6 h-6 border border-[#e3dbdc] flex items-center justify-center shrink-0">
              <Sliders className="w-3.5 h-3.5 text-[#565051]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#0f0b0c] font-normal truncate">Lightroom Suite</div>
              <div className="text-[11px] text-[#565051] truncate">8-Color HSL & Curves</div>
            </div>
          </div>

          <div className="border border-[#e3dbdc] p-3 bg-white/50 flex items-center gap-2.5">
            <div className="w-6 h-6 border border-[#e3dbdc] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#565051]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[#0f0b0c] font-normal truncate">Pro Presets</div>
              <div className="text-[11px] text-[#565051] truncate">Portra & Cinema</div>
            </div>
          </div>
        </div>
      </main>

      {/* Quick Test Samples Shelf */}
      <footer className="w-full max-w-2xl mx-auto pt-2 pb-1 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-normal tracking-widest uppercase text-[#565051]">
            Quick Test Artworks
          </span>
          <span className="text-[11px] text-[#565051]">1-click load</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleLoadSample('document')}
            className="group p-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-white/60 hover:bg-white text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-[#0f0b0c] mb-0.5 truncate font-normal">Catalog Scan</div>
            <p className="text-[11px] text-[#565051] truncate">Perspective test</p>
          </button>

          <button
            onClick={() => handleLoadSample('fine-art')}
            className="group p-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-white/60 hover:bg-white text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-[#0f0b0c] mb-0.5 truncate font-normal">Oil Portrait</div>
            <p className="text-[11px] text-[#565051] truncate">Rich skin tones</p>
          </button>

          <button
            onClick={() => handleLoadSample('modern')}
            className="group p-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-white/60 hover:bg-white text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-[#0f0b0c] mb-0.5 truncate font-normal">Modern Art</div>
            <p className="text-[11px] text-[#565051] truncate">Chromatic study</p>
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
