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
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ПРЕСЕТЫ: КИНО ---
  // ==========================================
  {
    id: 'interstellar_70mm',
    name: 'Интерстеллар (IMAX 70mm)',
    category: 'Кино',
    adjustments: {
      temp: 8,
      tint: -4,
      exposure: -0.05,
      contrast: 24,
      highlights: -20,
      shadows: -14,
      whites: 12,
      blacks: -18,
      vibrance: -8,
      saturation: -12,
      clarity: 16,
      texture: 14,
      grain: 12,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 215, sat: 28 },
        midtones: { hue: 40, sat: 12 },
        highlights: { hue: 45, sat: 26 },
        balance: -10,
      }
    }
  },
  {
    id: 'mad_max_fury',
    name: 'Безумный Макс (Охра & Кобальт)',
    category: 'Кино',
    adjustments: {
      temp: 24,
      tint: -2,
      exposure: 0.1,
      contrast: 32,
      highlights: -18,
      shadows: -16,
      whites: 20,
      blacks: -22,
      vibrance: 36,
      saturation: 10,
      clarity: 28,
      texture: 24,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 210, sat: 42 },
        midtones: { hue: 32, sat: 22 },
        highlights: { hue: 35, sat: 46 },
        balance: -5,
      }
    }
  },
  {
    id: 'amelie_montmartre',
    name: 'Амели (Монмартр 2001)',
    category: 'Кино',
    adjustments: {
      temp: 20,
      tint: -12,
      exposure: 0.15,
      contrast: 14,
      highlights: -16,
      shadows: 18,
      whites: 10,
      blacks: -10,
      vibrance: 28,
      saturation: 8,
      clarity: 8,
      texture: 10,
      fade: 4,
      colorGrading: {
        shadows: { hue: 130, sat: 26 },
        midtones: { hue: 45, sat: 18 },
        highlights: { hue: 52, sat: 34 },
        balance: 5,
      }
    }
  },
  {
    id: 'joker_gotham',
    name: 'Джокер (Готэм 80-х)',
    category: 'Кино',
    adjustments: {
      temp: -4,
      tint: -14,
      exposure: -0.15,
      contrast: 28,
      highlights: -24,
      shadows: -18,
      whites: 6,
      blacks: -24,
      vibrance: 12,
      saturation: -14,
      clarity: 22,
      texture: 20,
      grain: 26,
      vignette: -25,
      colorGrading: {
        shadows: { hue: 175, sat: 32 },
        midtones: { hue: 36, sat: 16 },
        highlights: { hue: 42, sat: 30 },
        balance: -15,
      }
    }
  },
  {
    id: 'kill_bill_cinema',
    name: 'Убить Билла (Тарантино)',
    category: 'Кино',
    adjustments: {
      temp: 10,
      tint: 4,
      exposure: 0.05,
      contrast: 26,
      highlights: -12,
      shadows: -12,
      whites: 16,
      blacks: -14,
      vibrance: 32,
      saturation: 16,
      clarity: 18,
      texture: 16,
      grain: 10,
      colorGrading: {
        shadows: { hue: 10, sat: 22 },
        midtones: { hue: 45, sat: 14 },
        highlights: { hue: 50, sat: 28 },
        balance: 0,
      }
    }
  },
  {
    id: 'neon_demon_glam',
    name: 'Неоновый демон (Эйсид Глэм)',
    category: 'Кино',
    adjustments: {
      temp: -6,
      tint: 28,
      exposure: 0.1,
      contrast: 34,
      highlights: -10,
      shadows: -22,
      whites: 22,
      blacks: -26,
      vibrance: 40,
      saturation: 18,
      clarity: 24,
      texture: 18,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 195, sat: 44 },
        midtones: { hue: 310, sat: 24 },
        highlights: { hue: 325, sat: 38 },
        balance: -8,
      }
    }
  },
  {
    id: 'lalaland_twilight',
    name: 'Ла-Ла Ленд (Сумерки в LA)',
    category: 'Кино',
    adjustments: {
      temp: -12,
      tint: 22,
      exposure: 0.08,
      contrast: 16,
      highlights: -22,
      shadows: 14,
      whites: 12,
      blacks: -12,
      vibrance: 30,
      saturation: 6,
      clarity: -6,
      texture: 8,
      fade: 6,
      colorGrading: {
        shadows: { hue: 260, sat: 34 },
        midtones: { hue: 330, sat: 16 },
        highlights: { hue: 42, sat: 30 },
        balance: -5,
      }
    }
  },
  {
    id: 'oldboy_noir',
    name: 'Олдбой (Корейский нео-нуар)',
    category: 'Кино',
    adjustments: {
      temp: -8,
      tint: -16,
      exposure: -0.2,
      contrast: 30,
      highlights: -26,
      shadows: -20,
      whites: 8,
      blacks: -28,
      vibrance: 8,
      saturation: -22,
      clarity: 26,
      texture: 22,
      grain: 24,
      vignette: -28,
      colorGrading: {
        shadows: { hue: 155, sat: 28 },
        midtones: { hue: 190, sat: 14 },
        highlights: { hue: 55, sat: 22 },
        balance: -18,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ПРЕСЕТЫ: АРХИВ ---
  // ==========================================
  {
    id: 'chrysotype_1842',
    name: 'Хризотипия (Печать золотом 1842)',
    category: 'Архив',
    adjustments: {
      temp: 14,
      tint: 18,
      exposure: 0.12,
      contrast: 8,
      highlights: -24,
      shadows: 18,
      whites: 6,
      blacks: -10,
      vibrance: -18,
      saturation: -42,
      clarity: 6,
      texture: 14,
      grain: 16,
      fade: 12,
      vignette: -16,
      colorGrading: {
        shadows: { hue: 285, sat: 32 },
        midtones: { hue: 310, sat: 18 },
        highlights: { hue: 44, sat: 24 },
        balance: 5,
      }
    }
  },
  {
    id: 'vandyke_brown_1889',
    name: 'Вандейк коричневый (1889)',
    category: 'Архив',
    adjustments: {
      temp: 26,
      tint: 8,
      exposure: 0.05,
      contrast: 16,
      highlights: -28,
      shadows: 12,
      whites: 4,
      blacks: -16,
      vibrance: -12,
      saturation: -46,
      clarity: 10,
      texture: 18,
      grain: 22,
      fade: 10,
      vignette: -22,
      colorGrading: {
        shadows: { hue: 28, sat: 40 },
        midtones: { hue: 34, sat: 24 },
        highlights: { hue: 42, sat: 20 },
        balance: -10,
      }
    }
  },
  {
    id: 'orotone_gold_1900',
    name: 'Оротон (Золото на стекле 1900)',
    category: 'Архив',
    adjustments: {
      temp: 34,
      tint: 6,
      exposure: 0.18,
      contrast: 22,
      highlights: -18,
      shadows: 8,
      whites: 16,
      blacks: -14,
      vibrance: 14,
      saturation: -16,
      clarity: 14,
      texture: 16,
      grain: 14,
      fade: 8,
      vignette: -28,
      colorGrading: {
        shadows: { hue: 35, sat: 48 },
        midtones: { hue: 42, sat: 38 },
        highlights: { hue: 48, sat: 54 },
        balance: 0,
      }
    }
  },
  {
    id: 'cibachrome_1963',
    name: 'Сибахром (Ilfochrome 1963)',
    category: 'Архив',
    adjustments: {
      temp: 4,
      tint: 2,
      exposure: 0.08,
      contrast: 32,
      highlights: -14,
      shadows: -16,
      whites: 18,
      blacks: -20,
      vibrance: 34,
      saturation: 16,
      clarity: 26,
      texture: 22,
      grain: 6,
      vignette: -12,
      colorGrading: {
        shadows: { hue: 215, sat: 24 },
        midtones: { hue: 35, sat: 12 },
        highlights: { hue: 50, sat: 18 },
        balance: 0,
      }
    }
  },
  {
    id: 'calotype_talbot_1841',
    name: 'Тальботипия (Калотипия 1841)',
    category: 'Архив',
    adjustments: {
      temp: 18,
      tint: 12,
      exposure: -0.05,
      contrast: 4,
      highlights: -32,
      shadows: 24,
      whites: 2,
      blacks: 6,
      vibrance: -30,
      saturation: -60,
      clarity: -12,
      texture: 24,
      grain: 32,
      fade: 18,
      vignette: -26,
      colorGrading: {
        shadows: { hue: 22, sat: 34 },
        midtones: { hue: 30, sat: 20 },
        highlights: { hue: 38, sat: 18 },
        balance: 8,
      }
    }
  },
  {
    id: 'ambrotype_blackglass_1855',
    name: 'Амбротип на чёрном стекле (1855)',
    category: 'Архив',
    adjustments: {
      temp: 6,
      tint: -2,
      exposure: -0.1,
      contrast: 28,
      highlights: -20,
      shadows: -24,
      whites: 14,
      blacks: -32,
      vibrance: -45,
      saturation: -80,
      clarity: 18,
      texture: 22,
      grain: 28,
      fade: 6,
      vignette: -34,
      colorGrading: {
        shadows: { hue: 210, sat: 14 },
        midtones: { hue: 35, sat: 8 },
        highlights: { hue: 45, sat: 16 },
        balance: -12,
      }
    }
  },
  {
    id: 'vintage_postcard_1900',
    name: 'Винтажная открытка (1900)',
    category: 'Архив',
    adjustments: {
      temp: 22,
      tint: 8,
      exposure: 0.16,
      contrast: -8,
      highlights: -26,
      shadows: 20,
      whites: 6,
      blacks: 10,
      vibrance: 12,
      saturation: -18,
      clarity: -4,
      texture: 12,
      grain: 18,
      fade: 14,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 34, sat: 28 },
        midtones: { hue: 44, sat: 18 },
        highlights: { hue: 48, sat: 24 },
        balance: 6,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ПРЕСЕТЫ: ПЛЁНКА ---
  // ==========================================
  {
    id: 'kodak_royal_gold_400',
    name: 'Kodak Royal Gold 400',
    category: 'Плёнка',
    adjustments: {
      temp: 14,
      tint: 4,
      exposure: 0.08,
      contrast: 18,
      highlights: -18,
      shadows: 8,
      whites: 12,
      blacks: -14,
      vibrance: 22,
      saturation: 8,
      clarity: 12,
      texture: 14,
      grain: 18,
      vignette: -12,
      colorGrading: {
        shadows: { hue: 25, sat: 24 },
        midtones: { hue: 42, sat: 16 },
        highlights: { hue: 46, sat: 26 },
        balance: 2,
      }
    }
  },
  {
    id: 'fuji_natura_1600',
    name: 'Fuji Natura 1600',
    category: 'Плёнка',
    adjustments: {
      temp: -4,
      tint: 10,
      exposure: 0.22,
      contrast: -6,
      highlights: -24,
      shadows: 24,
      whites: 10,
      blacks: 6,
      vibrance: 18,
      saturation: -8,
      clarity: -6,
      texture: 8,
      grain: 32,
      fade: 10,
      colorGrading: {
        shadows: { hue: 250, sat: 18 },
        midtones: { hue: 140, sat: 12 },
        highlights: { hue: 40, sat: 14 },
        balance: 4,
      }
    }
  },
  {
    id: 'kodak_pro_image_100',
    name: 'Kodak Pro Image 100',
    category: 'Плёнка',
    adjustments: {
      temp: 12,
      tint: 2,
      exposure: 0.04,
      contrast: 14,
      highlights: -16,
      shadows: 10,
      whites: 8,
      blacks: -12,
      vibrance: 16,
      saturation: 4,
      clarity: 10,
      texture: 12,
      grain: 12,
      colorGrading: {
        shadows: { hue: 32, sat: 18 },
        midtones: { hue: 40, sat: 10 },
        highlights: { hue: 48, sat: 18 },
        balance: 0,
      }
    }
  },
  {
    id: 'cinestill_400d',
    name: 'CineStill 400D Daylight',
    category: 'Плёнка',
    adjustments: {
      temp: 6,
      tint: 4,
      exposure: 0.1,
      contrast: 20,
      highlights: -14,
      shadows: -8,
      whites: 16,
      blacks: -14,
      vibrance: 24,
      saturation: 8,
      clarity: 16,
      texture: 14,
      grain: 18,
      vignette: -14,
      colorGrading: {
        shadows: { hue: 195, sat: 22 },
        midtones: { hue: 35, sat: 14 },
        highlights: { hue: 22, sat: 28 },
        balance: -4,
      }
    }
  },
  {
    id: 'kodak_ultramax_400',
    name: 'Kodak UltraMax 400',
    category: 'Плёнка',
    adjustments: {
      temp: 10,
      tint: -2,
      exposure: 0.05,
      contrast: 22,
      highlights: -12,
      shadows: -10,
      whites: 14,
      blacks: -16,
      vibrance: 28,
      saturation: 14,
      clarity: 16,
      texture: 16,
      grain: 20,
      colorGrading: {
        shadows: { hue: 215, sat: 26 },
        midtones: { hue: 44, sat: 16 },
        highlights: { hue: 52, sat: 24 },
        balance: -6,
      }
    }
  },
  {
    id: 'ferrania_solaris_200',
    name: 'Ferrania Solaris 200',
    category: 'Плёнка',
    adjustments: {
      temp: 18,
      tint: 6,
      exposure: 0.12,
      contrast: 16,
      highlights: -20,
      shadows: 14,
      whites: 8,
      blacks: -10,
      vibrance: 20,
      saturation: 6,
      clarity: 12,
      texture: 14,
      grain: 16,
      fade: 6,
      colorGrading: {
        shadows: { hue: 30, sat: 26 },
        midtones: { hue: 38, sat: 14 },
        highlights: { hue: 44, sat: 24 },
        balance: 2,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ПРЕСЕТЫ: СЛАЙД ---
  // ==========================================
  {
    id: 'agfachrome_50s',
    name: 'Agfachrome 50S (Теплый немецкий слайд)',
    category: 'Слайд',
    adjustments: {
      temp: 14,
      tint: 2,
      exposure: 0.05,
      contrast: 24,
      highlights: -18,
      shadows: -12,
      whites: 14,
      blacks: -16,
      vibrance: 22,
      saturation: 6,
      clarity: 18,
      texture: 16,
      grain: 10,
      vignette: -14,
      colorGrading: {
        shadows: { hue: 135, sat: 18 },
        midtones: { hue: 42, sat: 16 },
        highlights: { hue: 48, sat: 24 },
        balance: -2,
      }
    }
  },
  {
    id: 'kodachrome_25',
    name: 'Kodachrome 25 (Легендарная резкость)',
    category: 'Слайд',
    adjustments: {
      temp: 8,
      tint: -2,
      exposure: -0.05,
      contrast: 30,
      highlights: -22,
      shadows: -18,
      whites: 16,
      blacks: -22,
      vibrance: 28,
      saturation: 12,
      clarity: 28,
      texture: 24,
      grain: 4,
      vignette: -16,
      colorGrading: {
        shadows: { hue: 220, sat: 22 },
        midtones: { hue: 38, sat: 14 },
        highlights: { hue: 46, sat: 28 },
        balance: -8,
      }
    }
  },
  {
    id: 'fuji_astia_100f',
    name: 'Fuji Astia 100F (Мягкий портрет)',
    category: 'Слайд',
    adjustments: {
      temp: 2,
      tint: 4,
      exposure: 0.1,
      contrast: 12,
      highlights: -20,
      shadows: 14,
      whites: 10,
      blacks: -8,
      vibrance: 16,
      saturation: -2,
      clarity: 8,
      texture: 10,
      grain: 6,
      colorGrading: {
        shadows: { hue: 200, sat: 12 },
        midtones: { hue: 35, sat: 8 },
        highlights: { hue: 42, sat: 14 },
        balance: 0,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ПРЕСЕТЫ: МОНОХРОМ ---
  // ==========================================
  {
    id: 'agfa_apx_100',
    name: 'Agfa APX 100 (Европейское серебро)',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 26,
      highlights: -18,
      shadows: -14,
      whites: 18,
      blacks: -20,
      vibrance: -100,
      saturation: -100,
      clarity: 20,
      texture: 18,
      grain: 18,
      vignette: -12,
    }
  },
  {
    id: 'kodak_tmax_100',
    name: 'Kodak T-Max 100 (Табулярное зерно)',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0,
      contrast: 22,
      highlights: -24,
      shadows: -12,
      whites: 14,
      blacks: -18,
      vibrance: -100,
      saturation: -100,
      clarity: 24,
      texture: 22,
      grain: 8,
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ПРЕСЕТЫ: АРТ ---
  // ==========================================
  {
    id: 'caravaggio_tenebrism',
    name: 'Караваджо (Тенебризм)',
    category: 'Арт',
    adjustments: {
      temp: 16,
      tint: 4,
      exposure: -0.25,
      contrast: 38,
      highlights: 14,
      shadows: -42,
      whites: 20,
      blacks: -46,
      vibrance: 12,
      saturation: -8,
      clarity: 26,
      texture: 24,
      grain: 12,
      vignette: -36,
      colorGrading: {
        shadows: { hue: 25, sat: 28 },
        midtones: { hue: 38, sat: 22 },
        highlights: { hue: 45, sat: 36 },
        balance: -20,
      }
    }
  },
  {
    id: 'preraphaelite_palette',
    name: 'Прерафаэлиты (Милле и Россетти)',
    category: 'Арт',
    adjustments: {
      temp: 8,
      tint: 14,
      exposure: 0.1,
      contrast: 18,
      highlights: -18,
      shadows: 12,
      whites: 14,
      blacks: -14,
      vibrance: 32,
      saturation: 12,
      clarity: 16,
      texture: 18,
      fade: 4,
      colorGrading: {
        shadows: { hue: 145, sat: 26 },
        midtones: { hue: 18, sat: 16 },
        highlights: { hue: 42, sat: 26 },
        balance: 2,
      }
    }
  },
  {
    id: 'degas_pastel',
    name: 'Пастель Эдгара Дега',
    category: 'Арт',
    adjustments: {
      temp: 10,
      tint: 12,
      exposure: 0.22,
      contrast: -14,
      highlights: -26,
      shadows: 26,
      whites: 8,
      blacks: 12,
      vibrance: 18,
      saturation: -10,
      clarity: -16,
      texture: -6,
      grain: 20,
      fade: 14,
      colorGrading: {
        shadows: { hue: 275, sat: 18 },
        midtones: { hue: 28, sat: 14 },
        highlights: { hue: 38, sat: 20 },
        balance: 8,
      }
    }
  },
  {
    id: 'van_eyck_flemish',
    name: 'Северный ренессанс (Ван Эйк)',
    category: 'Арт',
    adjustments: {
      temp: 14,
      tint: -4,
      exposure: 0.05,
      contrast: 24,
      highlights: -16,
      shadows: -14,
      whites: 16,
      blacks: -18,
      vibrance: 24,
      saturation: 6,
      clarity: 28,
      texture: 30,
      grain: 8,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 210, sat: 24 },
        midtones: { hue: 38, sat: 18 },
        highlights: { hue: 46, sat: 30 },
        balance: -5,
      }
    }
  }

,

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ШЕДЕВРЫ: КИНО ---
  // ==========================================
  {
    id: 'grand_budapest_hotel',
    name: 'Гранд Будапешт (Розовый зефир)',
    category: 'Кино',
    adjustments: {
      temp: 12,
      tint: 20,
      exposure: 0.16,
      contrast: -8,
      highlights: -22,
      shadows: 18,
      whites: 12,
      blacks: 6,
      vibrance: 26,
      saturation: 4,
      clarity: -6,
      texture: 8,
      fade: 8,
      colorGrading: {
        shadows: { hue: 195, sat: 22 },
        midtones: { hue: 335, sat: 20 },
        highlights: { hue: 348, sat: 28 },
        balance: 6,
      }
    }
  },
  {
    id: 'blade_runner_1982',
    name: 'Бегущий по лезвию 1982',
    category: 'Кино',
    adjustments: {
      temp: -10,
      tint: -6,
      exposure: -0.15,
      contrast: 32,
      highlights: -18,
      shadows: -22,
      whites: 16,
      blacks: -28,
      vibrance: 28,
      saturation: 6,
      clarity: 22,
      texture: 18,
      grain: 22,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 195, sat: 42 },
        midtones: { hue: 215, sat: 18 },
        highlights: { hue: 42, sat: 34 },
        balance: -12,
      }
    }
  },
  {
    id: 'mulholland_drive',
    name: 'Малхолланд Драйв (Линч)',
    category: 'Кино',
    adjustments: {
      temp: 14,
      tint: 16,
      exposure: 0.12,
      contrast: 10,
      highlights: -26,
      shadows: 16,
      whites: 14,
      blacks: -12,
      vibrance: 22,
      saturation: 2,
      clarity: -14,
      texture: 10,
      fade: 10,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 285, sat: 28 },
        midtones: { hue: 320, sat: 14 },
        highlights: { hue: 40, sat: 24 },
        balance: 2,
      }
    }
  },
  {
    id: 'taxi_driver_1976',
    name: 'Таксист (Скорсезе 1976)',
    category: 'Кино',
    adjustments: {
      temp: 16,
      tint: -8,
      exposure: -0.1,
      contrast: 26,
      highlights: -16,
      shadows: -14,
      whites: 12,
      blacks: -18,
      vibrance: 24,
      saturation: 12,
      clarity: 18,
      texture: 20,
      grain: 28,
      vignette: -22,
      colorGrading: {
        shadows: { hue: 160, sat: 24 },
        midtones: { hue: 44, sat: 20 },
        highlights: { hue: 12, sat: 32 },
        balance: -8,
      }
    }
  },
  {
    id: 'akira_neo_tokyo',
    name: 'Акира (Нео-Токио 1988)',
    category: 'Кино',
    adjustments: {
      temp: -2,
      tint: 18,
      exposure: 0.08,
      contrast: 36,
      highlights: -10,
      shadows: -18,
      whites: 24,
      blacks: -22,
      vibrance: 38,
      saturation: 22,
      clarity: 24,
      texture: 18,
      colorGrading: {
        shadows: { hue: 210, sat: 38 },
        midtones: { hue: 345, sat: 26 },
        highlights: { hue: 10, sat: 42 },
        balance: -4,
      }
    }
  },
  {
    id: 'barry_lyndon_candle',
    name: 'Барри Линдон (При свечах)',
    category: 'Кино',
    adjustments: {
      temp: 26,
      tint: 4,
      exposure: 0.18,
      contrast: 8,
      highlights: -24,
      shadows: 14,
      whites: 10,
      blacks: -14,
      vibrance: 16,
      saturation: -4,
      clarity: -8,
      texture: 12,
      fade: 6,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 30, sat: 34 },
        midtones: { hue: 38, sat: 24 },
        highlights: { hue: 44, sat: 40 },
        balance: 4,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ШЕДЕВРЫ: АРХИВ ---
  // ==========================================
  {
    id: 'heliography_niepce_1826',
    name: 'Гелиография Ньепса (1826)',
    category: 'Архив',
    adjustments: {
      temp: -2,
      tint: -2,
      exposure: -0.15,
      contrast: 22,
      highlights: -34,
      shadows: -20,
      whites: 4,
      blacks: -26,
      vibrance: -80,
      saturation: -95,
      clarity: 20,
      texture: 28,
      grain: 34,
      fade: 8,
      vignette: -32,
      colorGrading: {
        shadows: { hue: 210, sat: 10 },
        midtones: { hue: 200, sat: 6 },
        highlights: { hue: 50, sat: 8 },
        balance: -10,
      }
    }
  },
  {
    id: 'woodburytype_1864',
    name: 'Вудберитипия (1864)',
    category: 'Архив',
    adjustments: {
      temp: 18,
      tint: 8,
      exposure: 0.08,
      contrast: 20,
      highlights: -22,
      shadows: 8,
      whites: 10,
      blacks: -18,
      vibrance: -22,
      saturation: -48,
      clarity: 14,
      texture: 16,
      grain: 12,
      fade: 6,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 26, sat: 38 },
        midtones: { hue: 32, sat: 22 },
        highlights: { hue: 40, sat: 20 },
        balance: -4,
      }
    }
  },
  {
    id: 'bromoil_1907',
    name: 'Бромойль (Масляный пигмент 1907)',
    category: 'Архив',
    adjustments: {
      temp: 8,
      tint: 4,
      exposure: 0.02,
      contrast: 14,
      highlights: -28,
      shadows: 14,
      whites: 6,
      blacks: -14,
      vibrance: -55,
      saturation: -75,
      clarity: 10,
      texture: 32,
      grain: 30,
      fade: 12,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 35, sat: 20 },
        midtones: { hue: 40, sat: 12 },
        highlights: { hue: 45, sat: 16 },
        balance: 0,
      }
    }
  },
  {
    id: 'gum_bichromate_1858',
    name: 'Гуммиарабиковая печать (1858)',
    category: 'Архив',
    adjustments: {
      temp: 24,
      tint: 14,
      exposure: 0.12,
      contrast: 6,
      highlights: -26,
      shadows: 20,
      whites: 8,
      blacks: 6,
      vibrance: 8,
      saturation: -24,
      clarity: -10,
      texture: 22,
      grain: 24,
      fade: 16,
      vignette: -22,
      colorGrading: {
        shadows: { hue: 18, sat: 34 },
        midtones: { hue: 28, sat: 22 },
        highlights: { hue: 42, sat: 26 },
        balance: 4,
      }
    }
  },
  {
    id: 'victorian_stereo_1890',
    name: 'Стереофотография Victorian (1890)',
    category: 'Архив',
    adjustments: {
      temp: 20,
      tint: 6,
      exposure: 0.06,
      contrast: 18,
      highlights: -24,
      shadows: 10,
      whites: 8,
      blacks: -12,
      vibrance: -18,
      saturation: -42,
      clarity: 12,
      texture: 20,
      grain: 20,
      fade: 10,
      vignette: -26,
      colorGrading: {
        shadows: { hue: 30, sat: 32 },
        midtones: { hue: 38, sat: 20 },
        highlights: { hue: 45, sat: 22 },
        balance: -2,
      }
    }
  },
  {
    id: 'svema_slide_1975',
    name: 'Советский диапозитив (Свема ЦО-32Д)',
    category: 'Архив',
    adjustments: {
      temp: 18,
      tint: -8,
      exposure: 0.05,
      contrast: 22,
      highlights: -20,
      shadows: -10,
      whites: 12,
      blacks: -14,
      vibrance: 16,
      saturation: 4,
      clarity: 14,
      texture: 16,
      grain: 24,
      fade: 6,
      colorGrading: {
        shadows: { hue: 170, sat: 20 },
        midtones: { hue: 48, sat: 22 },
        highlights: { hue: 52, sat: 32 },
        balance: 2,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ШЕДЕВРЫ: ПЛЁНКА ---
  // ==========================================
  {
    id: 'kodak_trix_320',
    name: 'Kodak Tri-X 320 (TXP Студийная)',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.08,
      contrast: 28,
      highlights: -14,
      shadows: -16,
      whites: 20,
      blacks: -22,
      vibrance: -100,
      saturation: -100,
      clarity: 22,
      texture: 20,
      grain: 16,
      vignette: -10,
    }
  },
  {
    id: 'fuji_neopan_400',
    name: 'Fuji Neopan 400 Presto',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: -0.05,
      contrast: 34,
      highlights: -22,
      shadows: -22,
      whites: 16,
      blacks: -26,
      vibrance: -100,
      saturation: -100,
      clarity: 26,
      texture: 24,
      grain: 20,
      vignette: -14,
    }
  },
  {
    id: 'kodak_plus_x_125',
    name: 'Kodak Plus-X 125 Pan',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.04,
      contrast: 20,
      highlights: -20,
      shadows: 8,
      whites: 14,
      blacks: -14,
      vibrance: -100,
      saturation: -100,
      clarity: 16,
      texture: 18,
      grain: 10,
    }
  },
  {
    id: 'cinestill_50d_daylight',
    name: 'CineStill 50D Дневной свет',
    category: 'Плёнка',
    adjustments: {
      temp: 4,
      tint: 2,
      exposure: 0.06,
      contrast: 18,
      highlights: -16,
      shadows: 6,
      whites: 14,
      blacks: -12,
      vibrance: 22,
      saturation: 8,
      clarity: 16,
      texture: 14,
      grain: 8,
      colorGrading: {
        shadows: { hue: 205, sat: 18 },
        midtones: { hue: 38, sat: 12 },
        highlights: { hue: 42, sat: 22 },
        balance: -2,
      }
    }
  },
  {
    id: 'lomography_metropolis',
    name: 'Lomography Metropolis XR',
    category: 'Плёнка',
    adjustments: {
      temp: -12,
      tint: -8,
      exposure: -0.08,
      contrast: 30,
      highlights: -18,
      shadows: -16,
      whites: 12,
      blacks: -22,
      vibrance: -16,
      saturation: -34,
      clarity: 24,
      texture: 22,
      grain: 22,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 180, sat: 28 },
        midtones: { hue: 210, sat: 14 },
        highlights: { hue: 46, sat: 18 },
        balance: -10,
      }
    }
  },
  {
    id: 'konica_centuria_400',
    name: 'Konica Centuria 400',
    category: 'Плёнка',
    adjustments: {
      temp: 14,
      tint: 8,
      exposure: 0.1,
      contrast: 16,
      highlights: -18,
      shadows: 12,
      whites: 10,
      blacks: -10,
      vibrance: 24,
      saturation: 8,
      clarity: 12,
      texture: 14,
      grain: 18,
      colorGrading: {
        shadows: { hue: 24, sat: 22 },
        midtones: { hue: 330, sat: 12 },
        highlights: { hue: 44, sat: 22 },
        balance: 2,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ШЕДЕВРЫ: СЛАЙД ---
  // ==========================================
  {
    id: 'fujichrome_sensia_100',
    name: 'Fujichrome Sensia 100',
    category: 'Слайд',
    adjustments: {
      temp: 2,
      tint: 2,
      exposure: 0.04,
      contrast: 20,
      highlights: -16,
      shadows: -8,
      whites: 14,
      blacks: -14,
      vibrance: 20,
      saturation: 6,
      clarity: 16,
      texture: 14,
      grain: 6,
      colorGrading: {
        shadows: { hue: 210, sat: 14 },
        midtones: { hue: 40, sat: 10 },
        highlights: { hue: 46, sat: 16 },
        balance: 0,
      }
    }
  },
  {
    id: 'kodak_elite_chrome_ebx',
    name: 'Kodak Elite Chrome Extra Color',
    category: 'Слайд',
    adjustments: {
      temp: 8,
      tint: 2,
      exposure: 0.06,
      contrast: 32,
      highlights: -16,
      shadows: -16,
      whites: 20,
      blacks: -24,
      vibrance: 36,
      saturation: 22,
      clarity: 24,
      texture: 20,
      grain: 8,
      vignette: -14,
      colorGrading: {
        shadows: { hue: 220, sat: 30 },
        midtones: { hue: 35, sat: 18 },
        highlights: { hue: 42, sat: 32 },
        balance: -4,
      }
    }
  },
  {
    id: 'agfachrome_rsx_ii',
    name: 'Agfachrome RSX II 100',
    category: 'Слайд',
    adjustments: {
      temp: 16,
      tint: -2,
      exposure: 0.05,
      contrast: 22,
      highlights: -20,
      shadows: -10,
      whites: 12,
      blacks: -16,
      vibrance: 24,
      saturation: 8,
      clarity: 18,
      texture: 16,
      grain: 10,
      colorGrading: {
        shadows: { hue: 140, sat: 20 },
        midtones: { hue: 38, sat: 16 },
        highlights: { hue: 46, sat: 26 },
        balance: 0,
      }
    }
  },
  {
    id: 'scotch_chrome_1000',
    name: 'Scotch Chrome 1000 (Зернистый)',
    category: 'Слайд',
    adjustments: {
      temp: 10,
      tint: 12,
      exposure: 0.14,
      contrast: 10,
      highlights: -24,
      shadows: 18,
      whites: 10,
      blacks: -8,
      vibrance: 18,
      saturation: -4,
      clarity: -6,
      texture: 12,
      grain: 34,
      fade: 8,
      colorGrading: {
        shadows: { hue: 270, sat: 18 },
        midtones: { hue: 35, sat: 12 },
        highlights: { hue: 44, sat: 20 },
        balance: 4,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ШЕДЕВРЫ: МОНОХРОМ ---
  // ==========================================
  {
    id: 'ilford_xp2_super',
    name: 'Ilford XP2 Super 400 (Хромогенный)',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.1,
      contrast: 18,
      highlights: -22,
      shadows: 12,
      whites: 12,
      blacks: -14,
      vibrance: -100,
      saturation: -100,
      clarity: 14,
      texture: 12,
      grain: 4,
    }
  },
  {
    id: 'fomapan_retropan_320',
    name: 'Fomapan Retropan 320 Soft',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.14,
      contrast: -6,
      highlights: -28,
      shadows: 24,
      whites: 8,
      blacks: 4,
      vibrance: -100,
      saturation: -100,
      clarity: -8,
      texture: 14,
      grain: 26,
      fade: 10,
    }
  },
  {
    id: 'gold_toning_archival',
    name: 'Золотой вираж (Gold Toning)',
    category: 'Монохром',
    adjustments: {
      temp: -4,
      tint: 8,
      exposure: 0.05,
      contrast: 24,
      highlights: -16,
      shadows: -14,
      whites: 16,
      blacks: -18,
      vibrance: -90,
      saturation: -90,
      clarity: 18,
      texture: 16,
      grain: 12,
      colorGrading: {
        shadows: { hue: 280, sat: 22 },
        midtones: { hue: 240, sat: 8 },
        highlights: { hue: 45, sat: 10 },
        balance: -8,
      }
    }
  },
  {
    id: 'pure_palladium_print',
    name: 'Палладиевый отпечаток',
    category: 'Монохром',
    adjustments: {
      temp: 14,
      tint: 6,
      exposure: 0.06,
      contrast: 12,
      highlights: -26,
      shadows: 14,
      whites: 8,
      blacks: -12,
      vibrance: -75,
      saturation: -75,
      clarity: 12,
      texture: 16,
      grain: 16,
      fade: 8,
      colorGrading: {
        shadows: { hue: 32, sat: 24 },
        midtones: { hue: 38, sat: 16 },
        highlights: { hue: 44, sat: 18 },
        balance: 0,
      }
    }
  },

  // ==========================================
  // --- ДОПОЛНИТЕЛЬНЫЕ ШЕДЕВРЫ: АРТ ---
  // ==========================================
  {
    id: 'klimt_golden_phase',
    name: 'Густав Климт (Золотой период)',
    category: 'Арт',
    adjustments: {
      temp: 28,
      tint: 4,
      exposure: 0.16,
      contrast: 24,
      highlights: -14,
      shadows: -6,
      whites: 20,
      blacks: -16,
      vibrance: 32,
      saturation: 16,
      clarity: 22,
      texture: 26,
      grain: 10,
      colorGrading: {
        shadows: { hue: 30, sat: 36 },
        midtones: { hue: 40, sat: 32 },
        highlights: { hue: 48, sat: 48 },
        balance: 4,
      }
    }
  },
  {
    id: 'caspar_david_friedrich',
    name: 'Каспар Давид Фридрих (Романтизм)',
    category: 'Арт',
    adjustments: {
      temp: -8,
      tint: 4,
      exposure: -0.1,
      contrast: 22,
      highlights: -24,
      shadows: -18,
      whites: 10,
      blacks: -20,
      vibrance: 12,
      saturation: -12,
      clarity: 16,
      texture: 18,
      grain: 16,
      fade: 8,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 215, sat: 32 },
        midtones: { hue: 200, sat: 16 },
        highlights: { hue: 38, sat: 28 },
        balance: -10,
      }
    }
  },
  {
    id: 'monet_waterlilies',
    name: 'Клод Моне (Кувшинки в Живерни)',
    category: 'Арт',
    adjustments: {
      temp: -4,
      tint: 16,
      exposure: 0.18,
      contrast: -6,
      highlights: -22,
      shadows: 18,
      whites: 12,
      blacks: -6,
      vibrance: 34,
      saturation: 10,
      clarity: -12,
      texture: 14,
      fade: 6,
      colorGrading: {
        shadows: { hue: 250, sat: 28 },
        midtones: { hue: 165, sat: 22 },
        highlights: { hue: 42, sat: 22 },
        balance: 2,
      }
    }
  },
  {
    id: 'gauguin_tahiti',
    name: 'Поль Гоген (Таити)',
    category: 'Арт',
    adjustments: {
      temp: 20,
      tint: 10,
      exposure: 0.1,
      contrast: 26,
      highlights: -12,
      shadows: -10,
      whites: 16,
      blacks: -14,
      vibrance: 38,
      saturation: 24,
      clarity: 20,
      texture: 22,
      colorGrading: {
        shadows: { hue: 220, sat: 32 },
        midtones: { hue: 25, sat: 26 },
        highlights: { hue: 46, sat: 40 },
        balance: 2,
      }
    }
  },
  {
    id: 'botticelli_venus',
    name: 'Сандро Боттичелли (Рождение Венеры)',
    category: 'Арт',
    adjustments: {
      temp: 6,
      tint: 12,
      exposure: 0.15,
      contrast: 10,
      highlights: -20,
      shadows: 16,
      whites: 12,
      blacks: -8,
      vibrance: 22,
      saturation: -2,
      clarity: 8,
      texture: 12,
      fade: 4,
      colorGrading: {
        shadows: { hue: 175, sat: 22 },
        midtones: { hue: 345, sat: 14 },
        highlights: { hue: 44, sat: 24 },
        balance: 0,
      }
    }
  }

,

  // ==========================================
  // --- НОВАЯ ВОЛНА: КИНО (CINEMA MASTERPIECES) ---
  // ==========================================
  {
    id: 'her_spike_jonze',
    name: 'Она (Спайк Джонз 2013)',
    category: 'Кино',
    adjustments: {
      temp: 18,
      tint: 8,
      exposure: 0.12,
      contrast: -6,
      highlights: -20,
      shadows: 14,
      whites: 10,
      blacks: -8,
      vibrance: 24,
      saturation: 4,
      clarity: -10,
      texture: 8,
      fade: 6,
      colorGrading: {
        shadows: { hue: 20, sat: 22 },
        midtones: { hue: 355, sat: 20 },
        highlights: { hue: 32, sat: 28 },
        balance: 4,
      }
    }
  },
  {
    id: 'drive_refn',
    name: 'Драйв (Рефн 2011)',
    category: 'Кино',
    adjustments: {
      temp: -8,
      tint: 16,
      exposure: -0.1,
      contrast: 34,
      highlights: -12,
      shadows: -22,
      whites: 18,
      blacks: -28,
      vibrance: 36,
      saturation: 14,
      clarity: 24,
      texture: 20,
      grain: 16,
      vignette: -22,
      colorGrading: {
        shadows: { hue: 215, sat: 42 },
        midtones: { hue: 320, sat: 22 },
        highlights: { hue: 35, sat: 38 },
        balance: -10,
      }
    }
  },
  {
    id: 'the_shining_kubrick',
    name: 'Сияние (Кубрик 1980)',
    category: 'Кино',
    adjustments: {
      temp: -4,
      tint: -6,
      exposure: 0.08,
      contrast: 22,
      highlights: 10,
      shadows: -14,
      whites: 22,
      blacks: -16,
      vibrance: 28,
      saturation: 12,
      clarity: 20,
      texture: 18,
      grain: 14,
      colorGrading: {
        shadows: { hue: 165, sat: 18 },
        midtones: { hue: 45, sat: 14 },
        highlights: { hue: 8, sat: 32 },
        balance: -6,
      }
    }
  },
  {
    id: 'in_the_mood_for_love_red',
    name: 'Любовное настроение (Красный шёлк)',
    category: 'Кино',
    adjustments: {
      temp: 16,
      tint: 12,
      exposure: -0.05,
      contrast: 24,
      highlights: -18,
      shadows: -12,
      whites: 12,
      blacks: -18,
      vibrance: 32,
      saturation: 14,
      clarity: 10,
      texture: 14,
      grain: 20,
      fade: 4,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 135, sat: 24 },
        midtones: { hue: 355, sat: 28 },
        highlights: { hue: 42, sat: 34 },
        balance: 2,
      }
    }
  },
  {
    id: 'fight_club_fincher',
    name: 'Бойцовский клуб (Финчер)',
    category: 'Кино',
    adjustments: {
      temp: -2,
      tint: -18,
      exposure: -0.15,
      contrast: 32,
      highlights: -24,
      shadows: -18,
      whites: 8,
      blacks: -24,
      vibrance: -8,
      saturation: -20,
      clarity: 28,
      texture: 24,
      grain: 24,
      vignette: -26,
      colorGrading: {
        shadows: { hue: 110, sat: 28 },
        midtones: { hue: 75, sat: 20 },
        highlights: { hue: 50, sat: 18 },
        balance: -14,
      }
    }
  },
  {
    id: 'lost_in_translation',
    name: 'Трудности перевода (Коппола)',
    category: 'Кино',
    adjustments: {
      temp: -6,
      tint: 14,
      exposure: 0.1,
      contrast: -8,
      highlights: -24,
      shadows: 16,
      whites: 10,
      blacks: -6,
      vibrance: 18,
      saturation: -6,
      clarity: -14,
      texture: 8,
      fade: 10,
      colorGrading: {
        shadows: { hue: 250, sat: 24 },
        midtones: { hue: 310, sat: 14 },
        highlights: { hue: 42, sat: 22 },
        balance: 0,
      }
    }
  },
  {
    id: 'apocalypse_now',
    name: 'Апокалипсис сегодня (Стораро)',
    category: 'Кино',
    adjustments: {
      temp: 24,
      tint: 4,
      exposure: 0.04,
      contrast: 26,
      highlights: -14,
      shadows: -18,
      whites: 16,
      blacks: -20,
      vibrance: 32,
      saturation: 16,
      clarity: 22,
      texture: 20,
      grain: 22,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 145, sat: 28 },
        midtones: { hue: 35, sat: 24 },
        highlights: { hue: 25, sat: 44 },
        balance: -4,
      }
    }
  },
  {
    id: 'chungking_express',
    name: 'Чунгкингский экспресс (1994)',
    category: 'Кино',
    adjustments: {
      temp: -4,
      tint: -12,
      exposure: 0.05,
      contrast: 28,
      highlights: -16,
      shadows: -14,
      whites: 14,
      blacks: -18,
      vibrance: 36,
      saturation: 18,
      clarity: 20,
      texture: 18,
      grain: 26,
      colorGrading: {
        shadows: { hue: 165, sat: 34 },
        midtones: { hue: 48, sat: 18 },
        highlights: { hue: 15, sat: 36 },
        balance: -8,
      }
    }
  },
  {
    id: 'the_godfather_part_ii',
    name: 'Крёстный отец II (Гордон Уиллис)',
    category: 'Кино',
    adjustments: {
      temp: 22,
      tint: 2,
      exposure: -0.22,
      contrast: 26,
      highlights: -24,
      shadows: -26,
      whites: 6,
      blacks: -28,
      vibrance: 12,
      saturation: -8,
      clarity: 16,
      texture: 18,
      grain: 20,
      vignette: -32,
      colorGrading: {
        shadows: { hue: 32, sat: 34 },
        midtones: { hue: 40, sat: 20 },
        highlights: { hue: 46, sat: 30 },
        balance: -16,
      }
    }
  },
  {
    id: 'alien_1979',
    name: 'Чужой (Ридли Скотт 1979)',
    category: 'Кино',
    adjustments: {
      temp: -12,
      tint: -4,
      exposure: -0.18,
      contrast: 32,
      highlights: -22,
      shadows: -26,
      whites: 12,
      blacks: -30,
      vibrance: -12,
      saturation: -24,
      clarity: 26,
      texture: 24,
      grain: 22,
      vignette: -28,
      colorGrading: {
        shadows: { hue: 200, sat: 32 },
        midtones: { hue: 215, sat: 14 },
        highlights: { hue: 50, sat: 14 },
        balance: -14,
      }
    }
  },

  // ==========================================
  // --- НОВАЯ ВОЛНА: АРХИВ (HISTORICAL PROCESSES) ---
  // ==========================================
  {
    id: 'physautotype_1832',
    name: 'Физавтотипия (Ньепс и Дагер 1832)',
    category: 'Архив',
    adjustments: {
      temp: -6,
      tint: 14,
      exposure: -0.1,
      contrast: 18,
      highlights: -30,
      shadows: -16,
      whites: 6,
      blacks: -20,
      vibrance: -65,
      saturation: -88,
      clarity: 16,
      texture: 24,
      grain: 30,
      fade: 10,
      vignette: -30,
      colorGrading: {
        shadows: { hue: 240, sat: 16 },
        midtones: { hue: 280, sat: 12 },
        highlights: { hue: 55, sat: 12 },
        balance: -6,
      }
    }
  },
  {
    id: 'carbon_print_1860',
    name: 'Углеродная печать (Carbon Print 1860)',
    category: 'Архив',
    adjustments: {
      temp: 10,
      tint: 4,
      exposure: 0.04,
      contrast: 24,
      highlights: -24,
      shadows: -8,
      whites: 12,
      blacks: -24,
      vibrance: -50,
      saturation: -70,
      clarity: 18,
      texture: 18,
      grain: 8,
      fade: 4,
      vignette: -16,
      colorGrading: {
        shadows: { hue: 28, sat: 28 },
        midtones: { hue: 35, sat: 16 },
        highlights: { hue: 44, sat: 18 },
        balance: -6,
      }
    }
  },
  {
    id: 'collotype_1868',
    name: 'Фототипия (Collotype 1868)',
    category: 'Архив',
    adjustments: {
      temp: 14,
      tint: 2,
      exposure: 0.02,
      contrast: 16,
      highlights: -26,
      shadows: 6,
      whites: 8,
      blacks: -16,
      vibrance: -60,
      saturation: -80,
      clarity: 14,
      texture: 28,
      grain: 26,
      fade: 8,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 30, sat: 24 },
        midtones: { hue: 36, sat: 14 },
        highlights: { hue: 42, sat: 16 },
        balance: -2,
      }
    }
  },
  {
    id: 'autochrome_lumier_pastel',
    name: 'Автохром (Картофельный крахмал)',
    category: 'Архив',
    adjustments: {
      temp: 12,
      tint: -4,
      exposure: 0.1,
      contrast: -6,
      highlights: -20,
      shadows: 18,
      whites: 10,
      blacks: -4,
      vibrance: 22,
      saturation: -8,
      clarity: -8,
      texture: 14,
      grain: 36,
      fade: 12,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 140, sat: 20 },
        midtones: { hue: 44, sat: 18 },
        highlights: { hue: 340, sat: 16 },
        balance: 2,
      }
    }
  },
  {
    id: 'salt_paper_fox_talbot',
    name: 'Солевая бумага (Фокс Тальбот 1839)',
    category: 'Архив',
    adjustments: {
      temp: 20,
      tint: 14,
      exposure: -0.06,
      contrast: 8,
      highlights: -34,
      shadows: 20,
      whites: 4,
      blacks: 2,
      vibrance: -40,
      saturation: -68,
      clarity: -12,
      texture: 26,
      grain: 30,
      fade: 16,
      vignette: -28,
      colorGrading: {
        shadows: { hue: 20, sat: 36 },
        midtones: { hue: 30, sat: 22 },
        highlights: { hue: 40, sat: 20 },
        balance: 6,
      }
    }
  },
  {
    id: 'albumen_print_1855',
    name: 'Альбуминовая печать (Яичный белок)',
    category: 'Архив',
    adjustments: {
      temp: 24,
      tint: 6,
      exposure: 0.08,
      contrast: 18,
      highlights: -24,
      shadows: 10,
      whites: 10,
      blacks: -12,
      vibrance: -18,
      saturation: -45,
      clarity: 12,
      texture: 18,
      grain: 18,
      fade: 8,
      vignette: -22,
      colorGrading: {
        shadows: { hue: 28, sat: 38 },
        midtones: { hue: 36, sat: 24 },
        highlights: { hue: 44, sat: 24 },
        balance: -2,
      }
    }
  },
  {
    id: 'polaroid_669_peel_apart',
    name: 'Polaroid 669 (Peel-Apart)',
    category: 'Архив',
    adjustments: {
      temp: 6,
      tint: -14,
      exposure: 0.14,
      contrast: 12,
      highlights: -18,
      shadows: 16,
      whites: 12,
      blacks: -8,
      vibrance: 24,
      saturation: 4,
      clarity: 6,
      texture: 12,
      grain: 20,
      fade: 10,
      vignette: -16,
      colorGrading: {
        shadows: { hue: 170, sat: 26 },
        midtones: { hue: 42, sat: 16 },
        highlights: { hue: 48, sat: 24 },
        balance: 2,
      }
    }
  },
  {
    id: 'kodak_panatomic_x',
    name: 'Kodak Panatomic-X (Микроплёнка)',
    category: 'Архив',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.02,
      contrast: 26,
      highlights: -18,
      shadows: -14,
      whites: 16,
      blacks: -20,
      vibrance: -100,
      saturation: -100,
      clarity: 28,
      texture: 26,
      grain: 4,
    }
  },
  {
    id: 'early_color_prokudin_gorsky',
    name: 'Метод Прокудина-Горского (1909)',
    category: 'Архив',
    adjustments: {
      temp: 8,
      tint: -4,
      exposure: 0.06,
      contrast: 22,
      highlights: -14,
      shadows: -10,
      whites: 14,
      blacks: -14,
      vibrance: 32,
      saturation: 16,
      clarity: 22,
      texture: 18,
      grain: 16,
      colorGrading: {
        shadows: { hue: 210, sat: 20 },
        midtones: { hue: 40, sat: 14 },
        highlights: { hue: 45, sat: 24 },
        balance: 0,
      }
    }
  },
  {
    id: 'daguerreotype_gilded',
    name: 'Дагеротип с золочением (1840)',
    category: 'Архив',
    adjustments: {
      temp: 10,
      tint: 2,
      exposure: 0.05,
      contrast: 30,
      highlights: 12,
      shadows: -28,
      whites: 20,
      blacks: -32,
      vibrance: -70,
      saturation: -88,
      clarity: 26,
      texture: 22,
      grain: 12,
      vignette: -34,
      colorGrading: {
        shadows: { hue: 35, sat: 26 },
        midtones: { hue: 42, sat: 18 },
        highlights: { hue: 48, sat: 28 },
        balance: -12,
      }
    }
  },

  // ==========================================
  // --- НОВАЯ ВОЛНА: ПЛЁНКА (LEGENDARY FILMS) ---
  // ==========================================
  {
    id: 'kodak_ektachrome_160t',
    name: 'Kodak Ektachrome 160T (Tungsten)',
    category: 'Плёнка',
    adjustments: {
      temp: -16,
      tint: -6,
      exposure: 0.08,
      contrast: 26,
      highlights: -16,
      shadows: -14,
      whites: 16,
      blacks: -18,
      vibrance: 30,
      saturation: 10,
      clarity: 20,
      texture: 18,
      grain: 14,
      colorGrading: {
        shadows: { hue: 225, sat: 34 },
        midtones: { hue: 200, sat: 14 },
        highlights: { hue: 40, sat: 26 },
        balance: -8,
      }
    }
  },
  {
    id: 'fujifilm_superia_1600',
    name: 'Fujifilm Superia 1600 (Ночная)',
    category: 'Плёнка',
    adjustments: {
      temp: -6,
      tint: -10,
      exposure: 0.16,
      contrast: 22,
      highlights: -20,
      shadows: 18,
      whites: 14,
      blacks: -10,
      vibrance: 28,
      saturation: 8,
      clarity: 16,
      texture: 14,
      grain: 32,
      fade: 6,
      colorGrading: {
        shadows: { hue: 155, sat: 28 },
        midtones: { hue: 45, sat: 16 },
        highlights: { hue: 345, sat: 22 },
        balance: -2,
      }
    }
  },
  {
    id: 'kodak_gold_100_vintage',
    name: 'Kodak Gold 100 (Винтаж 90-х)',
    category: 'Плёнка',
    adjustments: {
      temp: 18,
      tint: -2,
      exposure: 0.08,
      contrast: 20,
      highlights: -16,
      shadows: 6,
      whites: 14,
      blacks: -12,
      vibrance: 26,
      saturation: 12,
      clarity: 14,
      texture: 14,
      grain: 14,
      colorGrading: {
        shadows: { hue: 28, sat: 26 },
        midtones: { hue: 42, sat: 18 },
        highlights: { hue: 48, sat: 32 },
        balance: 2,
      }
    }
  },
  {
    id: 'ilford_pan_400',
    name: 'Ilford Pan 400',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.04,
      contrast: 22,
      highlights: -18,
      shadows: -12,
      whites: 14,
      blacks: -16,
      vibrance: -100,
      saturation: -100,
      clarity: 18,
      texture: 16,
      grain: 20,
    }
  },
  {
    id: 'agfacolor_neu_1936',
    name: 'Agfacolor Neu (1936)',
    category: 'Плёнка',
    adjustments: {
      temp: 16,
      tint: -8,
      exposure: 0.12,
      contrast: 10,
      highlights: -22,
      shadows: 14,
      whites: 8,
      blacks: -8,
      vibrance: 16,
      saturation: -12,
      clarity: 8,
      texture: 14,
      grain: 22,
      fade: 8,
      colorGrading: {
        shadows: { hue: 130, sat: 22 },
        midtones: { hue: 42, sat: 16 },
        highlights: { hue: 25, sat: 24 },
        balance: 2,
      }
    }
  },
  {
    id: 'kodak_verichrome_pan',
    name: 'Kodak Verichrome Pan',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.12,
      contrast: 14,
      highlights: -24,
      shadows: 16,
      whites: 12,
      blacks: -10,
      vibrance: -100,
      saturation: -100,
      clarity: 12,
      texture: 14,
      grain: 14,
      fade: 6,
    }
  },
  {
    id: 'fujifilm_industrial_100',
    name: 'Fujifilm Industrial 100 (Япония)',
    category: 'Плёнка',
    adjustments: {
      temp: 2,
      tint: 4,
      exposure: 0.05,
      contrast: 18,
      highlights: -16,
      shadows: 8,
      whites: 14,
      blacks: -12,
      vibrance: 22,
      saturation: 4,
      clarity: 16,
      texture: 14,
      grain: 10,
      colorGrading: {
        shadows: { hue: 190, sat: 16 },
        midtones: { hue: 35, sat: 10 },
        highlights: { hue: 44, sat: 18 },
        balance: 0,
      }
    }
  },
  {
    id: 'adox_silvermax_21',
    name: 'Adox Silvermax 21 (Серебро 14 зон)',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.06,
      contrast: 24,
      highlights: -28,
      shadows: 18,
      whites: 18,
      blacks: -24,
      vibrance: -100,
      saturation: -100,
      clarity: 24,
      texture: 22,
      grain: 8,
    }
  },
  {
    id: 'rollei_retro_80s',
    name: 'Rollei Retro 80S (Near-IR)',
    category: 'Плёнка',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: -0.05,
      contrast: 38,
      highlights: 14,
      shadows: -34,
      whites: 24,
      blacks: -38,
      vibrance: -100,
      saturation: -100,
      clarity: 32,
      texture: 26,
      grain: 6,
      vignette: -18,
    }
  },
  {
    id: 'cinestill_800t_daylight_filter',
    name: 'CineStill 800T (Фильтр 85B)',
    category: 'Плёнка',
    adjustments: {
      temp: 14,
      tint: 4,
      exposure: 0.08,
      contrast: 22,
      highlights: -12,
      shadows: -10,
      whites: 18,
      blacks: -16,
      vibrance: 28,
      saturation: 10,
      clarity: 18,
      texture: 16,
      grain: 16,
      vignette: -14,
      colorGrading: {
        shadows: { hue: 195, sat: 24 },
        midtones: { hue: 38, sat: 14 },
        highlights: { hue: 18, sat: 30 },
        balance: -2,
      }
    }
  },

  // ==========================================
  // --- НОВАЯ ВОЛНА: СЛАЙД (REVERSAL SLIDES) ---
  // ==========================================
  {
    id: 'fujichrome_velvia_100f',
    name: 'Fujichrome Velvia 100F (Насыщенный)',
    category: 'Слайд',
    adjustments: {
      temp: 6,
      tint: 4,
      exposure: 0.02,
      contrast: 34,
      highlights: -18,
      shadows: -20,
      whites: 20,
      blacks: -24,
      vibrance: 40,
      saturation: 26,
      clarity: 28,
      texture: 24,
      grain: 6,
      vignette: -16,
      colorGrading: {
        shadows: { hue: 215, sat: 34 },
        midtones: { hue: 36, sat: 20 },
        highlights: { hue: 44, sat: 38 },
        balance: -6,
      }
    }
  },
  {
    id: 'kodak_ektachrome_e200',
    name: 'Kodak Ektachrome E200 (Тёплый слайд)',
    category: 'Слайд',
    adjustments: {
      temp: 12,
      tint: 2,
      exposure: 0.06,
      contrast: 24,
      highlights: -18,
      shadows: -12,
      whites: 16,
      blacks: -16,
      vibrance: 26,
      saturation: 12,
      clarity: 20,
      texture: 16,
      grain: 12,
      colorGrading: {
        shadows: { hue: 205, sat: 20 },
        midtones: { hue: 40, sat: 16 },
        highlights: { hue: 46, sat: 28 },
        balance: -2,
      }
    }
  },
  {
    id: 'agfachrome_ct_precisa',
    name: 'Agfa CT Precisa 100',
    category: 'Слайд',
    adjustments: {
      temp: -4,
      tint: -6,
      exposure: 0.04,
      contrast: 26,
      highlights: -14,
      shadows: -14,
      whites: 16,
      blacks: -18,
      vibrance: 32,
      saturation: 16,
      clarity: 22,
      texture: 18,
      grain: 8,
      colorGrading: {
        shadows: { hue: 210, sat: 28 },
        midtones: { hue: 185, sat: 14 },
        highlights: { hue: 42, sat: 22 },
        balance: -6,
      }
    }
  },
  {
    id: 'fujichrome_fortia_50',
    name: 'Fujichrome Fortia 50 (Сверхнасыщенный)',
    category: 'Слайд',
    adjustments: {
      temp: 8,
      tint: 8,
      exposure: -0.02,
      contrast: 38,
      highlights: -16,
      shadows: -24,
      whites: 24,
      blacks: -28,
      vibrance: 48,
      saturation: 34,
      clarity: 30,
      texture: 26,
      grain: 6,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 220, sat: 40 },
        midtones: { hue: 340, sat: 24 },
        highlights: { hue: 40, sat: 44 },
        balance: -6,
      }
    }
  },
  {
    id: 'kodachrome_200',
    name: 'Kodachrome 200 (National Geographic)',
    category: 'Слайд',
    adjustments: {
      temp: 14,
      tint: -2,
      exposure: 0.04,
      contrast: 28,
      highlights: -20,
      shadows: -16,
      whites: 16,
      blacks: -20,
      vibrance: 26,
      saturation: 10,
      clarity: 24,
      texture: 22,
      grain: 14,
      vignette: -16,
      colorGrading: {
        shadows: { hue: 215, sat: 24 },
        midtones: { hue: 42, sat: 16 },
        highlights: { hue: 46, sat: 30 },
        balance: -6,
      }
    }
  },
  {
    id: 'fujichrome_t64_tungsten',
    name: 'Fujichrome T64 (Студийный слайд)',
    category: 'Слайд',
    adjustments: {
      temp: -18,
      tint: -4,
      exposure: 0.06,
      contrast: 24,
      highlights: -18,
      shadows: -14,
      whites: 14,
      blacks: -16,
      vibrance: 24,
      saturation: 8,
      clarity: 18,
      texture: 16,
      grain: 8,
      colorGrading: {
        shadows: { hue: 220, sat: 32 },
        midtones: { hue: 195, sat: 16 },
        highlights: { hue: 38, sat: 22 },
        balance: -8,
      }
    }
  },

  // ==========================================
  // --- НОВАЯ ВОЛНА: МОНОХРОМ (DARKROOM TONALITIES) ---
  // ==========================================
  {
    id: 'platinum_palladium_mix',
    name: 'Платиново-палладиевый микс 50/50',
    category: 'Монохром',
    adjustments: {
      temp: 8,
      tint: 4,
      exposure: 0.06,
      contrast: 14,
      highlights: -30,
      shadows: 18,
      whites: 8,
      blacks: -16,
      vibrance: -85,
      saturation: -85,
      clarity: 14,
      texture: 18,
      grain: 12,
      fade: 6,
      colorGrading: {
        shadows: { hue: 34, sat: 20 },
        midtones: { hue: 40, sat: 12 },
        highlights: { hue: 46, sat: 14 },
        balance: 0,
      }
    }
  },
  {
    id: 'lith_print_process',
    name: 'Лит-печать (Инфекционное проявление)',
    category: 'Монохром',
    adjustments: {
      temp: 16,
      tint: 8,
      exposure: 0.1,
      contrast: 34,
      highlights: -24,
      shadows: -26,
      whites: 18,
      blacks: -36,
      vibrance: -70,
      saturation: -75,
      clarity: 26,
      texture: 30,
      grain: 28,
      vignette: -24,
      colorGrading: {
        shadows: { hue: 24, sat: 30 },
        midtones: { hue: 32, sat: 22 },
        highlights: { hue: 42, sat: 26 },
        balance: -12,
      }
    }
  },
  {
    id: 'cyanotype_over_platinum',
    name: 'Цианотипия поверх платины',
    category: 'Монохром',
    adjustments: {
      temp: -16,
      tint: -6,
      exposure: 0.04,
      contrast: 20,
      highlights: -22,
      shadows: -14,
      whites: 12,
      blacks: -18,
      vibrance: -45,
      saturation: -60,
      clarity: 16,
      texture: 20,
      grain: 16,
      colorGrading: {
        shadows: { hue: 215, sat: 44 },
        midtones: { hue: 205, sat: 22 },
        highlights: { hue: 50, sat: 8 },
        balance: -8,
      }
    }
  },
  {
    id: 'ansel_adams_zone_system',
    name: 'Зонная система (Ансель Адамс)',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.04,
      contrast: 30,
      highlights: -32,
      shadows: 24,
      whites: 26,
      blacks: -30,
      vibrance: -100,
      saturation: -100,
      clarity: 28,
      texture: 24,
      grain: 10,
    }
  },
  {
    id: 'moriyama_stray_dog',
    name: 'Дайдо Морияма (Бродячий пёс 1971)',
    category: 'Монохром',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: -0.15,
      contrast: 48,
      highlights: 22,
      shadows: -48,
      whites: 30,
      blacks: -52,
      vibrance: -100,
      saturation: -100,
      clarity: 42,
      texture: 38,
      grain: 44,
      vignette: -32,
    }
  },
  {
    id: 'wet_plate_collodion_tint',
    name: 'Мокрый коллодий (Серебряный вираж)',
    category: 'Монохром',
    adjustments: {
      temp: 4,
      tint: -2,
      exposure: -0.08,
      contrast: 26,
      highlights: -24,
      shadows: -22,
      whites: 16,
      blacks: -28,
      vibrance: -85,
      saturation: -90,
      clarity: 20,
      texture: 26,
      grain: 26,
      vignette: -36,
      colorGrading: {
        shadows: { hue: 210, sat: 16 },
        midtones: { hue: 45, sat: 10 },
        highlights: { hue: 50, sat: 14 },
        balance: -10,
      }
    }
  },
  {
    id: 'kallitype_sepia',
    name: 'Каллитипия (Сепия-шоколад)',
    category: 'Монохром',
    adjustments: {
      temp: 22,
      tint: 6,
      exposure: 0.05,
      contrast: 18,
      highlights: -26,
      shadows: 12,
      whites: 8,
      blacks: -14,
      vibrance: -65,
      saturation: -70,
      clarity: 14,
      texture: 18,
      grain: 16,
      fade: 8,
      vignette: -20,
      colorGrading: {
        shadows: { hue: 26, sat: 36 },
        midtones: { hue: 34, sat: 22 },
        highlights: { hue: 42, sat: 18 },
        balance: -2,
      }
    }
  },
  {
    id: 'split_sepia_selenium',
    name: 'Сплит-вираж (Сепия + Селен)',
    category: 'Монохром',
    adjustments: {
      temp: 10,
      tint: 12,
      exposure: 0.06,
      contrast: 26,
      highlights: -20,
      shadows: -16,
      whites: 14,
      blacks: -20,
      vibrance: -75,
      saturation: -80,
      clarity: 18,
      texture: 18,
      grain: 14,
      colorGrading: {
        shadows: { hue: 285, sat: 28 },
        midtones: { hue: 32, sat: 18 },
        highlights: { hue: 42, sat: 26 },
        balance: -4,
      }
    }
  },

  // ==========================================
  // --- НОВАЯ ВОЛНА: АРТ (FINE ART MASTERS) ---
  // ==========================================
  {
    id: 'turner_golden_light',
    name: 'Уильям Тёрнер (Золотой свет и пар)',
    category: 'Арт',
    adjustments: {
      temp: 32,
      tint: 6,
      exposure: 0.28,
      contrast: -16,
      highlights: 18,
      shadows: 24,
      whites: 26,
      blacks: -6,
      vibrance: 34,
      saturation: 16,
      clarity: -20,
      texture: 8,
      fade: 14,
      vignette: -18,
      colorGrading: {
        shadows: { hue: 35, sat: 34 },
        midtones: { hue: 44, sat: 36 },
        highlights: { hue: 50, sat: 54 },
        balance: 8,
      }
    }
  },
  {
    id: 'kandinsky_composition',
    name: 'Василий Кандинский (Авангард)',
    category: 'Арт',
    adjustments: {
      temp: 4,
      tint: 6,
      exposure: 0.08,
      contrast: 32,
      highlights: -10,
      shadows: -14,
      whites: 22,
      blacks: -18,
      vibrance: 44,
      saturation: 28,
      clarity: 26,
      texture: 22,
      colorGrading: {
        shadows: { hue: 225, sat: 36 },
        midtones: { hue: 345, sat: 28 },
        highlights: { hue: 48, sat: 46 },
        balance: 2,
      }
    }
  },
  {
    id: 'edward_hopper_nighthawks',
    name: 'Эдвард Хоппер (Полуночники)',
    category: 'Арт',
    adjustments: {
      temp: -4,
      tint: -16,
      exposure: -0.12,
      contrast: 28,
      highlights: 12,
      shadows: -26,
      whites: 16,
      blacks: -28,
      vibrance: 22,
      saturation: 4,
      clarity: 22,
      texture: 18,
      vignette: -28,
      colorGrading: {
        shadows: { hue: 175, sat: 32 },
        midtones: { hue: 38, sat: 20 },
        highlights: { hue: 65, sat: 28 },
        balance: -12,
      }
    }
  },
  {
    id: 'hokusai_great_wave',
    name: 'Хокусай (Большая волна в Канагаве)',
    category: 'Арт',
    adjustments: {
      temp: -14,
      tint: -2,
      exposure: 0.06,
      contrast: 26,
      highlights: -18,
      shadows: -16,
      whites: 16,
      blacks: -22,
      vibrance: 32,
      saturation: 12,
      clarity: 24,
      texture: 22,
      colorGrading: {
        shadows: { hue: 215, sat: 48 },
        midtones: { hue: 200, sat: 22 },
        highlights: { hue: 42, sat: 26 },
        balance: -8,
      }
    }
  },
  {
    id: 'salvador_dali_surrealism',
    name: 'Сальвадор Дали (Сюрреализм)',
    category: 'Арт',
    adjustments: {
      temp: 14,
      tint: -6,
      exposure: 0.1,
      contrast: 34,
      highlights: -12,
      shadows: -18,
      whites: 20,
      blacks: -22,
      vibrance: 36,
      saturation: 18,
      clarity: 32,
      texture: 28,
      grain: 6,
      colorGrading: {
        shadows: { hue: 215, sat: 34 },
        midtones: { hue: 38, sat: 26 },
        highlights: { hue: 46, sat: 42 },
        balance: -4,
      }
    }
  },
  {
    id: 'piet_mondrian_de_stijl',
    name: 'Пит Мондриан (Де Стейл)',
    category: 'Арт',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0.05,
      contrast: 40,
      highlights: 10,
      shadows: -24,
      whites: 26,
      blacks: -32,
      vibrance: 46,
      saturation: 30,
      clarity: 34,
      texture: 20,
      colorGrading: {
        shadows: { hue: 225, sat: 42 },
        midtones: { hue: 355, sat: 38 },
        highlights: { hue: 50, sat: 50 },
        balance: 0,
      }
    }
  },
  {
    id: 'rembrandt_golden_glow',
    name: 'Рембрандт (Золотое свечение)',
    category: 'Арт',
    adjustments: {
      temp: 24,
      tint: 2,
      exposure: -0.18,
      contrast: 32,
      highlights: 12,
      shadows: -34,
      whites: 16,
      blacks: -38,
      vibrance: 18,
      saturation: -2,
      clarity: 22,
      texture: 26,
      grain: 16,
      vignette: -34,
      colorGrading: {
        shadows: { hue: 28, sat: 34 },
        midtones: { hue: 38, sat: 28 },
        highlights: { hue: 45, sat: 44 },
        balance: -16,
      }
    }
  },
  {
    id: 'cezanne_provence',
    name: 'Поль Сезанн (Прованс)',
    category: 'Арт',
    adjustments: {
      temp: 14,
      tint: 4,
      exposure: 0.1,
      contrast: 18,
      highlights: -18,
      shadows: 10,
      whites: 12,
      blacks: -12,
      vibrance: 26,
      saturation: 8,
      clarity: 16,
      texture: 20,
      fade: 4,
      colorGrading: {
        shadows: { hue: 220, sat: 24 },
        midtones: { hue: 135, sat: 18 },
        highlights: { hue: 44, sat: 28 },
        balance: 0,
      }
    }
  },
  {
    id: 'malevich_suprematism',
    name: 'Казимир Малевич (Супрематизм)',
    category: 'Арт',
    adjustments: {
      temp: 0,
      tint: 0,
      exposure: 0,
      contrast: 46,
      highlights: 20,
      shadows: -38,
      whites: 30,
      blacks: -48,
      vibrance: 40,
      saturation: 22,
      clarity: 36,
      texture: 24,
      colorGrading: {
        shadows: { hue: 0, sat: 0 },
        midtones: { hue: 350, sat: 28 },
        highlights: { hue: 48, sat: 36 },
        balance: 0,
      }
    }
  },
  {
    id: 'bosch_garden_of_earthly_delights',
    name: 'Иероним Босх (Сад земных наслаждений)',
    category: 'Арт',
    adjustments: {
      temp: 8,
      tint: 14,
      exposure: 0.08,
      contrast: 24,
      highlights: -16,
      shadows: -14,
      whites: 16,
      blacks: -18,
      vibrance: 34,
      saturation: 16,
      clarity: 26,
      texture: 28,
      grain: 12,
      colorGrading: {
        shadows: { hue: 150, sat: 30 },
        midtones: { hue: 345, sat: 20 },
        highlights: { hue: 46, sat: 32 },
        balance: 2,
      }
    }
  }

]



