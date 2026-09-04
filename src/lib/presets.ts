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
    balance: 0,
  },
  straighten: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
})

// Comprehensive Authentic Preset Collection (Cinema, Archives, Film, Slide, Monochrome, Art)
export const LIGHTROOM_PRESETS: Preset[] = [
  // ==========================================
  // --- КИНО (CINEMA & LEGENDARY FILMS) ---
  // ==========================================
  {
    id: 'godfather_70s',
    name: 'Крёстный отец (70-е)',
    category: 'Кино',
    adjustments: {
      temp: 18,
      tint: -2,
      exposure: -0.1,
      contrast: 22,
      highlights: -24,
      shadows: -16,
      whites: 8,
      blacks: -18,
      vibrance: 10,
      saturation: -6,
      clarity: 14,
      texture: 16,
      grain: 20,
      fade: 6,
      vignette: -22,
      colorGrading: {
        shadows: { hue: 36, sat: 28 },
        midtones: { hue: 42, sat: 14 },
        highlights: { hue: 48, sat: 26 },
        balance: -15,
      }
    }
  },
  {
    id: 'blade_runner_2049',
    name: 'Blade Runner 2049',
    category: 'Кино',
    adjustments: {
      temp: 6,
      tint: -4,
      exposure: 0,
      contrast: 26,
      highlights: -16,
      shadows: -14,
      whites: 16,
      blacks: -20,
      vibrance: 24,
      saturation: 4,
      clarity: 18,
      texture: 14,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 205, sat: 38 },
        midtones: { hue: 32, sat: 14 },
        highlights: { hue: 38, sat: 34 },
        balance: -10,
      }
    }
  },
  {
    id: 'wes_anderson_pastel',
    name: 'Уэс Андерсон Пастель',
    category: 'Кино',
    adjustments: {
      temp: 16,
      tint: 8,
      exposure: 0.18,
      contrast: -12,
      highlights: -26,
      shadows: 22,
      whites: 8,
      blacks: 12,
      vibrance: 18,
      saturation: -2,
      clarity: -8,
      texture: 6,
      grain: 12,
      fade: 16,
      colorGrading: {
        shadows: { hue: 45, sat: 18 },
        midtones: { hue: 38, sat: 14 },
        highlights: { hue: 345, sat: 16 },
        balance: 10,
      }
    }
  },
  {
    id: 'dune_arrakis',
    name: 'Дюна (Арракис)',
    category: 'Кино',
    adjustments: {
      temp: 20,
      tint: -6,
      exposure: 0.05,
      contrast: 18,
      highlights: -14,
      shadows: -8,
      whites: 16,
      blacks: -12,
      vibrance: -14,
      saturation: -12,
      clarity: 22,
      texture: 20,
      dehaze: 12,
      grain: 16,
      fade: 8,
      colorGrading: {
        shadows: { hue: 38, sat: 30 },
        midtones: { hue: 42, sat: 18 },
        highlights: { hue: 46, sat: 22 },
        balance: -5,
      }
    }
  },
  {
    id: 'bleach_bypass_ryan',
    name: 'Bleach Bypass (Рядовой Райан)',
    category: 'Кино',
    adjustments: {
      temp: -2,
      tint: -2,
      exposure: 0,
      contrast: 36,
      highlights: -24,
      shadows: -18,
      whites: 24,
      blacks: -28,
      vibrance: -35,
      saturation: -42,
      clarity: 28,
      texture: 24,
      grain: 32,
      vignette: -14,
      colorGrading: {
        shadows: { hue: 210, sat: 14 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 45, sat: 12 },
        balance: 0,
      }
    }
  },
  {
    id: 'matrix_code_1999',
    name: 'Матрица 1999',
    category: 'Кино',
    adjustments: {
      temp: -6,
      tint: -18,
      exposure: -0.05,
      contrast: 24,
      highlights: -18,
      shadows: -12,
      whites: 12,
      blacks: -18,
      vibrance: 12,
      saturation: -8,
      clarity: 16,
      texture: 14,
      grain: 14,
      colorGrading: {
        shadows: { hue: 145, sat: 28 },
        midtones: { hue: 135, sat: 20 },
        highlights: { hue: 120, sat: 24 },
        balance: -10,
      }
    }
  },
  {
    id: 'wong_kar_wai',
    name: 'Вонг Карвай (Любовное настроение)',
    category: 'Кино',
    adjustments: {
      temp: 14,
      tint: -12,
      exposure: 0.05,
      contrast: 20,
      highlights: -22,
      shadows: 10,
      whites: 8,
      blacks: -14,
      vibrance: 26,
      saturation: 8,
      clarity: 12,
      texture: 14,
      grain: 24,
      fade: 10,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 168, sat: 30 },
        midtones: { hue: 35, sat: 16 },
        highlights: { hue: 42, sat: 28 },
        balance: -12,
      }
    }
  },
  {
    id: 'tarkovsky_nostalghia',
    name: 'Тарковский (Зеркало)',
    category: 'Кино',
    adjustments: {
      temp: 6,
      tint: -4,
      exposure: -0.05,
      contrast: -8,
      highlights: -26,
      shadows: 18,
      whites: -6,
      blacks: 14,
      vibrance: -18,
      saturation: -16,
      clarity: -14,
      texture: 10,
      grain: 20,
      fade: 18,
      colorGrading: {
        shadows: { hue: 110, sat: 16 },
        midtones: { hue: 45, sat: 10 },
        highlights: { hue: 50, sat: 14 },
        balance: 5,
      }
    }
  },
  {
    id: 'french_new_wave',
    name: 'Новая волна (Годар)',
    category: 'Кино',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 34,
      highlights: -20,
      shadows: -16,
      whites: 22,
      blacks: -28,
      vibrance: -100,
      saturation: -100,
      clarity: 24,
      texture: 18,
      grain: 38,
      fade: 6,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
        balance: 0,
      }
    }
  },
  {
    id: 'roma_cuaron',
    name: 'Рома 65мм (Куарон)',
    category: 'Кино',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.1,
      contrast: 14,
      highlights: -18,
      shadows: 12,
      whites: 14,
      blacks: -12,
      vibrance: -100,
      saturation: -100,
      clarity: 16,
      texture: 14,
      grain: 8,
      fade: 4,
      sharpen: 12,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
        balance: 0,
      }
    }
  },
  {
    id: 'oppenheimer_70mm',
    name: 'Оппенгеймер (IMAX 70mm)',
    category: 'Кино',
    adjustments: {
      temp: 4,
      tint: -2,
      exposure: 0.05,
      contrast: 22,
      highlights: -16,
      shadows: 6,
      whites: 16,
      blacks: -14,
      vibrance: 16,
      saturation: 4,
      clarity: 18,
      texture: 22,
      sharpen: 16,
      grain: 6,
      colorGrading: {
        shadows: { hue: 215, sat: 16 },
        midtones: { hue: 35, sat: 8 },
        highlights: { hue: 42, sat: 18 },
        balance: -5,
      }
    }
  },
  {
    id: 'technicolor_3strip',
    name: 'Technicolor 3-Strip',
    category: 'Кино',
    adjustments: {
      temp: 8,
      tint: -6,
      exposure: 0.1,
      contrast: 24,
      highlights: -16,
      shadows: -6,
      whites: 18,
      blacks: -10,
      vibrance: 36,
      saturation: 18,
      clarity: 16,
      texture: 12,
      grain: 12,
      colorGrading: {
        shadows: { hue: 200, sat: 22 },
        midtones: { hue: 25, sat: 14 },
        highlights: { hue: 48, sat: 24 },
        balance: 5,
      }
    }
  },
  {
    id: 'cinestill_800t',
    name: 'CineStill 800T (Ночной неон)',
    category: 'Кино',
    adjustments: {
      temp: -12,
      tint: 10,
      exposure: 0.15,
      contrast: 16,
      highlights: -24,
      shadows: 18,
      whites: 12,
      blacks: -6,
      vibrance: 20,
      saturation: 4,
      clarity: 10,
      texture: 12,
      grain: 26,
      fade: 10,
      colorGrading: {
        shadows: { hue: 195, sat: 28 },
        midtones: { hue: 180, sat: 8 },
        highlights: { hue: 28, sat: 26 },
        balance: -15,
      }
    }
  },
  {
    id: 'cinestill_50d',
    name: 'CineStill 50D (Дневной кинокадр)',
    category: 'Кино',
    adjustments: {
      temp: 4,
      tint: -2,
      exposure: 0.05,
      contrast: 12,
      highlights: -16,
      shadows: 8,
      whites: 10,
      blacks: -8,
      vibrance: 18,
      saturation: 6,
      clarity: 10,
      texture: 8,
      grain: 6,
      sharpen: 12,
      colorGrading: {
        shadows: { hue: 198, sat: 16 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 32, sat: 16 },
        balance: 0,
      }
    }
  },
  {
    id: 'cool_noir_cinema',
    name: 'Холодный нео-нуар',
    category: 'Кино',
    adjustments: {
      temp: -14,
      tint: -4,
      exposure: -0.1,
      contrast: 24,
      highlights: -20,
      shadows: -16,
      whites: 12,
      blacks: -18,
      vibrance: 12,
      saturation: -16,
      clarity: 16,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 214, sat: 32 },
        midtones: { hue: 200, sat: 8 },
        highlights: { hue: 42, sat: 16 },
        balance: -20,
      }
    }
  },

  // ==========================================
  // --- АРХИВ (HISTORICAL & VINTAGE PROCESSES) ---
  // ==========================================
  {
    id: 'daguerreotype_1839',
    name: 'Дагеротип 1839',
    category: 'Архив',
    adjustments: {
      temp: -4,
      tint: -2,
      exposure: 0.05,
      contrast: 28,
      highlights: 14,
      shadows: -22,
      whites: 18,
      blacks: -24,
      vibrance: -100,
      saturation: -100,
      clarity: 24,
      texture: 26,
      grain: 12,
      vignette: -32,
      curves: {
        rgb: [{ x: 0, y: 8 }, { x: 255, y: 252 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      },
      colorGrading: {
        shadows: { hue: 210, sat: 8 },
        midtones: { hue: 45, sat: 6 },
        highlights: { hue: 205, sat: 10 },
        balance: -5,
      }
    }
  },
  {
    id: 'cyanotype_1842',
    name: 'Цианотипия 1842 (Лазурь)',
    category: 'Архив',
    adjustments: {
      temp: -25,
      tint: -10,
      exposure: 0.05,
      contrast: 22,
      highlights: -10,
      shadows: -14,
      whites: 20,
      blacks: -18,
      vibrance: -100,
      saturation: -100,
      clarity: 16,
      texture: 18,
      fade: 6,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 212, sat: 65 },
        midtones: { hue: 208, sat: 50 },
        highlights: { hue: 200, sat: 35 },
        balance: 0,
      }
    }
  },
  {
    id: 'tintype_1860',
    name: 'Тинтайп / Ферротипия 1860',
    category: 'Архив',
    adjustments: {
      temp: 8,
      tint: 4,
      exposure: -0.15,
      contrast: 32,
      highlights: 16,
      shadows: -34,
      whites: 12,
      blacks: -36,
      vibrance: -100,
      saturation: -100,
      clarity: 22,
      texture: 28,
      grain: 26,
      fade: 12,
      vignette: -45,
      colorGrading: {
        shadows: { hue: 35, sat: 14 },
        midtones: { hue: 40, sat: 8 },
        highlights: { hue: 45, sat: 12 },
        balance: -15,
      }
    }
  },
  {
    id: 'calotype_salt_1845',
    name: 'Калотипия (Соляная печать)',
    category: 'Архив',
    adjustments: {
      temp: 16,
      tint: 8,
      exposure: 0,
      contrast: 10,
      highlights: -18,
      shadows: 8,
      whites: -4,
      blacks: 14,
      vibrance: -100,
      saturation: -100,
      clarity: -8,
      texture: 14,
      grain: 22,
      fade: 16,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 28, sat: 38 },
        midtones: { hue: 32, sat: 28 },
        highlights: { hue: 36, sat: 22 },
        balance: 0,
      }
    }
  },
  {
    id: 'platinotype_1873',
    name: 'Платинотипия 1873',
    category: 'Архив',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 8,
      highlights: -14,
      shadows: 14,
      whites: 8,
      blacks: -8,
      vibrance: -100,
      saturation: -100,
      clarity: 12,
      texture: 16,
      grain: 4,
      fade: 4,
      sharpen: 10,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
        balance: 0,
      }
    }
  },
  {
    id: 'autochrome_lumiere_1907',
    name: 'Автохром Люмьер 1907',
    category: 'Архив',
    adjustments: {
      temp: 14,
      tint: -8,
      exposure: 0.1,
      contrast: -6,
      highlights: -24,
      shadows: 16,
      whites: 4,
      blacks: 10,
      vibrance: 16,
      saturation: -8,
      clarity: -12,
      texture: 18,
      grain: 36,
      fade: 14,
      colorGrading: {
        shadows: { hue: 95, sat: 20 },
        midtones: { hue: 42, sat: 16 },
        highlights: { hue: 35, sat: 24 },
        balance: 10,
      }
    }
  },
  {
    id: 'early_kodachrome_1935',
    name: 'Ранний Кодахром 1935',
    category: 'Архив',
    adjustments: {
      temp: 10,
      tint: 4,
      exposure: 0.05,
      contrast: 22,
      highlights: -18,
      shadows: -8,
      whites: 14,
      blacks: -12,
      vibrance: 28,
      saturation: 12,
      clarity: 14,
      texture: 12,
      grain: 14,
      colorGrading: {
        shadows: { hue: 215, sat: 14 },
        midtones: { hue: 20, sat: 10 },
        highlights: { hue: 45, sat: 18 },
        balance: 0,
      }
    }
  },
  {
    id: 'polaroid_sx70',
    name: 'Полароид SX-70 (1972)',
    category: 'Архив',
    adjustments: {
      temp: 6,
      tint: -4,
      exposure: 0.15,
      contrast: -8,
      highlights: -22,
      shadows: 18,
      whites: 6,
      blacks: 16,
      vibrance: 12,
      saturation: -6,
      clarity: -6,
      texture: 8,
      grain: 20,
      fade: 18,
      vignette: -12,
      colorGrading: {
        shadows: { hue: 175, sat: 22 },
        midtones: { hue: 55, sat: 10 },
        highlights: { hue: 45, sat: 16 },
        balance: 5,
      }
    }
  },
  {
    id: 'svema_soviet_1980',
    name: 'Советская Свема 1980',
    category: 'Архив',
    adjustments: {
      temp: -6,
      tint: 8,
      exposure: 0.05,
      contrast: 10,
      highlights: -16,
      shadows: 12,
      whites: 8,
      blacks: 6,
      vibrance: -8,
      saturation: -12,
      clarity: 6,
      texture: 10,
      grain: 26,
      fade: 12,
      colorGrading: {
        shadows: { hue: 225, sat: 18 },
        midtones: { hue: 110, sat: 8 },
        highlights: { hue: 55, sat: 14 },
        balance: -5,
      }
    }
  },
  {
    id: 'faded_album_1950',
    name: 'Семейный альбом 1950',
    category: 'Архив',
    adjustments: {
      temp: 16,
      tint: 4,
      exposure: 0.1,
      contrast: -16,
      highlights: -26,
      shadows: 22,
      whites: -8,
      blacks: 26,
      vibrance: -22,
      saturation: -20,
      clarity: -16,
      texture: 6,
      grain: 22,
      fade: 24,
      vignette: -16,
      curves: {
        rgb: [{ x: 0, y: 28 }, { x: 255, y: 235 }],
        red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
        blue: [{ x: 0, y: 16 }, { x: 255, y: 230 }],
      },
      colorGrading: {
        shadows: { hue: 42, sat: 24 },
        midtones: { hue: 48, sat: 12 },
        highlights: { hue: 52, sat: 20 },
        balance: 10,
      }
    }
  },
  {
    id: 'warm_vintage_archive',
    name: 'Тёплый архив',
    category: 'Архив',
    adjustments: {
      temp: 14,
      tint: -2,
      exposure: 0,
      contrast: -12,
      highlights: -24,
      shadows: 18,
      whites: -6,
      blacks: 22,
      vibrance: -10,
      saturation: -8,
      clarity: -10,
      grain: 18,
      fade: 14,
      colorGrading: {
        shadows: { hue: 42, sat: 16 },
        midtones: { hue: 45, sat: 8 },
        highlights: { hue: 50, sat: 18 },
        balance: 5,
      }
    }
  },

  // ==========================================
  // --- ПЛЁНКА (COLOR NEGATIVE FILM STOCKS) ---
  // ==========================================
  {
    id: 'portra_160',
    name: 'Kodak Portra 160',
    category: 'Плёнка',
    adjustments: {
      temp: 6,
      tint: 2,
      exposure: 0.18,
      contrast: -12,
      highlights: -22,
      shadows: 16,
      whites: 6,
      blacks: 2,
      vibrance: 10,
      saturation: -6,
      clarity: -8,
      texture: 2,
      grain: 8,
      fade: 6,
      sharpen: 8,
      colorGrading: {
        shadows: { hue: 35, sat: 8 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 40, sat: 8 },
        balance: 5,
      }
    }
  },
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
        balance: 0,
      }
    }
  },
  {
    id: 'portra_800',
    name: 'Kodak Portra 800',
    category: 'Плёнка',
    adjustments: {
      temp: 10,
      tint: 4,
      exposure: 0.1,
      contrast: 4,
      highlights: -14,
      shadows: 12,
      whites: 10,
      blacks: -8,
      vibrance: 16,
      saturation: 2,
      clarity: 4,
      texture: 8,
      grain: 22,
      fade: 8,
      colorGrading: {
        shadows: { hue: 38, sat: 12 },
        midtones: { hue: 42, sat: 6 },
        highlights: { hue: 45, sat: 14 },
        balance: 5,
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
        balance: 0,
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
      contrast: -2,
      highlights: -16,
      shadows: 16,
      whites: 8,
      blacks: 2,
      vibrance: 16,
      saturation: 4,
      clarity: -2,
      texture: 6,
      grain: 18,
      fade: 8,
      colorGrading: {
        shadows: { hue: 40, sat: 18 },
        midtones: { hue: 45, sat: 10 },
        highlights: { hue: 50, sat: 20 },
        balance: 10,
      }
    }
  },
  {
    id: 'kodak_ektar_100',
    name: 'Kodak Ektar 100',
    category: 'Плёнка',
    adjustments: {
      temp: 6,
      tint: 2,
      exposure: 0.1,
      contrast: 18,
      highlights: -16,
      shadows: 8,
      whites: 14,
      blacks: -12,
      vibrance: 24,
      saturation: 12,
      clarity: 14,
      texture: 16,
      sharpen: 14,
      grain: 4,
      colorGrading: {
        shadows: { hue: 35, sat: 10 },
        midtones: { hue: 42, sat: 6 },
        highlights: { hue: 50, sat: 14 },
        balance: 5,
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
        balance: 0,
      }
    }
  },
  {
    id: 'fuji_superia_400',
    name: 'Fujifilm Superia X-TRA 400',
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
        balance: 0,
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
        balance: 0,
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
      texture: 8,
      grain: 16,
      colorGrading: {
        shadows: { hue: 185, sat: 12 },
        midtones: { hue: 25, sat: 6 },
        highlights: { hue: 40, sat: 14 },
        balance: 0,
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
        balance: 0,
      }
    }
  },

  // ==========================================
  // --- СЛАЙД (COLOR REVERSAL SLIDE FILM) ---
  // ==========================================
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
        balance: 0,
      }
    }
  },
  {
    id: 'fuji_provia_100f',
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
      colorGrading: {
        shadows: { hue: 215, sat: 12 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
        balance: 0,
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
        balance: 0,
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
        balance: 0,
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
        balance: 0,
      }
    }
  },

  // ==========================================
  // --- МОНОХРОМ (BLACK & WHITE CHEMISTRY) ---
  // ==========================================
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
        balance: 0,
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
        balance: 0,
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
        balance: 0,
      }
    }
  },
  {
    id: 'ilford_pan_f',
    name: 'Ilford Pan F 50',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 28,
      highlights: -18,
      shadows: 8,
      whites: 16,
      blacks: -22,
      vibrance: -100,
      saturation: -100,
      clarity: 18,
      texture: 20,
      grain: 6,
      fade: 4,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
        balance: 0,
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
        balance: 0,
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
        balance: 0,
      }
    }
  },
  {
    id: 'sepia_darkroom',
    name: 'Классическая сепия',
    category: 'Монохром',
    adjustments: {
      temp: 20,
      tint: 10,
      exposure: 0,
      contrast: 16,
      highlights: -16,
      shadows: -8,
      whites: 10,
      blacks: -12,
      vibrance: -100,
      saturation: -100,
      clarity: 12,
      texture: 14,
      grain: 20,
      fade: 8,
      colorGrading: {
        shadows: { hue: 35, sat: 35 },
        midtones: { hue: 40, sat: 26 },
        highlights: { hue: 45, sat: 20 },
        balance: 0,
      }
    }
  },
  {
    id: 'selenium_toner',
    name: 'Селеновое вирирование',
    category: 'Монохром',
    adjustments: {
      temp: -4,
      tint: 6,
      exposure: 0.05,
      contrast: 26,
      highlights: -14,
      shadows: -14,
      whites: 16,
      blacks: -20,
      vibrance: -100,
      saturation: -100,
      clarity: 16,
      texture: 14,
      grain: 16,
      colorGrading: {
        shadows: { hue: 285, sat: 18 },
        midtones: { hue: 270, sat: 8 },
        highlights: { hue: 45, sat: 6 },
        balance: -10,
      }
    }
  },

  // ==========================================
  // --- АРТ (FINE ART & GALLERY AESTHETICS) ---
  // ==========================================
  {
    id: 'vermeer_light',
    name: 'Свет Вермеера (Северное окно)',
    category: 'Арт',
    adjustments: {
      temp: 6,
      tint: -2,
      exposure: 0.1,
      contrast: 14,
      highlights: -18,
      shadows: 12,
      whites: 14,
      blacks: -10,
      vibrance: 16,
      saturation: -2,
      clarity: 14,
      texture: 18,
      fade: 4,
      colorGrading: {
        shadows: { hue: 215, sat: 20 },
        midtones: { hue: 42, sat: 12 },
        highlights: { hue: 48, sat: 22 },
        balance: 5,
      }
    }
  },
  {
    id: 'rembrandt_chiaroscuro',
    name: 'Кьяроскуро Рембрандта',
    category: 'Арт',
    adjustments: {
      temp: 14,
      tint: -4,
      exposure: -0.2,
      contrast: 34,
      highlights: 22,
      shadows: -36,
      whites: 18,
      blacks: -32,
      vibrance: 8,
      saturation: -8,
      clarity: 22,
      texture: 18,
      vignette: -35,
      fade: 4,
      colorGrading: {
        shadows: { hue: 30, sat: 28 },
        midtones: { hue: 38, sat: 16 },
        highlights: { hue: 45, sat: 24 },
        balance: -25,
      }
    }
  },
  {
    id: 'monet_impressionism',
    name: 'Импрессионизм Моне',
    category: 'Арт',
    adjustments: {
      temp: 10,
      tint: 8,
      exposure: 0.15,
      contrast: -6,
      highlights: -20,
      shadows: 18,
      whites: 12,
      blacks: 6,
      vibrance: 26,
      saturation: 8,
      clarity: -10,
      texture: 14,
      grain: 12,
      colorGrading: {
        shadows: { hue: 265, sat: 18 },
        midtones: { hue: 60, sat: 14 },
        highlights: { hue: 45, sat: 22 },
        balance: 10,
      }
    }
  },
  {
    id: 'museum_white_cube',
    name: 'Белый куб (Галерея)',
    category: 'Арт',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.1,
      contrast: -2,
      highlights: -18,
      shadows: 14,
      whites: 12,
      blacks: -4,
      vibrance: 6,
      saturation: 0,
      clarity: 10,
      texture: 12,
      sharpen: 12,
      noiseReduction: 6,
      fade: 0,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 0, sat: 0 },
        balance: 0,
      }
    }
  },
  {
    id: 'golden_hour_nature',
    name: 'Золотой час',
    category: 'Арт',
    adjustments: {
      temp: 22,
      tint: 4,
      exposure: 0.18,
      contrast: -2,
      highlights: -20,
      shadows: 16,
      whites: 12,
      blacks: -6,
      vibrance: 18,
      saturation: 6,
      clarity: -4,
      texture: 10,
      colorGrading: {
        shadows: { hue: 38, sat: 18 },
        midtones: { hue: 42, sat: 12 },
        highlights: { hue: 46, sat: 28 },
        balance: 10,
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
        balance: 0,
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
        balance: 0,
      }
    }
  },
  {
    id: 'ethereal_glow',
    name: 'Мягкое свечение',
    category: 'Арт',
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
      texture: -8,
      fade: 10,
      colorGrading: {
        shadows: { hue: 280, sat: 8 },
        midtones: { hue: 0, sat: 0 },
        highlights: { hue: 45, sat: 20 },
        balance: 5,
      }
    }
  }
]
