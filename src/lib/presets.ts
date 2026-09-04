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

// Authentic Professional Photography & Film Presets (No commercial tags or badges)
export const LIGHTROOM_PRESETS: Preset[] = [
  {
    id: 'portra_400',
    name: 'Kodak Portra 400',
    category: 'Плёнка',
    adjustments: {
      temp: 8,
      tint: 3,
      exposure: 0.15,
      contrast: -8,
      highlights: -18,
      shadows: 14,
      whites: 8,
      blacks: -4,
      vibrance: 12,
      saturation: -4,
      clarity: -6,
      texture: 4,
      grain: 14,
      curves: {
        rgb: [{ x: 0, y: 12 }, { x: 255, y: 250 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 8 }, { x: 255, y: 248 }],
      },
      colorGrading: {
        shadows: { hue: 35, sat: 8 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 42, sat: 10 },
      }
    }
  },
  {
    id: 'fuji_provia',
    name: 'Fujifilm Provia 100F',
    category: 'Слайд',
    adjustments: {
      temp: -4,
      tint: 2,
      exposure: 0,
      contrast: 18,
      highlights: -10,
      shadows: -8,
      whites: 14,
      blacks: -12,
      vibrance: 22,
      saturation: 8,
      clarity: 10,
      texture: 8,
      sharpen: 12,
      grain: 0,
      curves: {
        rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      },
      colorGrading: {
        shadows: { hue: 215, sat: 12 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
      }
    }
  },
  {
    id: 'cinestill_800t',
    name: 'CineStill 800T',
    category: 'Кино',
    adjustments: {
      temp: -8,
      tint: 6,
      exposure: 0.1,
      contrast: 12,
      highlights: -24,
      shadows: 18,
      whites: 10,
      blacks: 6,
      vibrance: 14,
      saturation: -6,
      clarity: 6,
      grain: 22,
      colorGrading: {
        shadows: { hue: 198, sat: 26 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 32, sat: 22 },
      }
    }
  },
  {
    id: 'ilford_hp5',
    name: 'Ilford HP5 Plus 400',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0,
      contrast: 24,
      highlights: -14,
      shadows: -10,
      whites: 18,
      blacks: -20,
      vibrance: -100,
      saturation: -100,
      clarity: 16,
      texture: 12,
      grain: 28,
      curves: {
        rgb: [{ x: 0, y: 6 }, { x: 255, y: 252 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      },
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
      }
    }
  },
  {
    id: 'leica_monochrom',
    name: 'Leica Monochrom M',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 10,
      highlights: -8,
      shadows: 12,
      whites: 6,
      blacks: -8,
      vibrance: -100,
      saturation: -100,
      clarity: 8,
      texture: 14,
      sharpen: 16,
      grain: 8,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
      }
    }
  },
  {
    id: 'golden_hour',
    name: 'Золотой час',
    category: 'Естественный свет',
    adjustments: {
      temp: 24,
      tint: 4,
      exposure: 0.2,
      contrast: -4,
      highlights: -22,
      shadows: 16,
      whites: 12,
      blacks: -6,
      vibrance: 18,
      saturation: 4,
      clarity: -8,
      colorGrading: {
        shadows: { hue: 38, sat: 18 },
        midtones: { hue: 42, sat: 10 },
        highlights: { hue: 46, sat: 28 },
      }
    }
  },
  {
    id: 'warm_vintage',
    name: 'Тёплый винтаж',
    category: 'Архив',
    adjustments: {
      temp: 14,
      tint: -2,
      exposure: 0,
      contrast: -14,
      highlights: -26,
      shadows: 20,
      whites: -8,
      blacks: 24,
      vibrance: -10,
      saturation: -8,
      clarity: -12,
      grain: 16,
      curves: {
        rgb: [{ x: 0, y: 22 }, { x: 255, y: 242 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 14 }, { x: 255, y: 236 }],
      },
      colorGrading: {
        shadows: { hue: 45, sat: 14 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 50, sat: 16 },
      }
    }
  },
  {
    id: 'clean_studio',
    name: 'Студийный чистый',
    category: 'Референс',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0,
      contrast: 6,
      highlights: -6,
      shadows: 6,
      whites: 4,
      blacks: -4,
      vibrance: 8,
      saturation: 0,
      clarity: 10,
      texture: 8,
      sharpen: 12,
      noiseReduction: 6,
      grain: 0,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
      }
    }
  },
  {
    id: 'cool_cinema',
    name: 'Холодный нуар',
    category: 'Кино',
    adjustments: {
      temp: -12,
      tint: -4,
      exposure: -0.1,
      contrast: 20,
      highlights: -18,
      shadows: -14,
      whites: 10,
      blacks: -16,
      vibrance: 12,
      saturation: -14,
      clarity: 12,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 212, sat: 28 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 38, sat: 16 },
      }
    }
  },
  {
    id: 'ethereal_glow',
    name: 'Мягкое свечение',
    category: 'Атмосфера',
    adjustments: {
      temp: 6,
      tint: 4,
      exposure: 0.25,
      contrast: -12,
      highlights: -28,
      shadows: 22,
      whites: 14,
      blacks: 8,
      vibrance: 16,
      saturation: -2,
      clarity: -24,
      texture: -10,
      colorGrading: {
        shadows: { hue: 280, sat: 8 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 45, sat: 20 },
      }
    }
  },
  {
    id: 'kodak_ektar_100',
    name: 'Kodak Ektar 100',
    category: 'Плёнка',
    adjustments: {
      temp: 4,
      tint: -2,
      exposure: 0.05,
      contrast: 16,
      highlights: -14,
      shadows: 6,
      whites: 12,
      blacks: -10,
      vibrance: 24,
      saturation: 10,
      clarity: 14,
      texture: 10,
      sharpen: 12,
      grain: 4,
      colorGrading: {
        shadows: { hue: 210, sat: 10 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 35, sat: 14 },
      }
    }
  },
  {
    id: 'kodak_gold_200',
    name: 'Kodak Gold 200',
    category: 'Плёнка',
    adjustments: {
      temp: 16,
      tint: 6,
      exposure: 0.1,
      contrast: -4,
      highlights: -16,
      shadows: 18,
      whites: 6,
      blacks: 4,
      vibrance: 14,
      saturation: 2,
      clarity: -4,
      texture: 6,
      grain: 18,
      curves: {
        rgb: [{ x: 0, y: 10 }, { x: 255, y: 248 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 6 }, { x: 255, y: 240 }],
      },
      colorGrading: {
        shadows: { hue: 40, sat: 16 },
        midtones: { hue: 45, sat: 8 },
        highlights: { hue: 50, sat: 18 },
      }
    }
  },
  {
    id: 'kodachrome_64',
    name: 'Kodachrome 64',
    category: 'Слайд',
    adjustments: {
      temp: 6,
      tint: -4,
      exposure: 0,
      contrast: 22,
      highlights: -20,
      shadows: -6,
      whites: 16,
      blacks: -14,
      vibrance: 18,
      saturation: 6,
      clarity: 16,
      texture: 12,
      sharpen: 14,
      grain: 10,
      colorGrading: {
        shadows: { hue: 220, sat: 14 },
        midtones: { hue: 15, sat: 8 },
        highlights: { hue: 30, sat: 16 },
      }
    }
  },
  {
    id: 'fuji_velvia_50',
    name: 'Fujifilm Velvia 50',
    category: 'Слайд',
    adjustments: {
      temp: -2,
      tint: 4,
      exposure: -0.05,
      contrast: 26,
      highlights: -12,
      shadows: -14,
      whites: 20,
      blacks: -18,
      vibrance: 32,
      saturation: 16,
      clarity: 18,
      texture: 14,
      sharpen: 16,
      grain: 2,
      colorGrading: {
        shadows: { hue: 230, sat: 16 },
        midtones: { hue: 140, sat: 8 },
        highlights: { hue: 55, sat: 12 },
      }
    }
  },
  {
    id: 'fuji_superia_400',
    name: 'Fujifilm Superia 400',
    category: 'Плёнка',
    adjustments: {
      temp: -4,
      tint: 10,
      exposure: 0.1,
      contrast: 8,
      highlights: -14,
      shadows: 12,
      whites: 8,
      blacks: -4,
      vibrance: 16,
      saturation: 4,
      clarity: 6,
      texture: 8,
      grain: 16,
      colorGrading: {
        shadows: { hue: 310, sat: 12 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 70, sat: 10 },
      }
    }
  },
  {
    id: 'fuji_classic_chrome',
    name: 'Fujifilm Classic Chrome',
    category: 'Документальный',
    adjustments: {
      temp: 2,
      tint: -2,
      exposure: 0,
      contrast: 18,
      highlights: -24,
      shadows: -8,
      whites: 6,
      blacks: -14,
      vibrance: -14,
      saturation: -16,
      clarity: 14,
      texture: 10,
      sharpen: 10,
      grain: 8,
      colorGrading: {
        shadows: { hue: 200, sat: 14 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 36, sat: 12 },
      }
    }
  },
  {
    id: 'kodak_trix_400',
    name: 'Kodak Tri-X 400',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0,
      contrast: 28,
      highlights: -18,
      shadows: -16,
      whites: 22,
      blacks: -24,
      vibrance: -100,
      saturation: -100,
      clarity: 22,
      texture: 16,
      grain: 34,
      sharpen: 18,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
      }
    }
  },
  {
    id: 'ilford_delta_3200',
    name: 'Ilford Delta 3200',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.15,
      contrast: 34,
      highlights: -28,
      shadows: -12,
      whites: 24,
      blacks: -22,
      vibrance: -100,
      saturation: -100,
      clarity: 28,
      texture: 22,
      grain: 48,
      vignette: -14,
      curves: {
        rgb: [{ x: 0, y: 16 }, { x: 255, y: 244 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      }
    }
  },
  {
    id: 'polaroid_sx70',
    name: 'Polaroid SX-70 Original',
    category: 'Архив',
    adjustments: {
      temp: 8,
      tint: -6,
      exposure: 0.1,
      contrast: -18,
      highlights: -32,
      shadows: 24,
      whites: -12,
      blacks: 28,
      vibrance: -8,
      saturation: -12,
      clarity: -14,
      grain: 20,
      vignette: -18,
      curves: {
        rgb: [{ x: 0, y: 28 }, { x: 255, y: 236 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 4 }, { x: 255, y: 250 }],
        blue: [{ x: 0, y: 18 }, { x: 255, y: 228 }],
      },
      colorGrading: {
        shadows: { hue: 160, sat: 14 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 45, sat: 22 },
      }
    }
  },
  {
    id: 'cinestill_50d',
    name: 'CineStill 50D Daylight',
    category: 'Кино',
    adjustments: {
      temp: 2,
      tint: -2,
      exposure: 0.05,
      contrast: 10,
      highlights: -16,
      shadows: 8,
      whites: 8,
      blacks: -6,
      vibrance: 18,
      saturation: 6,
      clarity: 8,
      texture: 6,
      grain: 8,
      colorGrading: {
        shadows: { hue: 195, sat: 18 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 28, sat: 16 },
      }
    }
  },
  {
    id: 'agfa_vista_200',
    name: 'Agfa Vista 200',
    category: 'Плёнка',
    adjustments: {
      temp: 10,
      tint: 4,
      exposure: 0.05,
      contrast: 14,
      highlights: -14,
      shadows: 10,
      whites: 12,
      blacks: -8,
      vibrance: 22,
      saturation: 8,
      clarity: 10,
      grain: 16,
      colorGrading: {
        shadows: { hue: 185, sat: 12 },
        midtones: { hue: 25, sat: 6 },
        highlights: { hue: 40, sat: 14 },
      }
    }
  },
  {
    id: 'nordic_emerald',
    name: 'Северный изумруд',
    category: 'Природа',
    adjustments: {
      temp: -8,
      tint: 4,
      exposure: -0.05,
      contrast: 14,
      highlights: -20,
      shadows: 12,
      whites: 6,
      blacks: -12,
      vibrance: 16,
      saturation: -6,
      clarity: 12,
      texture: 10,
      colorGrading: {
        shadows: { hue: 155, sat: 22 },
        midtones: { hue: 200, sat: 6 },
        highlights: { hue: 60, sat: 10 },
      }
    }
  },
  {
    id: 'terracotta_warmth',
    name: 'Терракота и глина',
    category: 'Архитектура',
    adjustments: {
      temp: 18,
      tint: 6,
      exposure: 0.1,
      contrast: 8,
      highlights: -18,
      shadows: 14,
      whites: 8,
      blacks: -6,
      vibrance: 12,
      saturation: 4,
      clarity: 10,
      texture: 14,
      colorGrading: {
        shadows: { hue: 28, sat: 22 },
        midtones: { hue: 35, sat: 10 },
        highlights: { hue: 42, sat: 16 },
      }
    }
  },
  {
    id: 'museum_archival',
    name: 'Музейный свет',
    category: 'Референс',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 4,
      highlights: -8,
      shadows: 8,
      whites: 4,
      blacks: -4,
      vibrance: 6,
      saturation: 0,
      clarity: 6,
      texture: 8,
      sharpen: 10,
      noiseReduction: 4,
      grain: 0,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
      }
    }
  },
  {
    id: 'sepia_albumen',
    name: 'Альбуминовая печать',
    category: 'Архив',
    adjustments: {
      temp: 26,
      tint: 8,
      exposure: -0.05,
      contrast: 8,
      highlights: -24,
      shadows: 16,
      whites: -6,
      blacks: 14,
      vibrance: -80,
      saturation: -85,
      clarity: -6,
      texture: 12,
      grain: 26,
      vignette: -22,
      curves: {
        rgb: [{ x: 0, y: 22 }, { x: 255, y: 240 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 12 }, { x: 255, y: 232 }],
      },
      colorGrading: {
        shadows: { hue: 38, sat: 34 },
        midtones: { hue: 42, sat: 28 },
        highlights: { hue: 46, sat: 36 },
      }
    }
  },
  {
    id: 'cyberpunk_neon',
    name: 'Неоновый сумрак',
    category: 'Кино',
    adjustments: {
      temp: -16,
      tint: 14,
      exposure: -0.1,
      contrast: 24,
      highlights: -14,
      shadows: -18,
      whites: 16,
      blacks: -20,
      vibrance: 26,
      saturation: 8,
      clarity: 16,
      texture: 12,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 265, sat: 36 },
        midtones: { hue: 195, sat: 16 },
        highlights: { hue: 325, sat: 30 },
      }
    }
  }
]
