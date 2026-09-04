import { useState, useEffect } from 'react'
import { LandingUpload } from './components/LandingUpload'
import { EditorView } from './components/EditorView'
import { LightroomAdjustments, EditorTab, ScanPoint, CropArea } from './types'
import { getEditorSession, clearEditorSession, EditorSessionData } from './lib/history-storage'

export function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedAdjustments, setSelectedAdjustments] = useState<LightroomAdjustments | undefined>(undefined)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | undefined>(undefined)

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
        }
      } catch (e) {
        console.warn('Session restoration failed:', e)
      } finally {
        setIsSessionLoading(false)
      }
    }
    restoreSession()
  }, [])

  const handleSelect = (url: string, adj?: LightroomAdjustments, id?: string) => {
    setSessionData(null)
    setSelectedImage(url)
    setSelectedAdjustments(adj)
    setSelectedArtworkId(id)
  }

  const handleBack = async () => {
    await clearEditorSession()
    setSessionData(null)
    setSelectedImage(null)
    setSelectedAdjustments(undefined)
    setSelectedArtworkId(undefined)
  }

  if (isSessionLoading) {
    return <div className="w-full h-full bg-[#faf8f8]" />
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#faf8f8] text-[#0f0b0c]">
      {selectedImage ? (
        <EditorView
          key={selectedImage}
          initialImageUrl={selectedImage}
          initialAdjustments={selectedAdjustments}
          initialArtworkId={selectedArtworkId}
          initialTab={sessionData?.activeTab as EditorTab | undefined}
          initialCropMode={sessionData?.cropMode}
          initialScanPoints={sessionData?.scanPoints as ScanPoint[] | undefined}
          initialFixedCropArea={sessionData?.fixedCropArea as CropArea | undefined}
          initialDrawerHeight={sessionData?.drawerHeight}
          onBack={handleBack}
        />
      ) : (
        <LandingUpload onImageSelect={handleSelect} />
      )}
    </div>
  )
}

export default App
