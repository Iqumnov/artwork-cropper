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

    ctx.globalCompositeOperation = 'multiply'
    drawChannel(data.rBins, 'rgb(225, 29, 72)', 0.25)
    drawChannel(data.gBins, 'rgb(22, 101, 52)', 0.25)
    drawChannel(data.bBins, 'rgb(37, 99, 235)', 0.25)
    drawChannel(data.lBins, 'rgb(86, 80, 81)', 0.2)
    ctx.globalCompositeOperation = 'source-over'
  }, [data])

  return (
    <div className={`relative overflow-hidden bg-[#faf8f8]/95 border border-[#e3dbdc] p-1 shadow-sm ${className}`}>
      <canvas ref={canvasRef} width={130} height={38} className="w-full h-full block" />
      <div className="absolute top-1 left-1.5 text-[8px] font-mono uppercase tracking-widest text-[#565051] pointer-events-none">
        RGB Luma
      </div>
    </div>
  )
}
