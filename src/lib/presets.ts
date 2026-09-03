import { LightroomAdjustments, Preset, ColorChannel } from '../types'

export const DEFAULT_HSL_CHANNELS: ColorChannel[] = [
  'red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'
]

export const getDefaultHSL = (): Record<ColorChannel, { hue: number; sat: number; lum: number }> => ({
  red: { hue: 0, sat: 0, lum: 0 },
  orange: { hue: 0, sat: 0, lum: 0 },
  yellow: { hue: 0, sat: 0, lum: 0 },
  green: { hue: 0, sat: 0, lum: 0 },
  aqua: { hue: 0, sat: 0, lum: 0 },
  blue: { hue: 0, sat: 0, lum: 0 },
  purple: { hue: 0, sat: 0, lum: 0 },
  magenta: { hue: 0, sat: 0, lum: 0 },
})

export const getDefaultAdjustments = (): LightroomAdjustments => ({
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temp: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  hsl: getDefaultHSL(),
  clarity: 0,
  dehaze: 0,
  texture: 0,
  vignette: 0,
  grain: 0,
  sharpen: 0,
  noiseReduction: 0,
  curves: {
    rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  },
  colorGrading: {
    shadows: { hue: 0, sat: 0 },
    midtones: { hue: 0, sat: 0 },
    highlights: { hue: 0, sat: 0 },
  },
  straighten: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
})

export const LIGHTROOM_PRESETS: Preset[] = [
  {
    id: 'clean',
    name: 'Original Clean',
    category: 'Basic',
    badge: 'Reset',
    adjustments: getDefaultAdjustments()
  },
  {
    id: 'portra400',
    name: 'Portra Film',
    category: 'Film',
    badge: 'Popular',
    adjustments: {
      exposure: 0.15,
      contrast: -8,
      highlights: -20,
      shadows: 25,
      whites: -10,
      blacks: 15,
      temp: 14,
      tint: 6,
      vibrance: 12,
      saturation: -5,
      grain: 18,
      texture: 10,
      vignette: -12,
      colorGrading: {
        shadows: { hue: 38, sat: 15 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 45, sat: 10 }
      }
    }
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange',
    category: 'Cinema',
    badge: 'Trending',
    adjustments: {
      exposure: 0.1,
      contrast: 25,
      highlights: -15,
      shadows: 18,
      whites: 10,
      blacks: -12,
      temp: 8,
      tint: -4,
      vibrance: 28,
      saturation: 10,
      clarity: 18,
      dehaze: 14,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 195, sat: 35 },
        midtones: { hue: 35, sat: 15 },
        highlights: { hue: 32, sat: 40 }
      }
    }
  },
  {
    id: 'warm-cinema',
    name: 'Warm Cinema',
    category: 'Cinema',
    adjustments: {
      exposure: 0.05,
      contrast: 15,
      highlights: -25,
      shadows: 20,
      whites: 5,
      blacks: -10,
      temp: 24,
      tint: 10,
      vibrance: 15,
      saturation: 5,
      vignette: -18,
      grain: 12,
      colorGrading: {
        shadows: { hue: 215, sat: 18 },
        midtones: { hue: 40, sat: 14 },
        highlights: { hue: 45, sat: 28 }
      }
    }
  },
  {
    id: 'vivid-art',
    name: 'Vivid Artwork',
    category: 'Color',
    badge: 'Pro',
    adjustments: {
      exposure: 0.2,
      contrast: 22,
      highlights: -10,
      shadows: 15,
      whites: 12,
      blacks: -8,
      temp: 4,
      tint: 0,
      vibrance: 35,
      saturation: 18,
      clarity: 22,
      texture: 14,
      sharpen: 30
    }
  },
  {
    id: 'matte-vintage',
    name: 'Matte Vintage',
    category: 'Vintage',
    adjustments: {
      exposure: -0.1,
      contrast: -15,
      highlights: -30,
      shadows: 35,
      whites: -20,
      blacks: 40,
      temp: 18,
      tint: 8,
      vibrance: -10,
      saturation: -15,
      grain: 25,
      vignette: -15
    }
  },
  {
    id: 'high-contrast-bw',
    name: 'High Contrast B&W',
    category: 'B&W',
    badge: 'Classic',
    adjustments: {
      exposure: 0.1,
      contrast: 45,
      highlights: -15,
      shadows: -10,
      whites: 25,
      blacks: -35,
      saturation: -100,
      vibrance: -100,
      clarity: 25,
      texture: 20,
      sharpen: 35,
      vignette: -22
    }
  },
  {
    id: 'noir-drama',
    name: 'Noir Film',
    category: 'B&W',
    adjustments: {
      exposure: -0.2,
      contrast: 35,
      highlights: -40,
      shadows: -20,
      whites: 15,
      blacks: -45,
      saturation: -100,
      vibrance: -100,
      clarity: 30,
      grain: 32,
      vignette: -35
    }
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Mood',
    adjustments: {
      exposure: 0.15,
      contrast: 10,
      highlights: -18,
      shadows: 20,
      whites: 15,
      blacks: 5,
      temp: 36,
      tint: 14,
      vibrance: 25,
      saturation: 12,
      clarity: 10,
      vignette: -14,
      colorGrading: {
        shadows: { hue: 35, sat: 22 },
        midtones: { hue: 45, sat: 18 },
        highlights: { hue: 50, sat: 35 }
      }
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Creative',
    adjustments: {
      exposure: 0.1,
      contrast: 30,
      highlights: -10,
      shadows: 20,
      whites: 15,
      blacks: -20,
      temp: -18,
      tint: 38,
      vibrance: 40,
      saturation: 25,
      clarity: 28,
      vignette: -25,
      colorGrading: {
        shadows: { hue: 200, sat: 45 },
        midtones: { hue: 280, sat: 20 },
        highlights: { hue: 320, sat: 50 }
      }
    }
  },
  {
    id: 'clean-studio',
    name: 'Clean Studio',
    category: 'Studio',
    adjustments: {
      exposure: 0.25,
      contrast: 12,
      highlights: -12,
      shadows: 14,
      whites: 18,
      blacks: -4,
      temp: 2,
      tint: -2,
      vibrance: 15,
      saturation: 6,
      sharpen: 25,
      clarity: 12
    }
  },
  {
    id: 'ethereal-dream',
    name: 'Ethereal Glow',
    category: 'Mood',
    adjustments: {
      exposure: 0.3,
      contrast: -18,
      highlights: -15,
      shadows: 30,
      whites: 10,
      blacks: 20,
      temp: 10,
      tint: 12,
      vibrance: 18,
      saturation: -5,
      clarity: -25,
      texture: -15,
      vignette: 15
    }
  }
]
