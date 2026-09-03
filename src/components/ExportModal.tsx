import React, { useState } from 'react'
import { X, Download, Copy, Check } from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  canvas: HTMLCanvasElement | null
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, canvas }) => {
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [quality, setQuality] = useState(0.92)
  const [copied, setCopied] = useState(false)

  if (!isOpen || !canvas) return null

  const width = canvas.width
  const height = canvas.height

  const handleDownload = () => {
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'
    const dataUrl = canvas.toDataURL(format, quality)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `artwork_${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    onClose()
  }

  const handleCopyToClipboard = async () => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    } catch (e) {
      console.error('Copy to clipboard failed:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#faf8f8] border border-[#e3dbdc] p-6 max-w-sm w-full shadow-xl flex flex-col gap-5 text-[#0f0b0c]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3dbdc] pb-3">
          <div>
            <h3 className="text-base font-normal text-[#0f0b0c] tracking-tight">Export Artwork</h3>
            <p className="text-xs text-[#565051] font-mono">{width} × {height} px</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-normal text-[#565051] uppercase tracking-wider">Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'image/jpeg', label: 'JPG' },
              { id: 'image/png', label: 'PNG' },
              { id: 'image/webp', label: 'WebP' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`py-1.5 text-xs font-normal transition-colors border cursor-pointer ${
                  format === f.id
                    ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                    : 'bg-white border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider */}
        {format !== 'image/png' && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#565051] font-normal uppercase tracking-wider">Quality</span>
              <span className="font-mono text-[#0f0b0c]">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full lr-slider"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] hover:border-[#34292a] text-[#faf8f8] text-xs font-normal flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Artwork</span>
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="w-full py-2 bg-white hover:bg-[#faf8f8] border border-[#e3dbdc] hover:border-[#34292a] text-[#0f0b0c] text-xs font-normal flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#565051]" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
