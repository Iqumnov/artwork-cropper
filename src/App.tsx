import { useState } from 'react'
import { LandingUpload } from './components/LandingUpload'
import { EditorView } from './components/EditorView'
import { LightroomAdjustments } from './types'

export function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedAdjustments, setSelectedAdjustments] = useState<LightroomAdjustments | undefined>(undefined)
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | undefined>(undefined)

  const handleSelect = (url: string, adj?: LightroomAdjustments, id?: string) => {
    setSelectedImage(url)
    setSelectedAdjustments(adj)
    setSelectedArtworkId(id)
  }

  const handleBack = () => {
    setSelectedImage(null)
    setSelectedAdjustments(undefined)
    setSelectedArtworkId(undefined)
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#0c0d0e] text-white">
      {selectedImage ? (
        <EditorView
          initialImageUrl={selectedImage}
          initialAdjustments={selectedAdjustments}
          initialArtworkId={selectedArtworkId}
          onBack={handleBack}
        />
      ) : (
        <LandingUpload onImageSelect={handleSelect} />
      )}
    </div>
  )
}

export default App
