import React, { useState, useRef, useEffect } from 'react'
import { Upload, Camera, Loader2 } from 'lucide-react'
import { CameraCaptureModal } from './CameraCaptureModal'
import { generateSampleArtwork } from '../lib/sample-images'
import { ArtworkHistoryCarousel } from './ArtworkHistoryCarousel'
import { getArtworkHistory, deleteArtworkFromHistory, clearArtworkHistory, HistoryArtwork } from '../lib/history-storage'
import { loadAnyImageFile } from '../lib/image-loader'
import { LightroomAdjustments, ArtworkInfo, ImageQueueItem } from '../types'

interface LandingUploadProps {
  onImageSelect: (
    imageUrl: string,
    initialAdjustments?: LightroomAdjustments,
    artworkId?: string,
    fileName?: string,
    artworkInfo?: ArtworkInfo
  ) => void
  onImagesSelect?: (items: ImageQueueItem[]) => void
}

export const LandingUpload: React.FC<LandingUploadProps> = ({ onImageSelect, onImagesSelect }) => {
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

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    setIsProcessing(true)
    try {
      const items: ImageQueueItem[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const res = await loadAnyImageFile(file)
        if (res && res.dataUrl) {
          items.push({
            id: `art_${Date.now()}_${i}`,
            url: res.dataUrl,
            fileName: file.name
          })
        }
      }
      if (items.length > 0) {
        if (onImagesSelect) {
          onImagesSelect(items)
        } else {
          onImageSelect(items[0].url, undefined, items[0].id, items[0].fileName)
        }
      }
    } catch (err) {
      console.error('File processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

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
      if (files.length > 0) {
        processFiles(files)
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
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

  const handleLoadBatchSample = () => {
    const s1 = generateSampleArtwork('document')
    const s2 = generateSampleArtwork('fine-art')
    const s3 = generateSampleArtwork('modern')
    const items: ImageQueueItem[] = [
      { id: `sample_doc_${Date.now()}`, url: s1, fileName: 'sample-document-crop.jpg', artworkInfo: { title: 'Скан каталога', artist: 'Архив', medium: 'Документ' } },
      { id: `sample_fine_${Date.now()}`, url: s2, fileName: 'sample-fine-art.jpg', artworkInfo: { title: 'Масляный портрет', artist: 'Классик', medium: 'Холст, масло' } },
      { id: `sample_mod_${Date.now()}`, url: s3, fileName: 'sample-modern-art.jpg', artworkInfo: { title: 'Современный арт', artist: 'Модерн', medium: 'Акрил' } }
    ]
    if (onImagesSelect) {
      onImagesSelect(items)
    } else {
      onImageSelect(items[0].url, undefined, items[0].id, items[0].fileName, items[0].artworkInfo)
    }
  }

  return (
    <div className="h-full w-full max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#faf8f8] text-[#0f0b0c] p-3 sm:p-5 select-none relative">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-[#faf8f8]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 border border-[#e3dbdc]">
          <Loader2 className="w-8 h-8 text-[#0f0b0c] animate-spin" />
          <span className="text-sm sm:text-base text-[#565051] font-normal">Обработка изображения...</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif,.dng,.tiff,.tif,.avif,.webp,.png,.jpg,.jpeg,.bmp"
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

      {/* Main Upload Dropzone Area (Zero vertical scroll, strictly fits 100dvh) */}
      <main className="flex-1 min-h-0 flex flex-col justify-center items-center max-w-2xl w-full mx-auto my-auto py-1 gap-2.5">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full group cursor-pointer relative p-5 sm:p-8 transition-all duration-200 border flex flex-col items-center justify-center text-center ${
            isDragging
              ? 'border-[#34292a] bg-[#e3dbdc]/40'
              : 'border-[#e3dbdc] hover:border-[#34292a] bg-white/70 hover:bg-white'
          }`}
        >
          {/* Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 border border-[#e3dbdc] flex items-center justify-center mb-2.5 text-[#0f0b0c] group-hover:border-[#34292a] transition-colors">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#565051] group-hover:text-[#0f0b0c] transition-colors" />
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#0f0b0c] mb-1 font-body tracking-tight">
            Редактор фото
          </h1>
          <p className="text-xs sm:text-sm text-[#565051] max-w-md mb-4 leading-relaxed">
            Перетащите изображение сюда (можно сразу несколько), сделайте снимок на камеру или выберите файлы (JPG, PNG, HEIC, DNG, TIFF, WebP)
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="px-5 py-2 bg-[#0f0b0c] text-[#faf8f8] hover:bg-[#34292a] border border-[#0f0b0c] hover:border-[#34292a] text-xs sm:text-sm font-normal tracking-wide transition-colors cursor-pointer"
            >
              Выбрать фото
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleCameraClick()
              }}
              className="px-4 py-2 border border-[#e3dbdc] hover:border-[#34292a] bg-[#faf8f8] text-[#0f0b0c] text-xs sm:text-sm font-normal flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#565051]" />
              <span>Камера</span>
            </button>
          </div>
        </div>

        {/* Edit History Carousel */}
        {historyItems.length > 0 && (
          <div className="w-full border border-[#e3dbdc] p-2 bg-white/70 shrink-0">
            <ArtworkHistoryCarousel
              items={historyItems}
              onSelect={(item) => onImageSelect(item.dataUrl, item.adjustments, item.id, item.fileName, item.artworkInfo)}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
            />
          </div>
        )}
      </main>

      {/* Quick Test Samples Shelf */}
      <footer className="w-full max-w-2xl mx-auto pt-1 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-normal tracking-widest uppercase text-[#565051]">
            Тестовые образцы
          </span>
          <span className="text-xs text-[#565051]">клик для загрузки</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <button
            onClick={() => handleLoadSample('document')}
            className="group p-2 sm:p-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-white/60 hover:bg-white text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-[#0f0b0c] mb-0.5 truncate font-normal">Скан каталога</div>
            <p className="text-xs text-[#565051] truncate">Тест перспективы</p>
          </button>

          <button
            onClick={() => handleLoadSample('fine-art')}
            className="group p-2 sm:p-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-white/60 hover:bg-white text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-[#0f0b0c] mb-0.5 truncate font-normal">Масляный портрет</div>
            <p className="text-xs text-[#565051] truncate">Тональность кожи</p>
          </button>

          <button
            onClick={() => handleLoadSample('modern')}
            className="group p-2 sm:p-2.5 border border-[#e3dbdc] hover:border-[#34292a] bg-white/60 hover:bg-white text-left transition-colors cursor-pointer"
          >
            <div className="text-xs text-[#0f0b0c] mb-0.5 truncate font-normal">Современный арт</div>
            <p className="text-xs text-[#565051] truncate">Хроматика цвета</p>
          </button>

          <button
            onClick={handleLoadBatchSample}
            className="group p-2 sm:p-2.5 border border-[#34292a] bg-[#0f0b0c] text-[#faf8f8] hover:bg-[#34292a] text-left transition-colors cursor-pointer shadow-xs"
          >
            <div className="text-xs text-[#faf8f8] mb-0.5 truncate font-medium">Серия (3 работы)</div>
            <p className="text-xs text-[#e3dbdc] truncate">Пакетный режим</p>
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
