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

export const LightroomStudio: React.FC<LightroomStudioProps> = ({
  adjustments,
  onChange,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('light')
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
    <div className="w-full flex flex-col bg-[#faf8f8] border-t border-[#e3dbdc] select-none text-[#0f0b0c]">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-1.5 border-b border-[#e3dbdc] no-scrollbar justify-start sm:justify-center">
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
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-normal transition-colors cursor-pointer border ${
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
          title="Reset all adjustments to zero"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-3 sm:p-4 max-w-xl mx-auto w-full max-h-[36vh] sm:max-h-[38vh] overflow-y-auto no-scrollbar">
        {/* LIGHT CONTROLS */}
        {activeTab === 'light' && (
          <div className="flex flex-col gap-2.5">
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

        {/* COLOR & HSL */}
        {activeTab === 'color' && (
          <div className="flex flex-col gap-3">
            {/* Global Temperature / Tint / Vibrance / Sat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-[#e3dbdc]">
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
                label="Tint (Green/Magenta)"
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

            {/* 8-Channel HSL Color Mixer */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs text-[#565051] uppercase tracking-wider font-normal">
                  8-Channel HSL Mixer
                </span>
                <span className="capitalize text-[#0f0b0c] text-xs font-normal">
                  {selectedHslChannel}
                </span>
              </div>

              {/* Color channel selector buttons */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {DEFAULT_HSL_CHANNELS.map((ch) => {
                  const isSelected = selectedHslChannel === ch
                  const hexColors: Record<ColorChannel, string> = {
                    red: '#e11d48',
                    orange: '#f97316',
                    yellow: '#eab308',
                    green: '#22c55e',
                    aqua: '#06b6d4',
                    blue: '#3b82f6',
                    purple: '#a855f7',
                    magenta: '#ec4899',
                  }
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
                        style={{ backgroundColor: hexColors[ch] }}
                      />
                      <span className="capitalize text-[11px]">{ch}</span>
                    </button>
                  )
                })}
              </div>

              {/* HSL Sliders for active channel */}
              <div className="flex flex-col gap-2 pt-1">
                <SliderRow
                  label={`${selectedHslChannel} Hue`}
                  value={adjustments.hsl[selectedHslChannel]?.hue || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'hue', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'hue', 0)}
                />
                <SliderRow
                  label={`${selectedHslChannel} Saturation`}
                  value={adjustments.hsl[selectedHslChannel]?.sat || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'sat', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'sat', 0)}
                />
                <SliderRow
                  label={`${selectedHslChannel} Luminance`}
                  value={adjustments.hsl[selectedHslChannel]?.lum || 0}
                  min={-100}
                  max={100}
                  onChange={(v) => updateHsl(selectedHslChannel, 'lum', v)}
                  onReset={() => updateHsl(selectedHslChannel, 'lum', 0)}
                />
              </div>
            </div>

            {/* Split Toning */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e3dbdc]">
              <span className="text-xs text-[#565051] uppercase tracking-wider font-normal">
                Split Toning
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <SliderRow
                  label="Shadows Hue"
                  value={adjustments.colorGrading.shadows.hue}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(v) => updateSplitTone('shadows', 'hue', v)}
                  onReset={() => updateSplitTone('shadows', 'hue', 0)}
                />
                <SliderRow
                  label="Shadows Amount"
                  value={adjustments.colorGrading.shadows.sat}
                  min={0}
                  max={100}
                  onChange={(v) => updateSplitTone('shadows', 'sat', v)}
                  onReset={() => updateSplitTone('shadows', 'sat', 0)}
                />
                <SliderRow
                  label="Highlights Hue"
                  value={adjustments.colorGrading.highlights.hue}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(v) => updateSplitTone('highlights', 'hue', v)}
                  onReset={() => updateSplitTone('highlights', 'hue', 0)}
                />
                <SliderRow
                  label="Highlights Amount"
                  value={adjustments.colorGrading.highlights.sat}
                  min={0}
                  max={100}
                  onChange={(v) => updateSplitTone('highlights', 'sat', v)}
                  onReset={() => updateSplitTone('highlights', 'sat', 0)}
                />
              </div>
            </div>
          </div>
        )}

        {/* EFFECTS CONTROLS */}
        {activeTab === 'effects' && (
          <div className="flex flex-col gap-2.5">
            <SliderRow
              label="Clarity"
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

        {/* DETAIL CONTROLS */}
        {activeTab === 'detail' && (
          <div className="flex flex-col gap-2.5">
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

        {/* TONE CURVES */}
        {activeTab === 'curves' && (
          <div className="flex flex-col gap-3 items-center">
            {/* Channel Switcher */}
            <div className="flex items-center gap-1 border border-[#e3dbdc] p-0.5 bg-white">
              {[
                { id: 'rgb', label: 'RGB', color: 'text-[#0f0b0c]' },
                { id: 'red', label: 'Red', color: 'text-red-600' },
                { id: 'green', label: 'Green', color: 'text-green-700' },
                { id: 'blue', label: 'Blue', color: 'text-blue-700' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCurveChannel(c.id as any)}
                  className={`px-3 py-1 text-xs transition-colors cursor-pointer border ${
                    selectedCurveChannel === c.id
                      ? 'bg-[#0f0b0c] text-[#faf8f8] border-[#0f0b0c]'
                      : `bg-transparent border-transparent ${c.color} hover:border-[#e3dbdc]`
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Visual Curve Sliders */}
            <div className="w-full max-w-sm bg-white p-3 border border-[#e3dbdc] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-[#565051]">
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

        {/* PRESETS CATALOG */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-3">
            {/* Save Custom Preset Button */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#565051] font-normal">
                Lightroom Catalog
              </span>
              {!isSavingPreset ? (
                <button
                  onClick={() => setIsSavingPreset(true)}
                  className="flex items-center gap-1 text-xs text-[#0f0b0c] hover:text-[#34292a] font-normal underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Save as Preset
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Preset Name..."
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="px-2 py-1 bg-white border border-[#e3dbdc] text-xs text-[#0f0b0c] focus:border-[#34292a] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCustomPreset}
                    className="px-2.5 py-1 bg-[#0f0b0c] text-[#faf8f8] text-xs font-normal border border-[#0f0b0c]"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSavingPreset(false)}
                    className="px-1.5 py-1 text-[#565051] text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[...customPresets, ...LIGHTROOM_PRESETS].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="group relative flex flex-col p-2.5 bg-white border border-[#e3dbdc] hover:border-[#34292a] text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-normal text-[#0f0b0c] truncate group-hover:text-[#34292a]">
                      {preset.name}
                    </span>
                    {preset.badge && (
                      <span className="text-[9px] px-1 py-0.2 border border-[#e3dbdc] text-[#565051] font-mono uppercase">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#565051] line-clamp-1">
                    {preset.category}
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
    <div className="flex flex-col gap-0.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#0f0b0c] font-normal tracking-tight text-[11px] sm:text-xs flex items-center gap-1.5">
          {accent && (
            <span
              className="w-1.5 h-1.5"
              style={{ backgroundColor: accent === 'orange' ? '#ea580c' : accent === 'magenta' ? '#db2777' : accent }}
            />
          )}
          {label}
        </span>
        <button
          onClick={onReset}
          className="font-mono text-[11px] text-[#565051] hover:text-[#0f0b0c] transition-colors cursor-pointer px-1 hover:bg-[#e3dbdc]/40"
          title="Click to reset to 0"
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
        {min < 0 && max > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 w-px h-2 bg-[#565051]/40 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
