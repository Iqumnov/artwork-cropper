import React, { useRef, useState, useMemo } from 'react'
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

  // Precompute 100% vector SVG cubic Bézier path — true GPU-rendered vector curve
  const curvePathData = useMemo(() => {
    const sorted = [...points].sort((a, b) => a.x - b.x)
    if (sorted.length === 0) {
      return 'M 0 255 L 255 0'
    }
    if (sorted.length === 1) {
      const sy = 255 - sorted[0].y
      return `M 0 ${sy} L 255 ${sy}`
    }

    const n = sorted.length
    const deltas: number[] = new Array(n - 1)
    for (let i = 0; i < n - 1; i++) {
      const dx = sorted[i + 1].x - sorted[i].x
      deltas[i] = dx === 0 ? 0 : (sorted[i + 1].y - sorted[i].y) / dx
    }

    const m: number[] = new Array(n)
    m[0] = deltas[0]
    m[n - 1] = deltas[n - 2]
    for (let i = 1; i < n - 1; i++) {
      m[i] = (deltas[i - 1] + deltas[i]) / 2
    }

    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(deltas[i]) < 1e-6) {
        m[i] = 0
        m[i + 1] = 0
      } else {
        const alpha = m[i] / deltas[i]
        const beta = m[i + 1] / deltas[i]
        if (alpha < 0) m[i] = 0
        if (beta < 0) m[i + 1] = 0
        const hyp = alpha * alpha + beta * beta
        if (hyp > 9) {
          const tau = 3 / Math.sqrt(hyp)
          m[i] = tau * alpha * deltas[i]
          m[i + 1] = tau * beta * deltas[i]
        }
      }
    }

    let d = ''
    const p0 = sorted[0]
    if (p0.x > 0) {
      d += `M 0 ${(255 - p0.y).toFixed(2)} L ${p0.x} ${(255 - p0.y).toFixed(2)} `
    } else {
      d += `M ${p0.x} ${(255 - p0.y).toFixed(2)} `
    }

    for (let i = 0; i < n - 1; i++) {
      const pA = sorted[i]
      const pB = sorted[i + 1]
      const dx = pB.x - pA.x

      const cp1x = pA.x + dx / 3
      const cp1y = pA.y + m[i] * (dx / 3)

      const cp2x = pB.x - dx / 3
      const cp2y = pB.y - m[i + 1] * (dx / 3)

      const svgCp1y = 255 - cp1y
      const svgCp2y = 255 - cp2y
      const svgPBy = 255 - pB.y

      d += `C ${cp1x.toFixed(2)} ${svgCp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${svgCp2y.toFixed(2)}, ${pB.x} ${svgPBy.toFixed(2)} `
    }

    const pLast = sorted[n - 1]
    if (pLast.x < 255) {
      d += `L 255 ${(255 - pLast.y).toFixed(2)}`
    }

    return d.trim()
  }, [points])

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
          shapeRendering="geometricPrecision"
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

          {/* Vector Spline Curve Path — True 100% Vector Cubic Bezier */}
          <path
            d={curvePathData}
            fill="none"
            stroke={channelStroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            shapeRendering="geometricPrecision"
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
