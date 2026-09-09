import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
  Check,
  Crosshair
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

  // Extreme pixel precision mode
  isExtremePrecision?: boolean
  onToggleExtremePrecision?: () => void
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
  onDrawerHeightChange,
  isExtremePrecision,
  onToggleExtremePrecision
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

  // Drawer Drag Resize Handlers using robust Pointer Capture
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    isResizingRef.current = true
    resizeStartYRef.current = e.clientY
    resizeStartHeightRef.current = drawerHeight
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handleResizePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const deltaY = resizeStartYRef.current - e.clientY
    const minH = 160
    const maxH = Math.min(window.innerHeight - 70, 520)
    const newH = Math.max(minH, Math.min(maxH, resizeStartHeightRef.current + deltaY))
    onDrawerHeightChange(newH)
  }

  const handleResizePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return
    isResizingRef.current = false
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      }
    } catch {
      // Ignore
    }
  }

  const adjustmentsRef = useRef(adjustments)
  adjustmentsRef.current = adjustments

  const updateAdj = useCallback(<K extends keyof LightroomAdjustments>(key: K, value: LightroomAdjustments[K]) => {
    onChange({ ...adjustmentsRef.current, [key]: value })
  }, [onChange])

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
      {/* Resizable Drag Handle Bar with 40px touch hitbox and pointer capture */}
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        className="w-full cursor-row-resize flex items-center justify-center relative hover:bg-[#e3dbdc]/40 transition-colors shrink-0 h-3.5 select-none touch-none"
        style={{ touchAction: 'none' }}
        title="Потяните для изменения высоты меню"
      >
        <div className="absolute -top-3.5 -bottom-3.5 inset-x-0 cursor-row-resize touch-none" style={{ touchAction: 'none' }} />
        <div className="w-10 h-1 bg-[#565051]/30 hover:bg-[#0f0b0c] transition-colors rounded-none pointer-events-none" />
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={onAutoDetectCrop}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-xs font-normal text-[#0f0b0c] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#565051]" />
                    <span>Авто</span>
                  </button>

                  <button
                    onClick={onResetCropPoints}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-xs font-normal text-[#0f0b0c] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#565051]" />
                    <span>Сброс</span>
                  </button>

                  <button
                    onClick={onToggleExtremePrecision}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 border text-xs font-normal transition-colors cursor-pointer ${
                      isExtremePrecision
                        ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                        : 'bg-white border-[#e3dbdc] hover:border-[#34292a] text-[#0f0b0c]'
                    }`}
                    title="Субпиксельная сверхточность 0.1x (или удерживайте Shift / стрелки клавиатуры)"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>0.1× Точность</span>
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
                    onClick={onToggleExtremePrecision}
                    className={`flex items-center gap-1 px-2 py-1 border text-xs font-normal transition-colors cursor-pointer shrink-0 ${
                      isExtremePrecision
                        ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                        : 'bg-white border-[#e3dbdc] hover:border-[#34292a] text-[#0f0b0c]'
                    }`}
                    title="Субпиксельная сверхточность 0.1x"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">0.1×</span>
                  </button>
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
              <div className="flex-1">
                <TouchSlider
                  min={-45}
                  max={45}
                  step={0.1}
                  value={adjustments.straighten}
                  onStart={onSliderDragStart}
                  onEnd={onSliderDragEnd}
                  onChange={(v) => updateAdj('straighten', v)}
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-mono w-12 text-right text-[#0f0b0c]">
                  {adjustments.straighten > 0 ? `+${adjustments.straighten.toFixed(1)}°` : `${adjustments.straighten.toFixed(1)}°`}
                </span>
                {adjustments.straighten !== 0 && (
                  <button
                    onClick={() => updateAdj('straighten', 0)}
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
// PresetGroups — memoized category grouping to avoid filtering 170+ presets on every render
const BUILTIN_CATEGORIES = ['Плёнка', 'Слайд', 'Монохром', 'Кино', 'Архив', 'Арт'] as const

const PresetGroups: React.FC<{
  selectedPresetCategory: string
  customPresets: Preset[]
  onApply: (preset: Preset) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}> = ({ selectedPresetCategory, customPresets, onApply, onDelete }) => {
  // Track the furthest visible preset index in the catalog (defaults to initial 4 visible cards)
  const [maxVisibleIndex, setMaxVisibleIndex] = useState(3)

  const handleCardIntersect = useCallback((cardIndex: number) => {
    setMaxVisibleIndex((prev) => Math.max(prev, cardIndex))
  }, [])

  const groupedPresets = useMemo(() => {
    return BUILTIN_CATEGORIES.map((cat) => ({
      category: cat,
      presets: LIGHTROOM_PRESETS.filter((p) => p.category === cat)
    })).filter((g) => g.presets.length > 0)
  }, [])

  const showCustom = selectedPresetCategory === 'Все' || selectedPresetCategory === 'Пользовательские'
  const showAll = selectedPresetCategory === 'Все'

  let globalIndex = 0

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
              {customPresets.map((preset) => {
                const idx = globalIndex++
                return (
                  <PresetNatureCard
                    key={preset.id}
                    preset={preset}
                    index={idx}
                    shouldLoad={idx <= maxVisibleIndex + 4}
                    onIntersect={() => handleCardIntersect(idx)}
                    onApply={onApply}
                    onDelete={onDelete}
                  />
                )
              })}
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
              {presets.map((preset) => {
                const idx = globalIndex++
                return (
                  <PresetNatureCard
                    key={preset.id}
                    preset={preset}
                    index={idx}
                    shouldLoad={idx <= maxVisibleIndex + 4}
                    onIntersect={() => handleCardIntersect(idx)}
                    onApply={onApply}
                  />
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}

// Preset Card — preloaded BEFORE entering screen, strictly up to 4 cards beyond visible screen
const PresetNatureCard: React.FC<{
  preset: Preset
  index: number
  shouldLoad: boolean
  onIntersect: () => void
  onApply: (preset: Preset) => void
  onDelete?: (id: string, e: React.MouseEvent) => void
}> = ({ preset, shouldLoad, onIntersect, onApply, onDelete }) => {
  const [thumbSrc, setThumbSrc] = useState<string>('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Detect when card physically enters viewport to advance maxVisibleIndex
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect()
        }
      },
      { rootMargin: '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  // Load thumbnail ONLY when within the strictly capped 4-card lookahead window
  useEffect(() => {
    if (!shouldLoad) return
    let isMounted = true
    getPresetNatureThumbnail(preset).then((url) => {
      if (isMounted && url) setThumbSrc(url)
    })
    return () => { isMounted = false }
  }, [shouldLoad, preset.id])

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
          <div className="w-full h-full flex items-center justify-center text-xs text-[#565051] bg-[#f5f2f2] animate-pulse">
            {shouldLoad ? 'Загрузка...' : ''}
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

// TouchSlider: Direction-aware gesture separator (vertical swipes scroll list, horizontal swipes adjust slider)
export const TouchSlider: React.FC<{
  min: number
  max: number
  step?: number
  value: number
  onChange: (val: number) => void
  onStart?: () => void
  onEnd?: () => void
}> = ({ min, max, step = 1, value, onChange, onStart, onEnd }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isHorizontalLockRef = useRef<boolean | null>(null)

  const calcValueFromX = (clientX: number) => {
    if (!trackRef.current) return value
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + pct * (max - min)
    const stepped = Math.round(raw / step) * step
    return Math.max(min, Math.min(max, parseFloat(stepped.toFixed(2))))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    isHorizontalLockRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (isHorizontalLockRef.current === null) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5) {
        // Vertical gesture: allow native scroll, lock out slider
        isHorizontalLockRef.current = false
        return
      }
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5) {
        // Horizontal gesture: lock slider drag
        isHorizontalLockRef.current = true
        onStart?.()
      }
    }

    if (isHorizontalLockRef.current) {
      const newVal = calcValueFromX(touch.clientX)
      onChange(newVal)
    }
  }

  const handleTouchEnd = () => {
    if (isHorizontalLockRef.current) {
      onEnd?.()
    } else if (isHorizontalLockRef.current === null && touchStartRef.current) {
      // Clean tap
      const newVal = calcValueFromX(touchStartRef.current.x)
      onChange(newVal)
    }
    touchStartRef.current = null
    isHorizontalLockRef.current = null
  }

  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))

  return (
    <div
      ref={trackRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative flex items-center w-full h-7 cursor-pointer select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* 1px clean hairline track */}
      <div className="w-full h-px bg-[#e3dbdc] relative pointer-events-none">
        {min < 0 ? (
          <div
            className="absolute top-0 h-px bg-[#34292a]"
            style={{
              left: `${Math.min(50, pct)}%`,
              width: `${Math.abs(pct - 50)}%`
            }}
          />
        ) : (
          <div
            className="absolute top-0 left-0 h-px bg-[#34292a]"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {/* Center zero mark */}
      {min < 0 && max > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-2 bg-[#565051]/40 pointer-events-none" />
      )}

      {/* Thumb: clean 12x12 crisp square */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
        style={{ left: `${pct}%`, width: '28px', height: '28px' }}
      >
        <div className="w-3 h-3 bg-[#0f0b0c]" />
      </div>

      {/* Desktop / Mouse fallback */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onStart}
        onPointerUp={onEnd}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer hidden md:block"
        style={{ touchAction: 'pan-y' }}
      />
    </div>
  )
}

// Reusable Lightroom Slider Row
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

export const SliderRow = React.memo<SliderRowProps>(({
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

      <TouchSlider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        onStart={onStart}
        onEnd={onEnd}
      />
    </div>
  )
})
