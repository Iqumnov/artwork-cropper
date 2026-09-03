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
    a.download = `artei_edit_${Date.now()}.${ext}`
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
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#16181b] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Export Artwork</h3>
            <p className="text-xs text-white/50">{width} × {height} px</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 squircle-full glass-pill flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-white/70">Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'image/jpeg', label: 'JPG' },
              { id: 'image/png', label: 'PNG' },
              { id: 'image/webp', label: 'WebP' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  format === f.id
                    ? 'bg-white text-black font-semibold shadow'
                    : 'glass-panel text-white/70 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (for JPEG / WebP) */}
        {format !== 'image/png' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70 font-medium">Quality</span>
              <span className="font-mono text-white/50">{Math.round(quality * 100)}%</span>
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
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={handleDownload}
            className="w-full py-3 squircle-full bg-[oklch(var(--button-green))] hover:bg-[oklch(var(--button-green-hover))] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download Artwork
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="w-full py-2.5 squircle-full glass-panel text-white/80 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
