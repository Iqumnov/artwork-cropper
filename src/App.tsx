import { useState, useEffect, useCallback } from 'react'
import { Check } from 'lucide-react'
import { LandingUpload } from './components/LandingUpload'
import { EditorView } from './components/EditorView'
import { LightroomAdjustments, EditorTab, ScanPoint, CropArea, ArtworkInfo, ImageQueueItem } from './types'
import { getEditorSession, clearEditorSession, EditorSessionData } from './lib/history-storage'
import { loadAnyImageFile } from './lib/image-loader'
import { initOfflineQueueListener } from './lib/offline-queue'

export function App() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([])
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedAdjustments, setSelectedAdjustments] = useState<LightroomAdjustments | undefined>(undefined)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | undefined>(undefined)
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined)
  const [selectedArtworkInfo, setSelectedArtworkInfo] = useState<ArtworkInfo | undefined>(undefined)
  const [offlinePublishedToast, setOfflinePublishedToast] = useState<string | null>(null)

  // Restored Session Properties
  const [sessionData, setSessionData] = useState<EditorSessionData | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    initOfflineQueueListener((count) => {
      setOfflinePublishedToast(`Интернет восстановлен: опубликовано ${count} пост(ов)!`)
      setTimeout(() => setOfflinePublishedToast(null), 4000)
    })
  }, [])

  useEffect(() => {
    async function restoreSession() {
      try {
        const session = await getEditorSession()
        if (session && session.imageUrl) {
          setSessionData(session)
          setSelectedImage(session.imageUrl)
          setSelectedAdjustments(session.adjustments)
          setSelectedArtworkId(session.artworkId)
          setSelectedFileName(session.fileName)
          setSelectedArtworkInfo(session.artworkInfo)
          setImageQueue([{
            id: session.artworkId || `art_${Date.now()}`,
            url: session.imageUrl,
            fileName: session.fileName,
            artworkInfo: session.artworkInfo,
            adjustments: session.adjustments,
            scanPoints: session.scanPoints,
            fixedCropArea: session.fixedCropArea,
            cropMode: session.cropMode
          }])
          setCurrentQueueIndex(0)
        }
      } catch (e) {
        console.warn('Session restoration failed:', e)
      } finally {
        setIsSessionLoading(false)
      }
    }
    restoreSession()
  }, [])

  const handleSelect = (
    url: string,
    adj?: LightroomAdjustments,
    id?: string,
    fileName?: string,
    artworkInfo?: ArtworkInfo
  ) => {
    setSessionData(null)
    setSelectedImage(url)
    setSelectedAdjustments(adj)
    setSelectedArtworkId(id)
    setSelectedFileName(fileName)
    setSelectedArtworkInfo(artworkInfo)
    setImageQueue([{
      id: id || `art_${Date.now()}`,
      url,
      fileName,
      artworkInfo,
      adjustments: adj
    }])
    setCurrentQueueIndex(0)
  }

  const handleBatchSelect = (items: ImageQueueItem[]) => {
    if (!items || items.length === 0) return
    setSessionData(null)
    setImageQueue(items)
    setCurrentQueueIndex(0)
    setSelectedImage(items[0].url)
    setSelectedAdjustments(items[0].adjustments)
    setSelectedArtworkId(items[0].id)
    setSelectedFileName(items[0].fileName)
    setSelectedArtworkInfo(items[0].artworkInfo)
  }

  const handleNextImage = useCallback(() => {
    if (imageQueue.length <= 1) return
    const nextIdx = currentQueueIndex + 1
    if (nextIdx < imageQueue.length) {
      setCurrentQueueIndex(nextIdx)
      const nextItem = imageQueue[nextIdx]
      setSelectedImage(nextItem.url)
      setSelectedAdjustments(nextItem.adjustments)
      setSelectedArtworkId(nextItem.id)
      setSelectedFileName(nextItem.fileName)
      setSelectedArtworkInfo(nextItem.artworkInfo)
    }
  }, [imageQueue, currentQueueIndex])

  const handlePrevImage = useCallback(() => {
    if (imageQueue.length <= 1) return
    const prevIdx = currentQueueIndex - 1
    if (prevIdx >= 0) {
      setCurrentQueueIndex(prevIdx)
      const prevItem = imageQueue[prevIdx]
      setSelectedImage(prevItem.url)
      setSelectedAdjustments(prevItem.adjustments)
      setSelectedArtworkId(prevItem.id)
      setSelectedFileName(prevItem.fileName)
      setSelectedArtworkInfo(prevItem.artworkInfo)
    }
  }, [imageQueue, currentQueueIndex])

  const handleAddImages = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return
    try {
      const newItems: ImageQueueItem[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const res = await loadAnyImageFile(file)
        if (res && res.dataUrl) {
          newItems.push({
            id: `art_${Date.now()}_${i}`,
            url: res.dataUrl,
            fileName: file.name
          })
        }
      }
      if (newItems.length > 0) {
        setImageQueue(prev => [...prev, ...newItems])
      }
    } catch (e) {
      console.error('Failed to add images to queue:', e)
    }
  }, [])

  const handleBack = async () => {
    await clearEditorSession()
    setSessionData(null)
    setSelectedImage(null)
    setSelectedAdjustments(undefined)
    setSelectedArtworkId(undefined)
    setSelectedFileName(undefined)
    setSelectedArtworkInfo(undefined)
    setImageQueue([])
    setCurrentQueueIndex(0)
  }

  if (isSessionLoading) {
    return <div className="w-full h-full bg-[#faf8f8]" />
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#faf8f8] text-[#0f0b0c]">
      {selectedImage ? (
        <EditorView
          key={`${selectedArtworkId || selectedImage}_${currentQueueIndex}`}
          initialImageUrl={selectedImage}
          initialAdjustments={selectedAdjustments}
          initialArtworkId={selectedArtworkId}
          initialFileName={selectedFileName || sessionData?.fileName}
          initialArtworkInfo={selectedArtworkInfo || sessionData?.artworkInfo}
          initialTab={sessionData?.activeTab as EditorTab | undefined}
          initialCropMode={sessionData?.cropMode}
          initialScanPoints={sessionData?.scanPoints as ScanPoint[] | undefined}
          initialFixedCropArea={sessionData?.fixedCropArea as CropArea | undefined}
          initialDrawerHeight={sessionData?.drawerHeight}
          queueTotal={imageQueue.length}
          queueCurrentIndex={currentQueueIndex}
          onNextImage={handleNextImage}
          onPrevImage={handlePrevImage}
          onAddImages={handleAddImages}
          onBack={handleBack}
        />
      ) : (
        <LandingUpload onImageSelect={handleSelect} onImagesSelect={handleBatchSelect} />
      )}

      {offlinePublishedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 bg-[#0f0b0c] text-[#faf8f8] border border-[#34292a] text-xs font-normal shadow-2xl flex items-center gap-2 animate-fade-in pointer-events-none">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{offlinePublishedToast}</span>
        </div>
      )}
    </div>
  )
}

export default App
