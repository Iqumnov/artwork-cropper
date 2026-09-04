import { useState, useEffect, useCallback } from 'react'
import { LandingUpload } from './components/LandingUpload'
import { EditorView } from './components/EditorView'
import { LightroomAdjustments, EditorTab, ScanPoint, CropArea, ArtworkInfo, ImageQueueItem } from './types'
import { getEditorSession, clearEditorSession, EditorSessionData } from './lib/history-storage'

export function App() {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([])
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedAdjustments, setSelectedAdjustments] = useState<LightroomAdjustments | undefined>(undefined)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | undefined>(undefined)
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined)
  const [selectedArtworkInfo, setSelectedArtworkInfo] = useState<ArtworkInfo | undefined>(undefined)

  // Restored Session Properties
  const [sessionData, setSessionData] = useState<EditorSessionData | null>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

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
          onBack={handleBack}
        />
      ) : (
        <LandingUpload onImageSelect={handleSelect} onImagesSelect={handleBatchSelect} />
      )}
    </div>
  )
}

export default App
