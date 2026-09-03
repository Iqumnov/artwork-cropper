import React, { useRef, useEffect } from 'react'

interface HistogramProps {
  data: {
    rBins: Uint32Array
    gBins: Uint32Array
    bBins: Uint32Array
    lBins: Uint32Array
  } | null
  className?: string
}

export const Histogram: React.FC<HistogramProps> = ({ data, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Find maximum bin height for scaling (excluding zero-outliers)
    let max = 1
    for (let i = 2; i < 254; i++) {
      if (data.rBins[i] > max) max = data.rBins[i]
      if (data.gBins[i] > max) max = data.gBins[i]
      if (data.bBins[i] > max) max = data.bBins[i]
      if (data.lBins[i] > max) max = data.lBins[i]
    }

    const drawChannel = (bins: Uint32Array, color: string, fillAlpha: number) => {
      ctx.beginPath()
      ctx.moveTo(0, h)

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w
        const val = Math.min(h, (bins[i] / max) * h * 0.95)
        const y = h - val
        ctx.lineTo(x, y)
      }

      ctx.lineTo(w, h)
      ctx.closePath()

      ctx.fillStyle = color.replace(')', `, ${fillAlpha})`).replace('rgb', 'rgba')
      ctx.fill()
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Blend modes
    ctx.globalCompositeOperation = 'screen'
    drawChannel(data.rBins, 'rgb(244, 63, 94)', 0.25)
    drawChannel(data.gBins, 'rgb(34, 197, 94)', 0.25)
    drawChannel(data.bBins, 'rgb(59, 130, 246)', 0.25)
    drawChannel(data.lBins, 'rgb(255, 255, 255)', 0.15)
    ctx.globalCompositeOperation = 'source-over'
  }, [data])

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black/40 border border-white/10 p-1 ${className}`}>
      <canvas ref={canvasRef} width={140} height={44} className="w-full h-full block rounded" />
      <div className="absolute top-1 left-1.5 text-[9px] font-mono uppercase tracking-widest text-white/40 pointer-events-none">
        RGB Luma
      </div>
    </div>
  )
}
