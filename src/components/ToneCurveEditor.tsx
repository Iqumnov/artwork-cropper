import React, { useRef, useEffect, useState, useCallback } from 'react'
import { ToneCurvePoint } from '../types'
import { RotateCcw } from 'lucide-react'

interface ToneCurveEditorProps {
  channel: 'rgb' | 'red' | 'green' | 'blue'
  points: ToneCurvePoint[]
  onChange: (points: ToneCurvePoint[]) => void
}

export const ToneCurveEditor: React.FC<ToneCurveEditorProps> = ({
  channel,
  points,
  onChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const channelStroke =
    channel === 'red'
      ? '#e11d48'
      : channel === 'green'
      ? '#16a34a'
      : channel === 'blue'
      ? '#2563eb'
      : '#0f0b0c'

  // Monotone cubic spline interpolation for smooth curve
  const getSplineLUT = useCallback((pts: ToneCurvePoint[]): number[] => {
    const sorted = [...pts].sort((a, b) => a.x - b.x)
    const lut: number[] = new Array(256)

    if (sorted.length === 0) {
      for (let i = 0; i < 256; i++) lut[i] = i
      return lut
    }

    if (sorted.length === 1) {
      for (let i = 0; i < 256; i++) lut[i] = sorted[0].y
      return lut
    }

    // Piecewise linear or cubic
    for (let i = 0; i < 256; i++) {
      if (i <= sorted[0].x) {
        lut[i] = sorted[0].y
      } else if (i >= sorted[sorted.length - 1].x) {
        lut[i] = sorted[sorted.length - 1].y
      } else {
        // Find segment
        for (let s = 0; s < sorted.length - 1; s++) {
          if (i >= sorted[s].x && i <= sorted[s + 1].x) {
            const t = (i - sorted[s].x) / (sorted[s + 1].x - sorted[s].x)
            // Smoothstep hermite interpolation
            const smoothT = t * t * (3 - 2 * t)
            lut[i] = Math.round(sorted[s].y + (sorted[s + 1].y - sorted[s].y) * smoothT)
            break
          }
        }
      }
    }
    return lut
  }, [])

  // Draw Grid and Curve
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    ctx.clearRect(0, 0, size, size)

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // 4x4 Grid lines
    ctx.strokeStyle = '#e3dbdc'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const pos = (size / 4) * i
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, size)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(size, pos)
      ctx.stroke()
    }

    // 45-degree diagonal guide line
    ctx.strokeStyle = '#e3dbdc'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(0, size)
    ctx.lineTo(size, 0)
    ctx.stroke()
    ctx.setLineDash([])

    // Curve rendering
    const lut = getSplineLUT(points)
    ctx.strokeStyle = channelStroke
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 0; x < 256; x++) {
      const screenX = (x / 255) * size
      const screenY = size - (lut[x] / 255) * size
      if (x === 0) ctx.moveTo(screenX, screenY)
      else ctx.lineTo(screenX, screenY)
    }
    ctx.stroke()

    // Control Points
    points.forEach((pt, index) => {
      const screenX = (pt.x / 255) * size
      const screenY = size - (pt.y / 255) * size
      const isSelected = activePointIndex === index

      ctx.fillStyle = isSelected ? '#34292a' : '#faf8f8'
      ctx.strokeStyle = '#0f0b0c'
      ctx.lineWidth = 1.5

      ctx.beginPath()
      ctx.rect(screenX - 4, screenY - 4, 8, 8)
      ctx.fill()
      ctx.stroke()
    })
  }, [points, channelStroke, activePointIndex, getSplineLUT])

  useEffect(() => {
    draw()
  }, [draw])

  // Pointer interactions
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const rawX = ((clientX - rect.left) / rect.width) * 255
    const rawY = 255 - ((clientY - rect.top) / rect.height) * 255

    return {
      x: Math.max(0, Math.min(255, Math.round(rawX))),
      y: Math.max(0, Math.min(255, Math.round(rawY)))
    }
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e)

    // Check if clicked near an existing point (within 20 units)
    let foundIndex: number | null = null
    points.forEach((p, idx) => {
      const dist = Math.hypot(p.x - coords.x, p.y - coords.y)
      if (dist < 20) {
        foundIndex = idx
      }
    })

    if (foundIndex !== null) {
      setActivePointIndex(foundIndex)
      setIsDragging(true)
    } else if (points.length < 5) {
      // Add new point at clicked location
      const newPts = [...points, { x: coords.x, y: coords.y }].sort((a, b) => a.x - b.x)
      const newIdx = newPts.findIndex(p => p.x === coords.x && p.y === coords.y)
      onChange(newPts)
      setActivePointIndex(newIdx)
      setIsDragging(true)
    }
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || activePointIndex === null) return
    const coords = getCanvasCoords(e)

    const updated = [...points]
    const target = updated[activePointIndex]

    // If point is strictly at edge (0 or 255), restrict X movement
    if (activePointIndex === 0 && target.x === 0) {
      updated[activePointIndex] = { x: 0, y: coords.y }
    } else if (activePointIndex === points.length - 1 && target.x === 255) {
      updated[activePointIndex] = { x: 255, y: coords.y }
    } else {
      updated[activePointIndex] = { x: coords.x, y: coords.y }
    }

    onChange(updated.sort((a, b) => a.x - b.x))
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleResetCurve = () => {
    onChange([
      { x: 0, y: 0 },
      { x: 255, y: 255 }
    ])
    setActivePointIndex(null)
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full select-none">
      <div className="relative border border-[#e3dbdc] shadow-sm">
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="cursor-crosshair block touch-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="flex items-center justify-between w-[220px] text-xs">
        <span className="text-xs text-[#565051]">
          {activePointIndex !== null && points[activePointIndex]
            ? `Вход: ${points[activePointIndex].x} / Выход: ${points[activePointIndex].y}`
            : 'Кликните для добавления точек'}
        </span>
        <button
          onClick={handleResetCurve}
          className="flex items-center gap-1 text-xs text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer border border-transparent hover:border-[#e3dbdc] px-2 py-0.5"
          title="Сбросить кривую"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Сброс</span>
        </button>
      </div>
    </div>
  )
}
