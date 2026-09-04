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
  fade: 0,
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

// Authentic Professional Photography & Film Presets (Fully editable slider values)
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
      fade: 8,
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
    id: 'kodak_colorplus_200',
    name: 'Kodak ColorPlus 200',
    category: 'Плёнка',
    adjustments: {
      temp: 14,
      tint: 4,
      exposure: 0.12,
      contrast: 6,
      highlights: -14,
      shadows: 10,
      whites: 12,
      blacks: -6,
      vibrance: 16,
      saturation: 4,
      clarity: -2,
      texture: 6,
      grain: 16,
      fade: 6,
      colorGrading: {
        shadows: { hue: 42, sat: 14 },
        midtones: { hue: 48, sat: 8 },
        highlights: { hue: 52, sat: 12 },
      }
    }
  },
  {
    id: 'fuji_pro_400h',
    name: 'Fujifilm Pro 400H',
    category: 'Плёнка',
    adjustments: {
      temp: -6,
      tint: 8,
      exposure: 0.2,
      contrast: -12,
      highlights: -22,
      shadows: 18,
      whites: 6,
      blacks: 8,
      vibrance: 14,
      saturation: -6,
      clarity: -8,
      texture: 2,
      grain: 12,
      fade: 12,
      colorGrading: {
        shadows: { hue: 175, sat: 14 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 38, sat: 10 },
      }
    }
  },
  {
    id: 'lomography_color_400',
    name: 'Lomography Color 400',
    category: 'Плёнка',
    adjustments: {
      temp: 10,
      tint: -6,
      exposure: 0.05,
      contrast: 22,
      highlights: -16,
      shadows: -10,
      whites: 18,
      blacks: -14,
      vibrance: 28,
      saturation: 12,
      clarity: 14,
      texture: 10,
      vignette: -24,
      grain: 22,
      colorGrading: {
        shadows: { hue: 210, sat: 16 },
        midtones: { hue: 15, sat: 10 },
        highlights: { hue: 50, sat: 14 },
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
    id: 'kodak_ektachrome_e100',
    name: 'Kodak Ektachrome E100',
    category: 'Слайд',
    adjustments: {
      temp: -2,
      tint: -2,
      exposure: 0.05,
      contrast: 20,
      highlights: -14,
      shadows: -10,
      whites: 16,
      blacks: -16,
      vibrance: 24,
      saturation: 10,
      clarity: 12,
      texture: 10,
      sharpen: 14,
      grain: 2,
      colorGrading: {
        shadows: { hue: 225, sat: 18 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 45, sat: 8 },
      }
    }
  },
  {
    id: 'fuji_astia_100f',
    name: 'Fujifilm Astia 100F',
    category: 'Слайд',
    adjustments: {
      temp: 2,
      tint: 4,
      exposure: 0.1,
      contrast: 8,
      highlights: -16,
      shadows: 6,
      whites: 10,
      blacks: -8,
      vibrance: 16,
      saturation: 4,
      clarity: 4,
      texture: 6,
      sharpen: 10,
      grain: 0,
      colorGrading: {
        shadows: { hue: 30, sat: 8 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 35, sat: 6 },
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
      fade: 10,
      colorGrading: {
        shadows: { hue: 198, sat: 26 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 32, sat: 22 },
      }
    }
  },
  {
    id: 'technicolor_2strip',
    name: 'Technicolor 2-Strip',
    category: 'Кино',
    adjustments: {
      temp: 12,
      tint: -18,
      exposure: 0.05,
      contrast: 26,
      highlights: -18,
      shadows: -8,
      whites: 14,
      blacks: -12,
      vibrance: 30,
      saturation: 10,
      clarity: 16,
      texture: 12,
      grain: 18,
      colorGrading: {
        shadows: { hue: 185, sat: 35 },
        midtones: { hue: 12, sat: 18 },
        highlights: { hue: 28, sat: 30 },
      }
    }
  },
  {
    id: 'wes_anderson',
    name: 'Уэс Андерсон Пастель',
    category: 'Кино',
    adjustments: {
      temp: 16,
      tint: 10,
      exposure: 0.18,
      contrast: -14,
      highlights: -26,
      shadows: 24,
      whites: 8,
      blacks: 12,
      vibrance: 20,
      saturation: -2,
      clarity: -8,
      texture: 4,
      grain: 12,
      fade: 16,
      colorGrading: {
        shadows: { hue: 45, sat: 18 },
        midtones: { hue: 38, sat: 14 },
        highlights: { hue: 345, sat: 16 },
      }
    }
  },
  {
    id: 'blade_runner_teal_orange',
    name: 'Blade Runner 2049',
    category: 'Кино',
    adjustments: {
      temp: 4,
      tint: -2,
      exposure: 0,
      contrast: 28,
      highlights: -16,
      shadows: -14,
      whites: 18,
      blacks: -22,
      vibrance: 24,
      saturation: 4,
      clarity: 20,
      texture: 14,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 205, sat: 40 },
        midtones: { hue: 32, sat: 14 },
        highlights: { hue: 38, sat: 36 },
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
    id: 'kodak_trix_400',
    name: 'Kodak Tri-X 400',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 32,
      highlights: -18,
      shadows: -16,
      whites: 22,
      blacks: -26,
      vibrance: -100,
      saturation: -100,
      clarity: 22,
      texture: 16,
      grain: 34,
      curves: {
        rgb: [{ x: 0, y: 4 }, { x: 255, y: 254 }],
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
    id: 'fomapan_100',
    name: 'Fomapan 100 Classic',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0,
      contrast: 14,
      highlights: -12,
      shadows: 6,
      whites: 12,
      blacks: -8,
      vibrance: -100,
      saturation: -100,
      clarity: 10,
      texture: 8,
      grain: 18,
      fade: 10,
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
      exposure: 0.1,
      contrast: 36,
      highlights: -22,
      shadows: -20,
      whites: 26,
      blacks: -30,
      vibrance: -100,
      saturation: -100,
      clarity: 24,
      texture: 20,
      grain: 52,
      vignette: -16,
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
      contrast: 12,
      highlights: -14,
      shadows: 8,
      whites: 10,
      blacks: -10,
      vibrance: -100,
      saturation: -100,
      clarity: 10,
      texture: 12,
      sharpen: 14,
      grain: 4,
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
    category: 'Арт',
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
    category: 'Плёнка',
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
      fade: 6,
      colorGrading: {
        shadows: { hue: 200, sat: 14 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 36, sat: 12 },
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
    category: 'Арт',
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
    category: 'Арт',
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
      fade: 6,
      colorGrading: {
        shadows: { hue: 28, sat: 22 },
        midtones: { hue: 35, sat: 10 },
        highlights: { hue: 42, sat: 16 },
      }
    }
  }
]
