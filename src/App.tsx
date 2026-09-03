import { useState } from 'react'
import { LandingUpload } from './components/LandingUpload'
import { EditorView } from './components/EditorView'

export function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="w-full h-full overflow-hidden bg-[#0c0d0e] text-white">
      {selectedImage ? (
        <EditorView
          initialImageUrl={selectedImage}
          onBack={() => setSelectedImage(null)}
        />
      ) : (
        <LandingUpload onImageSelect={(url) => setSelectedImage(url)} />
      )}
    </div>
  )
}

export default App
