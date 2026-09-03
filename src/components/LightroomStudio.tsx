import React, { useState } from 'react'
import {
  Sun,
  Palette,
  Sparkles,
  Sliders,
  TrendingUp,
  RotateCcw,
  Plus,
  Bookmark
} from 'lucide-react'
import { LightroomAdjustments, ColorChannel, Preset } from '../types'
import { DEFAULT_HSL_CHANNELS, LIGHTROOM_PRESETS } from '../lib/presets'

interface LightroomStudioProps {
  adjustments: LightroomAdjustments
  onChange: (adjustments: LightroomAdjustments) => void
  onReset: () => void
}

type TabType = 'light' | 'color' | 'effects' | 'detail' | 'curves' | 'presets'

const HSL_COLORS: Record<ColorChannel, { name: string; bg: string }> = {
  red: { name: 'Red', bg: '#ef4444' },
  orange: { name: 'Orange', bg: '#f97316' },
  yellow: { name: 'Yellow', bg: '#eab308' },
  green: { name: 'Green', bg: '#22c55e' },
  aqua: { name: 'Aqua', bg: '#06b6d4' },
  blue: { name: 'Blue', bg: '#3b82f6' },
  purple: { name: 'Purple', bg: '#a855f7' },
  magenta: { name: 'Magenta', bg: '#ec4899' },
}

export const LightroomStudio: React.FC<LightroomStudioProps> = ({
  adjustments,
  onChange,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('light')
  const [selectedHslChannel, setSelectedHslChannel] = useState<ColorChannel>('red')
  const [selectedCurveChannel, setSelectedCurveChannel] = useState<'rgb' | 'red' | 'green' | 'blue'>('rgb')
  const [customPresets, setCustomPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem('artei_custom_presets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')

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

  const updateSplitTone = (tone: 'shadows' | 'highlights', field: 'hue' | 'sat', val: number) => {
    onChange({
      ...adjustments,
      colorGrading: {
        ...adjustments.colorGrading,
        [tone]: { ...adjustments.colorGrading[tone], [field]: val }
      }
    })
  }

  const handleApplyPreset = (preset: Preset) => {
    onChange({
      ...adjustments,
      ...preset.adjustments,
      // preserve geometry/crop
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
      category: 'Custom',
      badge: 'User',
      adjustments: { ...adjustments }
    }
    const updated = [...customPresets, newPreset]
    setCustomPresets(updated)
    try {
      localStorage.setItem('artei_custom_presets', JSON.stringify(updated))
    } catch {}
    setNewPresetName('')
    setIsSavingPreset(false)
  }

  // Curve control point update
  const handleCurveChange = (pointIdx: number, yVal: number) => {
    const channel = selectedCurveChannel
    const currentPoints = [...adjustments.curves[channel]]
    if (pointIdx >= 0 && pointIdx < currentPoints.length) {
      currentPoints[pointIdx] = { ...currentPoints[pointIdx], y: Math.max(0, Math.min(255, yVal)) }
      onChange({
        ...adjustments,
        curves: {
          ...adjustments.curves,
          [channel]: currentPoints
        }
      })
    }
  }

  return (
    <div className="w-full flex flex-col bg-[#121316] border-t border-white/10 select-none">
      {/* Category Tabs (Lightroom Mobile Dock) */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-white/5 no-scrollbar justify-start sm:justify-center">
        {[
          { id: 'light', label: 'Light', icon: Sun },
          { id: 'color', label: 'Color & HSL', icon: Palette },
          { id: 'effects', label: 'Effects', icon: Sparkles },
          { id: 'detail', label: 'Detail', icon: Sliders },
          { id: 'curves', label: 'Curves', icon: TrendingUp },
          { id: 'presets', label: 'Presets', icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 squircle-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}

        <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 squircle-full text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
          title="Reset All Adjustments"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Slider Controls Drawer */}
      <div className="p-3 sm:p-4 max-w-xl mx-auto w-full max-h-52 sm:max-h-60 overflow-y-auto no-scrollbar flex flex-col gap-3">
        {/* --- LIGHT CONTROLS --- */}
        {activeTab === 'light' && (
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Exposure"
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
              label="Contrast"
              value={adjustments.contrast}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('contrast', v)}
              onReset={() => updateAdj('contrast', 0)}
            />
            <SliderRow
              label="Highlights"
              value={adjustments.highlights}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('highlights', v)}
              onReset={() => updateAdj('highlights', 0)}
            />
            <SliderRow
              label="Shadows"
              value={adjustments.shadows}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('shadows', v)}
              onReset={() => updateAdj('shadows', 0)}
            />
            <SliderRow
              label="Whites"
              value={adjustments.whites}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('whites', v)}
              onReset={() => updateAdj('whites', 0)}
            />
            <SliderRow
              label="Blacks"
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
          <div className="flex flex-col gap-3.5">
            {/* Global Color Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SliderRow
                label="Temp (Warmth)"
                value={adjustments.temp}
                min={-100}
                max={100}
                accent="orange"
                onChange={(v) => updateAdj('temp', v)}
                onReset={() => updateAdj('temp', 0)}
              />
              <SliderRow
                label="Tint"
                value={adjustments.tint}
                min={-100}
                max={100}
                accent="magenta"
                onChange={(v) => updateAdj('tint', v)}
                onReset={() => updateAdj('tint', 0)}
              />
              <SliderRow
                label="Vibrance"
                value={adjustments.vibrance}
                min={-100}
                max={100}
                onChange={(v) => updateAdj('vibrance', v)}
                onReset={() => updateAdj('vibrance', 0)}
              />
              <SliderRow
                label="Saturation"
                value={adjustments.saturation}
                min={-100}
                max={100}
                onChange={(v) => updateAdj('saturation', v)}
                onReset={() => updateAdj('saturation', 0)}
              />
            </div>

            {/* HSL Color Mixer Section */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  HSL Color Mixer
                </span>
                <span className="text-[10px] text-white/40">Select color channel to adjust</span>
              </div>

              {/* 8 Color Pills */}
              <div className="flex items-center justify-between gap-1 mb-3">
                {DEFAULT_HSL_CHANNELS.map((ch) => {
                  const info = HSL_COLORS[ch]
                  const isSelected = selectedHslChannel === ch
                  const hasAdj =
                    adjustments.hsl[ch]?.hue !== 0 ||
                    adjustments.hsl[ch]?.sat !== 0 ||
                    adjustments.hsl[ch]?.lum !== 0

                  return (
                    <button
                      key={ch}
                      onClick={() => setSelectedHslChannel(ch)}
                      className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-white/15 ring-2 ring-white/50 scale-105'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full relative"
                        style={{ backgroundColor: info.bg }}
                      >
                        {hasAdj && (
                          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white ring-1 ring-black" />
                        )}
                      </div>
                      <span className="text-[9px] text-white/70 font-mono capitalize">
                        {ch.slice(0, 3)}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Sliders for Selected HSL Channel */}
              <div className="flex flex-col gap-2 bg-white/[0.03] p-2.5 rounded-2xl border border-white/5">
                <SliderRow
                  label={`${HSL_COLORS[selectedHslChannel].name} Hue`}
                  value={adjustments.hsl[selectedHslChannel]?.hue || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'hue', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'hue', 0)}
                />
                <SliderRow
                  label={`${HSL_COLORS[selectedHslChannel].name} Saturation`}
                  value={adjustments.hsl[selectedHslChannel]?.sat || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'sat', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'sat', 0)}
                />
                <SliderRow
                  label={`${HSL_COLORS[selectedHslChannel].name} Luminance`}
                  value={adjustments.hsl[selectedHslChannel]?.lum || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'lum', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'lum', 0)}
                />
              </div>
            </div>

            {/* Split Toning / Color Grading */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-2 block">
                Color Grading (Split Toning)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/[0.03] p-2 rounded-2xl border border-white/5 flex flex-col gap-2">
                  <span className="text-[10px] font-medium text-white/70">Shadows Tint</span>
                  <SliderRow
                    label="Hue"
                    value={adjustments.colorGrading.shadows.hue}
                    min={0}
                    max={360}
                    unit="°"
                    onChange={(v) => updateSplitTone('shadows', 'hue', v)}
                    onReset={() => updateSplitTone('shadows', 'hue', 0)}
                  />
                  <SliderRow
                    label="Amount"
                    value={adjustments.colorGrading.shadows.sat}
                    min={0}
                    max={100}
                    onChange={(v) => updateSplitTone('shadows', 'sat', v)}
                    onReset={() => updateSplitTone('shadows', 'sat', 0)}
                  />
                </div>

                <div className="bg-white/[0.03] p-2 rounded-2xl border border-white/5 flex flex-col gap-2">
                  <span className="text-[10px] font-medium text-white/70">Highlights Tint</span>
                  <SliderRow
                    label="Hue"
                    value={adjustments.colorGrading.highlights.hue}
                    min={0}
                    max={360}
                    unit="°"
                    onChange={(v) => updateSplitTone('highlights', 'hue', v)}
                    onReset={() => updateSplitTone('highlights', 'hue', 0)}
                  />
                  <SliderRow
                    label="Amount"
                    value={adjustments.colorGrading.highlights.sat}
                    min={0}
                    max={100}
                    onChange={(v) => updateSplitTone('highlights', 'sat', v)}
                    onReset={() => updateSplitTone('highlights', 'sat', 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EFFECTS CONTROLS --- */}
        {activeTab === 'effects' && (
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Clarity (Midtone Contrast)"
              value={adjustments.clarity}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('clarity', v)}
              onReset={() => updateAdj('clarity', 0)}
            />
            <SliderRow
              label="Dehaze"
              value={adjustments.dehaze}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('dehaze', v)}
              onReset={() => updateAdj('dehaze', 0)}
            />
            <SliderRow
              label="Texture"
              value={adjustments.texture}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('texture', v)}
              onReset={() => updateAdj('texture', 0)}
            />
            <SliderRow
              label="Vignette"
              value={adjustments.vignette}
              min={-100}
              max={100}
              onChange={(v) => updateAdj('vignette', v)}
              onReset={() => updateAdj('vignette', 0)}
            />
            <SliderRow
              label="Film Grain"
              value={adjustments.grain}
              min={0}
              max={100}
              onChange={(v) => updateAdj('grain', v)}
              onReset={() => updateAdj('grain', 0)}
            />
          </div>
        )}

        {/* --- DETAIL CONTROLS --- */}
        {activeTab === 'detail' && (
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Sharpening"
              value={adjustments.sharpen}
              min={0}
              max={100}
              onChange={(v) => updateAdj('sharpen', v)}
              onReset={() => updateAdj('sharpen', 0)}
            />
            <SliderRow
              label="Noise Reduction"
              value={adjustments.noiseReduction}
              min={0}
              max={100}
              onChange={(v) => updateAdj('noiseReduction', v)}
              onReset={() => updateAdj('noiseReduction', 0)}
            />
          </div>
        )}

        {/* --- TONE CURVES --- */}
        {activeTab === 'curves' && (
          <div className="flex flex-col gap-3 items-center">
            {/* Channel Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5">
              {[
                { id: 'rgb', label: 'RGB', color: 'text-white' },
                { id: 'red', label: 'Red', color: 'text-red-400' },
                { id: 'green', label: 'Green', color: 'text-green-400' },
                { id: 'blue', label: 'Blue', color: 'text-blue-400' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCurveChannel(c.id as any)}
                  className={`px-3 py-1 squircle-full text-xs font-medium transition-all ${
                    selectedCurveChannel === c.id
                      ? 'bg-white text-black font-semibold'
                      : `${c.color} hover:bg-white/10`
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Visual Curve Representation & Sliders */}
            <div className="w-full max-w-sm bg-black/40 rounded-2xl p-3 border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-white/60">
                <span>Shadows Point</span>
                <span>Highlights Point</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SliderRow
                  label="Blacks / Shadow"
                  value={adjustments.curves[selectedCurveChannel][0]?.y || 0}
                  min={0}
                  max={128}
                  onChange={(v) => handleCurveChange(0, v)}
                  onReset={() => handleCurveChange(0, 0)}
                />
                <SliderRow
                  label="Whites / Highlight"
                  value={adjustments.curves[selectedCurveChannel][1]?.y || 255}
                  min={128}
                  max={255}
                  onChange={(v) => handleCurveChange(1, v)}
                  onReset={() => handleCurveChange(1, 255)}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- PRESETS CATALOG --- */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-3">
            {/* Save Custom Preset Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Lightroom Catalog
              </span>
              {!isSavingPreset ? (
                <button
                  onClick={() => setIsSavingPreset(true)}
                  className="flex items-center gap-1 text-xs text-[oklch(var(--button-green))] hover:underline font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save as Preset
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Preset Name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCustomPreset}
                    className="px-2 py-1 rounded-lg bg-[oklch(var(--button-green))] text-white text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSavingPreset(false)}
                    className="px-1.5 py-1 text-white/50 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Custom User Presets (if any) */}
            {customPresets.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {customPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className="p-2.5 rounded-xl glass-panel text-left hover:border-white/30 transition-all active:scale-95"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        User
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50">Custom look</span>
                  </button>
                ))}
              </div>
            )}

            {/* Factory Lightroom Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LIGHTROOM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-2xl glass-panel text-left hover:border-white/30 transition-all active:scale-95 group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white/90 group-hover:text-white">
                      {preset.name}
                    </span>
                    {preset.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40 block truncate">
                    {preset.category} grade
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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

const SliderRow: React.FC<SliderRowProps> = ({
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
  const displayVal = format ? format(value) : `${value > 0 && min < 0 ? `+${value}` : value}${unit}`

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/75 font-medium tracking-tight text-[11px] sm:text-xs flex items-center gap-1.5">
          {accent && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent === 'orange' ? '#f97316' : accent === 'magenta' ? '#ec4899' : accent }}
            />
          )}
          {label}
        </span>
        <button
          onClick={onReset}
          className="font-mono text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer px-1 rounded hover:bg-white/10"
          title="Double click to reset to 0"
        >
          {displayVal}
        </button>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full lr-slider"
        />
        {/* Center Zero Tick for Bi-directional Sliders */}
        {min < 0 && max > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white/30 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
