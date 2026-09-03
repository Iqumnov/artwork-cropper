export interface ScanPoint {
  x: number
  y: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface AspectRatio {
  name: string
  ratio: number // 0 means Free
}

export const ASPECT_RATIOS: AspectRatio[] = [
  { name: 'Свободно', ratio: 0 },
  { name: '1:1', ratio: 1 },
  { name: '4:3', ratio: 4 / 3 },
  { name: '3:4', ratio: 3 / 4 },
  { name: '16:9', ratio: 16 / 9 },
  { name: '9:16', ratio: 9 / 16 },
  { name: '3:2', ratio: 3 / 2 },
  { name: '2:3', ratio: 2 / 3 },
]

export type ColorChannel = 'red' | 'orange' | 'yellow' | 'green' | 'aqua' | 'blue' | 'purple' | 'magenta'

export interface HSLValues {
  hue: number // -100 to +100
  sat: number // -100 to +100
  lum: number // -100 to +100
}

export interface ToneCurvePoint {
  x: number // 0 to 255
  y: number // 0 to 255
}

export interface SplitTone {
  hue: number // 0 to 360
  sat: number // 0 to 100
}

export interface LightroomAdjustments {
  // LIGHT
  exposure: number // -5.0 to +5.0 EV (default 0)
  contrast: number // -100 to +100
  highlights: number // -100 to +100
  shadows: number // -100 to +100
  whites: number // -100 to +100
  blacks: number // -100 to +100

  // COLOR
  temp: number // -100 to +100 (Warmth: Blue <-> Yellow)
  tint: number // -100 to +100 (Tint: Green <-> Magenta)
  vibrance: number // -100 to +100
  saturation: number // -100 to +100

  // HSL COLOR MIXER
  hsl: Record<ColorChannel, HSLValues>

  // EFFECTS
  clarity: number // -100 to +100
  dehaze: number // -100 to +100
  texture: number // -100 to +100
  vignette: number // -100 to +100
  grain: number // 0 to 100

  // DETAIL
  sharpen: number // 0 to 100
  noiseReduction: number // 0 to 100

  // CURVES
  curves: {
    rgb: ToneCurvePoint[]
    red: ToneCurvePoint[]
    green: ToneCurvePoint[]
    blue: ToneCurvePoint[]
  }

  // COLOR GRADING (Split Toning)
  colorGrading: {
    shadows: SplitTone
    midtones: SplitTone
    highlights: SplitTone
  }

  // GEOMETRY
  straighten: number // -45 to +45 deg
  rotation: number // 0, 90, 180, 270 deg
  flipH: boolean
  flipV: boolean
}

export interface Preset {
  id: string
  name: string
  category: string
  badge?: string
  adjustments: Partial<LightroomAdjustments>
}

export type EditorTab = 'crop' | 'light' | 'color' | 'effects' | 'detail' | 'curves' | 'presets'
