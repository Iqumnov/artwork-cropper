import React, { useRef, useState, useCallback, useMemo } from 'react'
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
  const svgRef = useRef<SVGSVGElement>(null)
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

    for (let i = 0; i < 256; i++) {
      if (i <= sorted[0].x) {
        lut[i] = sorted[0].y
      } else if (i >= sorted[sorted.length - 1].x) {
        lut[i] = sorted[sorted.length - 1].y
      } else {
        for (let s = 0; s < sorted.length - 1; s++) {
          if (i >= sorted[s].x && i <= sorted[s + 1].x) {
            const t = (i - sorted[s].x) / (sorted[s + 1].x - sorted[s].x)
            const smoothT = t * t * (3 - 2 * t)
            lut[i] = Math.round(sorted[s].y + (sorted[s + 1].y - sorted[s].y) * smoothT)
            break
          }
        }
      }
    }
    return lut
  }, [])

  // Precompute smooth vector SVG path
  const curvePathData = useMemo(() => {
    const lut = getSplineLUT(points)
    let d = ''
    for (let x = 0; x < 256; x++) {
      const y = 255 - lut[x]
      d += x === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    }
    return d
  }, [points, getSplineLUT])

  // Coordinate mapper from client coordinates to 0..255 SVG space
  const getSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const rawX = ((clientX - rect.left) / rect.width) * 255
    const rawY = 255 - ((clientY - rect.top) / rect.height) * 255

    return {
      x: Math.max(0, Math.min(255, Math.round(rawX))),
      y: Math.max(0, Math.min(255, Math.round(rawY)))
    }
  }

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const coords = getSvgCoords(e.clientX, e.clientY)

    // Check if clicked near an existing point (within 24 SVG units)
    let foundIndex: number | null = null
    points.forEach((p, idx) => {
      const dist = Math.hypot(p.x - coords.x, p.y - coords.y)
      if (dist < 24) {
        foundIndex = idx
      }
    })

    if (foundIndex !== null) {
      setActivePointIndex(foundIndex)
      setIsDragging(true)
      ;(e.target as Element).setPointerCapture(e.pointerId)
    } else if (points.length < 5) {
      // Add new point at clicked location
      const newPts = [...points, { x: coords.x, y: coords.y }].sort((a, b) => a.x - b.x)
      const newIdx = newPts.findIndex(p => p.x === coords.x && p.y === coords.y)
      onChange(newPts)
      setActivePointIndex(newIdx)
      setIsDragging(true)
      ;(e.target as Element).setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || activePointIndex === null) return
    e.preventDefault()
    e.stopPropagation()
    const coords = getSvgCoords(e.clientX, e.clientY)

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

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false)
    try {
      if ((e.target as Element).hasPointerCapture(e.pointerId)) {
        ;(e.target as Element).releasePointerCapture(e.pointerId)
      }
    } catch {
      // Ignore
    }
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
      {/* 100% Vector SVG Curve Canvas: Razor sharp on Retina, 4K, and Mobile */}
      <div className="relative border border-[#e3dbdc] bg-white shadow-sm overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 255 255"
          className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] block cursor-crosshair touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background fill */}
          <rect x="0" y="0" width="255" height="255" fill="#ffffff" />

          {/* 4x4 Grid lines with non-scaling-stroke for 1px hairline precision */}
          <line x1="63.75" y1="0" x2="63.75" y2="255" stroke="#e3dbdc" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="127.5" y1="0" x2="127.5" y2="255" stroke="#e3dbdc" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="191.25" y1="0" x2="191.25" y2="255" stroke="#e3dbdc" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          <line x1="0" y1="63.75" x2="255" y2="63.75" stroke="#e3dbdc" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="127.5" x2="255" y2="127.5" stroke="#e3dbdc" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="191.25" x2="255" y2="191.25" stroke="#e3dbdc" strokeWidth="1" vectorEffect="non-scaling-stroke" />

          {/* 45-degree diagonal reference line */}
          <line
            x1="0"
            y1="255"
            x2="255"
            y2="0"
            stroke="#e3dbdc"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Vector Spline Curve Path */}
          <path
            d={curvePathData}
            fill="none"
            stroke={channelStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Interactive Control Points */}
          {points.map((pt, index) => {
            const isSelected = activePointIndex === index
            const screenX = pt.x
            const screenY = 255 - pt.y

            return (
              <g key={`pt-${index}`} className="cursor-move">
                {/* Expanded invisible touch/grab hitbox (36x36 units) */}
                <rect
                  x={screenX - 18}
                  y={screenY - 18}
                  width="36"
                  height="36"
                  fill="transparent"
                />
                {/* Visual square control point */}
                <rect
                  x={screenX - 4.5}
                  y={screenY - 4.5}
                  width="9"
                  height="9"
                  fill={isSelected ? '#34292a' : '#faf8f8'}
                  stroke="#0f0b0c"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between w-[220px] sm:w-[240px] text-xs">
        <span className="text-xs text-[#565051] font-mono">
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
