import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Crop,
  Sun,
  Palette,
  Sparkles,
  Sliders,
  TrendingUp,
  Bookmark,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Plus,
  Trash2,
  Check
} from 'lucide-react'
import {
  LightroomAdjustments,
  ColorChannel,
  Preset,
  EditorTab,
  AspectRatio,
  ASPECT_RATIOS
} from '../types'
import { DEFAULT_HSL_CHANNELS, LIGHTROOM_PRESETS } from '../lib/presets'
import { getPresetNatureThumbnail } from '../lib/preset-thumbnails'
import { ToneCurveEditor } from './ToneCurveEditor'

interface LightroomStudioProps {
  adjustments: LightroomAdjustments
  onChange: (adjustments: LightroomAdjustments) => void
  onReset: () => void

  // Active Tab
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void

  // Cropping Controls
  cropMode: 'scan' | 'fixed'
  onCropModeChange: (mode: 'scan' | 'fixed') => void
  selectedAspectRatio: AspectRatio
  onAspectRatioChange: (ratio: AspectRatio) => void
  onAutoDetectCrop: () => void
  onResetCropPoints: () => void
  onRotateCW: () => void
  onFlipH: () => void
  onFlipV: () => void
  onApplyCrop: () => void

  // Drawer Height
  drawerHeight: number
  onDrawerHeightChange: (h: number) => void

  // Performance callbacks for zero-lag slider dragging
  onSliderDragStart?: () => void
  onSliderDragEnd?: () => void
}

export const SliderDragContext = React.createContext<{
  onStart?: () => void
  onEnd?: () => void
}>({})

export const LightroomStudio: React.FC<LightroomStudioProps> = React.memo(({
  adjustments,
  onChange,
  onReset,
  onSliderDragStart,
  onSliderDragEnd,
  activeTab,
  onTabChange,
  cropMode,
  onCropModeChange,
  selectedAspectRatio,
  onAspectRatioChange,
  onAutoDetectCrop,
  onResetCropPoints,
  onRotateCW,
  onFlipH,
  onFlipV,
  onApplyCrop,
  drawerHeight,
  onDrawerHeightChange
}) => {
  const [selectedHslChannel, setSelectedHslChannel] = useState<ColorChannel>('red')
  const [selectedCurveChannel, setSelectedCurveChannel] = useState<'rgb' | 'red' | 'green' | 'blue'>('rgb')
  const [customPresets, setCustomPresets] = useState<Preset[]>(() => {
    try {
      const stored = localStorage.getItem('artei_custom_presets')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('Все')

  const isResizingRef = useRef(false)
  const resizeStartYRef = useRef(0)
  const resizeStartHeightRef = useRef(0)

  // Drawer Drag Resize Handlers
  const handleResizeStart = (clientY: number) => {
    isResizingRef.current = true
    resizeStartYRef.current = clientY
    resizeStartHeightRef.current = drawerHeight

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizingRef.current) return
      const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const deltaY = resizeStartYRef.current - currentY
      const minH = 170
      const maxH = Math.min(window.innerHeight - 70, 520)
      const newH = Math.max(minH, Math.min(maxH, resizeStartHeightRef.current + deltaY))
      onDrawerHeightChange(newH)
    }

    const handlePointerUp = () => {
      isResizingRef.current = false
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove)
    window.addEventListener('touchend', handlePointerUp)
  }

  const updateAdj = <K extends keyof LightroomAdjustments>(key: K, value: LightroomAdjustments[K]) => {
    onChange({ ...adjustments, [key]: value })
  }

  const updateHsl = (channel: ColorChannel, field: 'hue' | 'sat' | 'lum', val: number) => {
    const current = adjustments.hsl[channel] || { hue: 0, sat: 0, lum: 0 }
    onChange({
      ...adjustments,
      hsl: {
        ...adjustments.hsl,
        [channel]: { ...current, [field]: val }
      }
    })
  }

  const updateSplitTone = (tone: 'shadows' | 'midtones' | 'highlights', field: 'hue' | 'sat', val: number) => {
    onChange({
      ...adjustments,
      colorGrading: {
        ...adjustments.colorGrading,
        [tone]: { ...adjustments.colorGrading[tone], [field]: val }
      }
    })
  }

  const updateColorBalance = (val: number) => {
    onChange({
      ...adjustments,
      colorGrading: {
        ...adjustments.colorGrading,
        balance: val
      }
    })
  }

  const handleApplyPreset = (preset: Preset) => {
    onChange({
      ...adjustments,
      ...preset.adjustments,
      straighten: adjustments.straighten,
      rotation: adjustments.rotation,
      flipH: adjustments.flipH,
      flipV: adjustments.flipV
    })
  }

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return
    const newPreset: Preset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      category: 'Пользовательские',
      isCustom: true,
      adjustments: { ...adjustments }
    }
    const updated = [newPreset, ...customPresets]
    setCustomPresets(updated)
    try {
      localStorage.setItem('artei_custom_presets', JSON.stringify(updated))
    } catch {}
    setNewPresetName('')
    setIsSavingPreset(false)
  }

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = customPresets.filter(p => p.id !== id)
    setCustomPresets(updated)
    try {
      localStorage.setItem('artei_custom_presets', JSON.stringify(updated))
    } catch {}
  }

  const HSL_NAMES_RU: Record<ColorChannel, string> = {
    red: 'Красный',
    orange: 'Оранжевый',
    yellow: 'Жёлтый',
    green: 'Зелёный',
    aqua: 'Аква',
    blue: 'Синий',
    purple: 'Пурпурный',
    magenta: 'Маджента'
  }

  const HSL_HEX: Record<ColorChannel, string> = {
    red: '#e11d48',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    aqua: '#06b6d4',
    blue: '#3b82f6',
    purple: '#a855f7',
    magenta: '#ec4899'
  }

  const dragContextValue = useMemo(() => ({
    onStart: onSliderDragStart,
    onEnd: onSliderDragEnd
  }), [onSliderDragStart, onSliderDragEnd])

  return (
    <SliderDragContext.Provider value={dragContextValue}>
    <aside
      className="bg-[#faf8f8] border-t border-[#e3dbdc] flex flex-col select-none relative shadow-[0_-2px_10px_rgba(15,11,12,0.03)]"
      style={{ height: `${drawerHeight}px`, minHeight: '170px', maxHeight: '520px' }}
      onTouchStart={(e) => {
        // Stop touch events from bubbling to the canvas viewport drag handler
        e.stopPropagation()
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
      }}
    >
      {/* Resizable Drag Handle Bar — compact container with expanded 30px touch hitbox */}
      <div
        onMouseDown={(e) => handleResizeStart(e.clientY)}
        onTouchStart={(e) => {
          e.stopPropagation()
          if (e.touches.length === 1) handleResizeStart(e.touches[0].clientY)
        }}
        className="w-full cursor-row-resize flex items-center justify-center relative hover:bg-[#e3dbdc]/40 transition-colors shrink-0 h-2.5 select-none"
        title="Потяните для изменения высоты меню"
      >
        {/* Generous invisible touch hitbox extending above and below */}
        <div className="absolute -top-3 -bottom-3 inset-x-0 cursor-row-resize" />
        <div className="w-8 h-0.5 bg-[#e3dbdc] rounded-none pointer-events-none" />
      </div>

      {/* Category Tabs (Cropping is Tab 1) */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5 border-b border-[#e3dbdc] no-scrollbar justify-start sm:justify-center shrink-0">
        {[
          { id: 'crop' as EditorTab, label: 'Кадрирование', icon: Crop },
          { id: 'light' as EditorTab, label: 'Свет', icon: Sun },
          { id: 'color' as EditorTab, label: 'Цвет и HSL', icon: Palette },
          { id: 'effects' as EditorTab, label: 'Эффекты', icon: Sparkles },
          { id: 'detail' as EditorTab, label: 'Детали', icon: Sliders },
          { id: 'curves' as EditorTab, label: 'Кривые', icon: TrendingUp },
          { id: 'presets' as EditorTab, label: 'Пресеты', icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-normal transition-colors cursor-pointer border whitespace-nowrap ${
                isActive
                  ? 'border-[#0f0b0c] bg-[#0f0b0c] text-[#faf8f8]'
                  : 'border-transparent text-[#565051] hover:text-[#0f0b0c] hover:border-[#e3dbdc]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}

        <div className="h-4 w-px bg-[#e3dbdc] mx-1 shrink-0" />

        {/* Global Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-normal border border-transparent hover:border-[#e3dbdc] text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer shrink-0"
          title="Сбросить все настройки цвета"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Сброс</span>
        </button>
      </div>

      {/* Full-width scrollable container — touching margins or empty space scrolls the drawer */}
      <div
        className="flex-1 w-full overflow-y-auto overscroll-contain no-scrollbar"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="max-w-2xl mx-auto p-3 sm:p-4 w-full">
          {/* --- CROP CONTROLS (TAB 1) --- */}
          {activeTab === 'crop' && (
          <div className="flex flex-col gap-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 border border-[#e3dbdc] p-0.5 bg-white">
                <button
                  onClick={() => onCropModeChange('scan')}
                  className={`px-3 py-1 text-xs font-normal transition-colors cursor-pointer border ${
                    cropMode === 'scan'
                      ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                      : 'border-transparent text-[#565051] hover:text-[#0f0b0c]'
                  }`}
                >
                  Перспектива
                </button>
                <button
                  onClick={() => onCropModeChange('fixed')}
                  className={`px-3 py-1 text-xs font-normal transition-colors cursor-pointer border ${
                    cropMode === 'fixed'
                      ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                      : 'border-transparent text-[#565051] hover:text-[#0f0b0c]'
                  }`}
                >
                  Пропорции
                </button>
              </div>

              {/* Apply Crop Button */}
              <button
                onClick={onApplyCrop}
                className="flex items-center gap-1.5 px-4 py-1 bg-[#0f0b0c] hover:bg-[#34292a] border border-[#0f0b0c] text-[#faf8f8] text-xs font-normal transition-colors cursor-pointer"
                title="Обрезать изображение"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Применить</span>
              </button>
            </div>

            {/* Perspective mode tools */}
            {cropMode === 'scan' && (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onAutoDetectCrop}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-xs font-normal text-[#0f0b0c] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#565051]" />
                    <span>Авто</span>
                  </button>

                  <button
                    onClick={onResetCropPoints}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-xs font-normal text-[#0f0b0c] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#565051]" />
                    <span>Сброс</span>
                  </button>
                </div>

                {/* Geometry Flip / Rotate */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={onRotateCW}
                    className="w-7 h-7 bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Повернуть 90°"
                  >
                    <RotateCw className="w-3 h-3 text-[#565051]" />
                  </button>
                  <button
                    onClick={onFlipH}
                    className="w-7 h-7 bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Отразить по горизонтали"
                  >
                    <FlipHorizontal className="w-3 h-3 text-[#565051]" />
                  </button>
                  <button
                    onClick={onFlipV}
                    className="w-7 h-7 bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Отразить по вертикали"
                  >
                    <FlipVertical className="w-3 h-3 text-[#565051]" />
                  </button>
                </div>
              </div>
            )}

            {/* Fixed aspect ratio selector */}
            {cropMode === 'fixed' && (
              <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.name}
                      onClick={() => onAspectRatioChange(ratio)}
                      className={`px-3 py-1 text-xs font-normal whitespace-nowrap transition-colors cursor-pointer border ${
                        selectedAspectRatio.name === ratio.name
                          ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                          : 'bg-white border-[#e3dbdc] hover:border-[#34292a] text-[#565051]'
                      }`}
                    >
                      {ratio.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={onResetCropPoints}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-xs font-normal text-[#0f0b0c] transition-colors cursor-pointer shrink-0"
                    title="Сбросить рамку, угол наклона и ориентацию"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#565051]" />
                    <span>Сброс</span>
                  </button>
                  <button
                    onClick={onRotateCW}
                    className="w-7 h-7 bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Повернуть 90°"
                  >
                    <RotateCw className="w-3 h-3 text-[#565051]" />
                  </button>
                  <button
                    onClick={onFlipH}
                    className="w-7 h-7 bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Отразить по горизонтали"
                  >
                    <FlipHorizontal className="w-3 h-3 text-[#565051]" />
                  </button>
                  <button
                    onClick={onFlipV}
                    className="w-7 h-7 bg-white border border-[#e3dbdc] hover:border-[#34292a] flex items-center justify-center text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Отразить по вертикали"
                  >
                    <FlipVertical className="w-3 h-3 text-[#565051]" />
                  </button>
                </div>
              </div>
            )}

            {/* Gradual Angle Manipulation (-45.0° .. +45.0°, step 0.1°) */}
            <div className="flex items-center gap-2.5 bg-white p-2 border border-[#e3dbdc]">
              <div className="flex items-center gap-1.5 shrink-0 text-xs text-[#0f0b0c]">
                <RotateCw className="w-3.5 h-3.5 text-[#565051]" />
                <span className="text-xs font-normal">Угол наклона</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="0.1"
                value={adjustments.straighten}
                onPointerDown={onSliderDragStart}
                onPointerUp={onSliderDragEnd}
                onTouchStart={onSliderDragStart}
                onTouchEnd={onSliderDragEnd}
                onChange={(e) => updateAdj('straighten', parseFloat(e.target.value))}
                className="flex-1 lr-slider"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-mono w-12 text-right text-[#0f0b0c]">
                  {adjustments.straighten > 0 ? `+${adjustments.straighten.toFixed(1)}°` : `${adjustments.straighten.toFixed(1)}°`}
                </span>
                {adjustments.straighten !== 0 && (
                  <button
                    onClick={() => onChange({ ...adjustments, straighten: 0 })}
                    className="text-xs px-2 py-0.5 border border-[#e3dbdc] hover:border-[#34292a] text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer"
                    title="Сбросить угол в 0°"
                  >
                    0°
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- LIGHT CONTROLS --- */}
        {activeTab === 'light' && (
          <div className="flex flex-col gap-2">
            <SliderRow
              label="Экспозиция"
              value={adjustments.exposure}
              min={-4}
              max={4}
              step={0.05}
              unit=" EV"
              format={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
              onChange={(v) => updateAdj('exposure', v)}
              onReset={() => updateAdj('exposure', 0)}
            />
            <SliderRow
              label="Контраст"
              value={adjustments.contrast}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('contrast', v)}
              onReset={() => updateAdj('contrast', 0)}
            />
            <SliderRow
              label="Света"
              value={adjustments.highlights}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('highlights', v)}
              onReset={() => updateAdj('highlights', 0)}
            />
            <SliderRow
              label="Тени"
              value={adjustments.shadows}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('shadows', v)}
              onReset={() => updateAdj('shadows', 0)}
            />
            <SliderRow
              label="Белые"
              value={adjustments.whites}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('whites', v)}
              onReset={() => updateAdj('whites', 0)}
            />
            <SliderRow
              label="Чёрные"
              value={adjustments.blacks}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('blacks', v)}
              onReset={() => updateAdj('blacks', 0)}
            />
          </div>
        )}

        {/* --- COLOR & HSL CONTROLS --- */}
        {activeTab === 'color' && (
          <div className="flex flex-col gap-3">
            {/* Global Temp / Tint / Vibrance / Saturation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SliderRow
                label="Температура"
                value={adjustments.temp}
                min={-100}
                max={100}
                accent="orange"
                onChange={(v) => updateAdj('temp', v)}
                onReset={() => updateAdj('temp', 0)}
              />
              <SliderRow
                label="Оттенок"
                value={adjustments.tint}
                min={-100}
                max={100}
                accent="magenta"
                onChange={(v) => updateAdj('tint', v)}
                onReset={() => updateAdj('tint', 0)}
              />
              <SliderRow
                label="Красочность"
                value={adjustments.vibrance}
                min={-100}
                max={100}
                onChange={(v) => updateAdj('vibrance', v)}
                onReset={() => updateAdj('vibrance', 0)}
              />
              <SliderRow
                label="Насыщенность"
                value={adjustments.saturation}
                min={-100}
                max={100}
                onChange={(v) => updateAdj('saturation', v)}
                onReset={() => updateAdj('saturation', 0)}
              />
            </div>

            {/* 8-Channel HSL Color Mixer */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs text-[#565051] uppercase tracking-wider font-normal">
                  8-канальный микшер HSL
                </span>
                <span className="capitalize text-[#0f0b0c] text-xs font-normal">
                  {HSL_NAMES_RU[selectedHslChannel]}
                </span>
              </div>

              {/* Color channel selector buttons */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {DEFAULT_HSL_CHANNELS.map((ch) => {
                  const isSelected = selectedHslChannel === ch
                  return (
                    <button
                      key={ch}
                      onClick={() => setSelectedHslChannel(ch)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors cursor-pointer border ${
                        isSelected
                          ? 'border-[#0f0b0c] bg-white text-[#0f0b0c]'
                          : 'border-[#e3dbdc] bg-[#faf8f8] hover:border-[#34292a] text-[#565051]'
                      }`}
                    >
                      <span
                        className="w-2 h-2"
                        style={{ backgroundColor: HSL_HEX[ch] }}
                      />
                      <span className="text-xs">{HSL_NAMES_RU[ch]}</span>
                    </button>
                  )
                })}
              </div>

              {/* HSL Sliders */}
              <div className="flex flex-col gap-1.5 pt-1">
                <SliderRow
                  label="Цветовой тон"
                  value={adjustments.hsl[selectedHslChannel]?.hue || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'hue', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'hue', 0)}
                />
                <SliderRow
                  label="Насыщенность"
                  value={adjustments.hsl[selectedHslChannel]?.sat || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'sat', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'sat', 0)}
                />
                <SliderRow
                  label="Яркость"
                  value={adjustments.hsl[selectedHslChannel]?.lum || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'lum', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'lum', 0)}
                />
              </div>
            </div>

            {/* Split Toning (Seamless, no extra container border) */}
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-xs text-[#565051] uppercase tracking-wider font-normal">
                Раздельное тонирование
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <SliderRow
                  label="Тон теней"
                  value={adjustments.colorGrading.shadows.hue}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(v) => updateSplitTone('shadows', 'hue', v)}
                  onReset={() => updateSplitTone('shadows', 'hue', 0)}
                />
                <SliderRow
                  label="Степень теней"
                  value={adjustments.colorGrading.shadows.sat}
                  min={0}
                  max={100}
                  onChange={(v) => updateSplitTone('shadows', 'sat', v)}
                  onReset={() => updateSplitTone('shadows', 'sat', 0)}
                />
                <SliderRow
                  label="Тон средних тонов"
                  value={adjustments.colorGrading.midtones?.hue || 0}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(v) => updateSplitTone('midtones', 'hue', v)}
                  onReset={() => updateSplitTone('midtones', 'hue', 0)}
                />
                <SliderRow
                  label="Степень средних тонов"
                  value={adjustments.colorGrading.midtones?.sat || 0}
                  min={0}
                  max={100}
                  onChange={(v) => updateSplitTone('midtones', 'sat', v)}
                  onReset={() => updateSplitTone('midtones', 'sat', 0)}
                />
                <SliderRow
                  label="Тон светов"
                  value={adjustments.colorGrading.highlights.hue}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(v) => updateSplitTone('highlights', 'hue', v)}
                  onReset={() => updateSplitTone('highlights', 'hue', 0)}
                />
                <SliderRow
                  label="Степень светов"
                  value={adjustments.colorGrading.highlights.sat}
                  min={0}
                  max={100}
                  onChange={(v) => updateSplitTone('highlights', 'sat', v)}
                  onReset={() => updateSplitTone('highlights', 'sat', 0)}
                />
                <div className="sm:col-span-2">
                  <SliderRow
                    label="Баланс (Тени ↔ Света)"
                    value={adjustments.colorGrading.balance || 0}
                    min={-100}
                    max={100}
                    onChange={updateColorBalance}
                    onReset={() => updateColorBalance(0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EFFECTS CONTROLS --- */}
        {activeTab === 'effects' && (
          <div className="flex flex-col gap-2">
            <SliderRow
              label="Чёткость"
              value={adjustments.clarity}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('clarity', v)}
              onReset={() => updateAdj('clarity', 0)}
            />
            <SliderRow
              label="Удаление дымки"
              value={adjustments.dehaze}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('dehaze', v)}
              onReset={() => updateAdj('dehaze', 0)}
            />
            <SliderRow
              label="Текстура"
              value={adjustments.texture}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('texture', v)}
              onReset={() => updateAdj('texture', 0)}
            />
            <SliderRow
              label="Виньетирование"
              value={adjustments.vignette}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('vignette', v)}
              onReset={() => updateAdj('vignette', 0)}
            />
            <SliderRow
              label="Зернистость"
              value={adjustments.grain}
              min={0}
              max={100}
              onChange={(v) => updateAdj('grain', v)}
              onReset={() => updateAdj('grain', 0)}
            />
            <SliderRow
              label="Матовость"
              value={adjustments.fade || 0}
              min={0}
              max={100}
              onChange={(v) => updateAdj('fade', v)}
              onReset={() => updateAdj('fade', 0)}
            />
          </div>
        )}

        {/* --- DETAIL CONTROLS --- */}
        {activeTab === 'detail' && (
          <div className="flex flex-col gap-2">
            <SliderRow
              label="Резкость"
              value={adjustments.sharpen}
              min={0}
              max={100}
              onChange={(v) => updateAdj('sharpen', v)}
              onReset={() => updateAdj('sharpen', 0)}
            />
            <SliderRow
              label="Шумоподавление"
              value={adjustments.noiseReduction}
              min={0}
              max={100}
              onChange={(v) => updateAdj('noiseReduction', v)}
              onReset={() => updateAdj('noiseReduction', 0)}
            />
          </div>
        )}

        {/* --- CURVES CONTROLS (Interactive 2D Spline Curve) --- */}
        {activeTab === 'curves' && (
          <div className="flex flex-col gap-2.5 items-center">
            {/* Channel Switcher */}
            <div className="flex items-center gap-1 border border-[#e3dbdc] p-0.5 bg-white">
              {[
                { id: 'rgb', label: 'RGB', color: '#0f0b0c' },
                { id: 'red', label: 'R', color: '#dc2626' },
                { id: 'green', label: 'G', color: '#16a34a' },
                { id: 'blue', label: 'B', color: '#2563eb' }
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedCurveChannel(ch.id as any)}
                  className={`px-3 py-1 text-xs font-normal transition-colors cursor-pointer border ${
                    selectedCurveChannel === ch.id
                      ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                      : 'border-transparent text-[#565051] hover:text-[#0f0b0c]'
                  }`}
                >
                  <span style={{ color: selectedCurveChannel === ch.id ? '#faf8f8' : ch.color }}>{ch.label}</span>
                </button>
              ))}
            </div>

            <ToneCurveEditor
              channel={selectedCurveChannel}
              points={adjustments.curves[selectedCurveChannel]}
              onChange={(newPoints) => {
                onChange({
                  ...adjustments,
                  curves: {
                    ...adjustments.curves,
                    [selectedCurveChannel]: newPoints
                  }
                })
              }}
            />
          </div>
        )}

        {/* --- PRESETS CATALOG --- */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-3">
            {/* Save Custom Preset Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#565051] font-normal">
                Коллекция пресетов
              </span>
              {!isSavingPreset ? (
                <button
                  onClick={() => setIsSavingPreset(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-xs text-[#0f0b0c] transition-colors cursor-pointer"
                  title="Сохранить текущие настройки ползунков как новый пресет"
                >
                  <Plus className="w-3.5 h-3.5 text-[#565051]" />
                  <span>Добавить</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Название стиля..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="px-2 py-1 bg-white border border-[#e3dbdc] text-xs text-[#0f0b0c] focus:border-[#34292a] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCustomPreset}
                    className="px-2.5 py-1 bg-[#0f0b0c] text-[#faf8f8] text-xs font-normal border border-[#0f0b0c] cursor-pointer"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setIsSavingPreset(false)}
                    className="px-1.5 py-1 text-[#565051] hover:text-[#0f0b0c] text-xs cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>

            {/* Category Filter Tabs — no extra border */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 pb-1.5">
              {[
                { id: 'Все', label: 'Все' },
                { id: 'Пользовательские', label: `Пользовательские ${customPresets.length > 0 ? `(${customPresets.length})` : ''}` },
                { id: 'Плёнка', label: 'Плёнка' },
                { id: 'Слайд', label: 'Слайд' },
                { id: 'Монохром', label: 'Монохром' },
                { id: 'Кино', label: 'Кино' },
                { id: 'Архив', label: 'Архив' },
                { id: 'Арт', label: 'Арт' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedPresetCategory(cat.id)}
                  className={`px-2.5 py-1 text-[11px] sm:text-xs font-normal whitespace-nowrap transition-colors shrink-0 cursor-pointer border ${
                    selectedPresetCategory === cat.id
                      ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                      : 'border-transparent text-[#565051] hover:text-[#0f0b0c] hover:border-[#e3dbdc]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Presets by Groups: Custom Group ALWAYS 1st */}
            <PresetGroups
              selectedPresetCategory={selectedPresetCategory}
              customPresets={customPresets}
              onApply={handleApplyPreset}
              onDelete={handleDeleteCustomPreset}
            />
          </div>
        )}
        </div>
      </div>
    </aside>
    </SliderDragContext.Provider>
  )
})


// PresetGroups — memoized category grouping to avoid filtering 170+ presets on every render
const BUILTIN_CATEGORIES = ['Плёнка', 'Слайд', 'Монохром', 'Кино', 'Архив', 'Арт'] as const

const PresetGroups: React.FC<{
  selectedPresetCategory: string
  customPresets: Preset[]
  onApply: (preset: Preset) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}> = ({ selectedPresetCategory, customPresets, onApply, onDelete }) => {
  const groupedPresets = useMemo(() => {
    return BUILTIN_CATEGORIES.map((cat) => ({
      category: cat,
      presets: LIGHTROOM_PRESETS.filter((p) => p.category === cat)
    })).filter((g) => g.presets.length > 0)
  }, [])

  const showCustom = selectedPresetCategory === 'Все' || selectedPresetCategory === 'Пользовательские'
  const showAll = selectedPresetCategory === 'Все'

  return (
    <div className="flex flex-col gap-4 pt-1">
      {/* Custom Presets Group */}
      {showCustom && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#565051] font-normal pb-0.5">
            <span>Пользовательские пресеты</span>
            <span>{customPresets.length}</span>
          </div>
          {customPresets.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {customPresets.map((preset) => (
                <PresetNatureCard key={preset.id} preset={preset} onApply={onApply} onDelete={onDelete} />
              ))}
            </div>
          ) : (
            selectedPresetCategory === 'Пользовательские' && (
              <div className="text-xs text-[#565051] py-4 text-center border border-dashed border-[#e3dbdc]">
                Нет сохраненных стилей. Нажмите кнопку «Добавить», чтобы сохранить текущие настройки.
              </div>
            )
          )}
        </div>
      )}

      {/* Built-in Groups */}
      {groupedPresets
        .filter((g) => showAll || selectedPresetCategory === g.category)
        .map(({ category, presets }) => (
          <div key={category} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#565051] font-normal pb-0.5">
              <span>{category}</span>
              <span>{presets.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {presets.map((preset) => (
                <PresetNatureCard key={preset.id} preset={preset} onApply={onApply} />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

// Preset Card — lazy thumbnail via IntersectionObserver (only generates when scrolled into view)
const PresetNatureCard: React.FC<{
  preset: Preset
  onApply: (preset: Preset) => void
  onDelete?: (id: string, e: React.MouseEvent) => void
}> = ({ preset, onApply, onDelete }) => {
  const [thumbSrc, setThumbSrc] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver: only trigger thumbnail generation when card enters the viewport
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '120px' } // pre-load 120px before entering view
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Only generate thumbnail once the card is visible
  useEffect(() => {
    if (!isVisible) return
    let isMounted = true
    getPresetNatureThumbnail(preset).then((url) => {
      if (isMounted && url) setThumbSrc(url)
    })
    return () => { isMounted = false }
  }, [isVisible, preset.id]) // preset.id only — presets are immutable

  return (
    <div
      ref={cardRef}
      onClick={() => onApply(preset)}
      className="group relative flex flex-col bg-white border border-[#e3dbdc] hover:border-[#34292a] overflow-hidden text-left transition-colors cursor-pointer"
    >
      <div className="w-full aspect-[4/3] bg-[#f0eded] relative overflow-hidden">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={preset.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#565051] bg-[#f5f2f2] animate-pulse">
            {isVisible ? 'Загрузка...' : ''}
          </div>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => onDelete(preset.id, e)}
            className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-white border border-[#e3dbdc] flex items-center justify-center text-[#565051] hover:text-red-600 transition-colors cursor-pointer z-10"
            title="Удалить пресет"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="p-2 flex flex-col min-w-0">
        <span className="text-xs font-normal text-[#0f0b0c] truncate group-hover:text-[#34292a]">
          {preset.name}
        </span>
        <span className="text-xs text-[#565051] truncate mt-0.5">
          {preset.category}
        </span>
      </div>
    </div>
  )
}



// Reusable Lightroom Slider Row (Strictly 1px)
interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  accent?: string
  format?: (v: number) => string
  onChange: (val: number) => void
  onReset: () => void
}

const SliderRow: React.FC<SliderRowProps> = React.memo(({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  accent,
  format,
  onChange,
  onReset,
}) => {
  const { onStart, onEnd } = React.useContext(SliderDragContext)
  const displayVal = format ? format(value) : `${value > 0 && min < 0 ? `+${value}` : value}${unit}`

  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#0f0b0c] font-normal tracking-tight text-xs flex items-center gap-1.5">
          {accent && (
            <span
              className="w-1.5 h-1.5"
              style={{ backgroundColor: accent === 'orange' ? '#ea580c' : accent === 'magenta' ? '#db2777' : accent }}
            />
          )}
          {label}
        </span>
        <button
          onClick={() => {
            onReset()
            onEnd?.()
          }}
          className="font-mono text-xs text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer px-1 hover:bg-[#e3dbdc]/40"
          title="Клик для сброса на 0"
          style={{ minHeight: '28px', minWidth: '28px' }}
        >
          {displayVal}
        </button>
      </div>

      {/* touch-action: none prevents iOS scroll hijacking while dragging slider */}
      <div className="relative flex items-center" style={{ touchAction: 'none' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onPointerDown={onStart}
          onPointerUp={onEnd}
          onTouchStart={onStart}
          onTouchEnd={onEnd}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full lr-slider"
          style={{ touchAction: 'none' }}
        />
        {min < 0 && max > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 w-px h-2 bg-[#565051]/40 pointer-events-none" />
        )}
      </div>
    </div>
  )
})
