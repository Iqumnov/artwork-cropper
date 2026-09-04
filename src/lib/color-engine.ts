import { LightroomAdjustments, ColorChannel, ToneCurvePoint } from '../types'

// Film grain precomputed Gaussian-like pseudo-random noise table
const GRAIN_TABLE_SIZE = 8192
const GRAIN_TABLE = new Float32Array(GRAIN_TABLE_SIZE)
let grainTableInitialized = false

function initGrainTable() {
  if (grainTableInitialized) return
  let seed = 42
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  for (let i = 0; i < GRAIN_TABLE_SIZE; i++) {
    // 3 uniform random samples sum approximates Gaussian distribution (-1 to +1)
    GRAIN_TABLE[i] = (rand() + rand() + rand() - 1.5) * 1.333
  }
  grainTableInitialized = true
}

// RGB to HSL and HSL to RGB conversion utilities
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s, l]
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  if (s === 0) {
    const val = Math.round(l * 255)
    return [val, val, val]
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1/3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1/3)

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Map hue degree (0-360) to target HSL color channel weights
function getColorChannelWeights(hue: number): Partial<Record<ColorChannel, number>> {
  // Color centers:
  // Red: 0 / 360, Orange: 30, Yellow: 60, Green: 120, Aqua: 180, Blue: 240, Purple: 280, Magenta: 320
  const centers: Record<ColorChannel, number> = {
    red: 0,
    orange: 30,
    yellow: 60,
    green: 120,
    aqua: 180,
    blue: 240,
    purple: 280,
    magenta: 320
  }

  const weights: Partial<Record<ColorChannel, number>> = {}
  let totalWeight = 0

  for (const [channel, center] of Object.entries(centers) as [ColorChannel, number][]) {
    let diff = Math.abs(hue - center)
    if (diff > 180) diff = 360 - diff
    if (diff < 40) {
      const w = Math.cos((diff / 40) * (Math.PI / 2))
      weights[channel] = w
      totalWeight += w
    }
  }

  if (totalWeight > 0) {
    for (const ch of Object.keys(weights) as ColorChannel[]) {
      weights[ch] = weights[ch]! / totalWeight
    }
  }

  return weights
}

// Generate 256-value Look-Up Table for Curves
function buildCurveLUT(points: ToneCurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256)
  if (points.length < 2) {
    for (let i = 0; i < 256; i++) lut[i] = i
    return lut
  }

  const sorted = [...points].sort((a, b) => a.x - b.x)

  for (let i = 0; i < 256; i++) {
    if (i <= sorted[0].x) {
      lut[i] = Math.max(0, Math.min(255, Math.round(sorted[0].y)))
      continue
    }
    if (i >= sorted[sorted.length - 1].x) {
      lut[i] = Math.max(0, Math.min(255, Math.round(sorted[sorted.length - 1].y)))
      continue
    }

    // Linear interpolation between adjacent control points
    for (let k = 0; k < sorted.length - 1; k++) {
      if (i >= sorted[k].x && i <= sorted[k + 1].x) {
        const t = (i - sorted[k].x) / (sorted[k + 1].x - sorted[k].x || 1)
        const val = sorted[k].y + t * (sorted[k + 1].y - sorted[k].y)
        lut[i] = Math.max(0, Math.min(255, Math.round(val)))
        break
      }
    }
  }

  return lut
}

/**
 * High-performance Lightroom Color Correction Filter
 * Executes on an ImageData buffer directly
 */
export function applyLightroomAdjustments(
  imageData: ImageData,
  adjustments: LightroomAdjustments
): void {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const totalPixels = width * height

  // 1. Precalculate multipliers and constants
  const exposureMult = Math.pow(2, adjustments.exposure)
  const contrastFactor = adjustments.contrast !== 0 
    ? (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast))
    : 1

  // Color Temp & Tint
  const tempShiftR = adjustments.temp > 0 ? adjustments.temp * 0.6 : adjustments.temp * 0.3
  const tempShiftB = adjustments.temp > 0 ? -adjustments.temp * 0.6 : -adjustments.temp * 0.4
  const tintShiftG = adjustments.tint < 0 ? -adjustments.tint * 0.5 : 0
  const tintShiftR = adjustments.tint > 0 ? adjustments.tint * 0.35 : 0
  const tintShiftB = adjustments.tint > 0 ? adjustments.tint * 0.35 : 0

  // Highlights & Shadows
  const hlFactor = adjustments.highlights / 100
  const shFactor = adjustments.shadows / 100
  const whitesFactor = adjustments.whites / 100
  const blacksFactor = adjustments.blacks / 100

  // Global Vibrance & Saturation
  const globalSat = 1 + adjustments.saturation / 100
  const vibranceAmount = adjustments.vibrance / 100

function isDefaultCurve(points: ToneCurvePoint[]): boolean {
  if (!points || points.length !== 2) return false
  return points[0].x === 0 && points[0].y === 0 && points[1].x === 255 && points[1].y === 255
}

  // Curves LUTs (Only allocate and calculate if curves are customized)
  const hasCurves =
    !isDefaultCurve(adjustments.curves.rgb) ||
    !isDefaultCurve(adjustments.curves.red) ||
    !isDefaultCurve(adjustments.curves.green) ||
    !isDefaultCurve(adjustments.curves.blue)

  const curveRGB = hasCurves ? buildCurveLUT(adjustments.curves.rgb) : null
  const curveR = hasCurves ? buildCurveLUT(adjustments.curves.red) : null
  const curveG = hasCurves ? buildCurveLUT(adjustments.curves.green) : null
  const curveB = hasCurves ? buildCurveLUT(adjustments.curves.blue) : null

  // Split Toning Colors (RGB offsets in 0..255)
  const shadowHue = adjustments.colorGrading.shadows.hue
  const shadowSat = (adjustments.colorGrading.shadows.sat || 0) / 100
  const [sR, sG, sB] = hslToRgb(shadowHue, shadowSat, 0.5)

  const midHue = adjustments.colorGrading.midtones?.hue || 0
  const midSat = (adjustments.colorGrading.midtones?.sat || 0) / 100
  const [mR, mG, mB] = hslToRgb(midHue, midSat, 0.5)

  const highHue = adjustments.colorGrading.highlights.hue
  const highSat = (adjustments.colorGrading.highlights.sat || 0) / 100
  const [hR, hG, hB] = hslToRgb(highHue, highSat, 0.5)

  const balance = (adjustments.colorGrading.balance || 0) / 100
  const midPoint = 0.5 + balance * 0.25

  // Precompute Split Toning LUTs (256 discrete luminance values)
  const shadowWeightLUT = new Float32Array(256)
  const midWeightLUT = new Float32Array(256)
  const highWeightLUT = new Float32Array(256)
  const hasColorGrading = shadowSat > 0 || midSat > 0 || highSat > 0

  if (hasColorGrading) {
    for (let L = 0; L < 256; L++) {
      const nL = L / 255
      if (shadowSat > 0 && nL < midPoint + 0.1) {
        shadowWeightLUT[L] = Math.pow(Math.max(0, 1 - nL / (midPoint + 0.1)), 2) * shadowSat * 0.4
      }
      if (midSat > 0) {
        const midDist = Math.abs(nL - midPoint)
        if (midDist < 0.35) {
          midWeightLUT[L] = Math.cos((midDist / 0.35) * (Math.PI / 2)) * midSat * 0.35
        }
      }
      if (highSat > 0 && nL > midPoint - 0.1) {
        highWeightLUT[L] = Math.pow(Math.max(0, (nL - (midPoint - 0.1)) / (1 - (midPoint - 0.1))), 2) * highSat * 0.4
      }
    }
  }

  // Fast check if HSL mixer is active
  const hasHslMixer = Object.values(adjustments.hsl).some(
    v => v.hue !== 0 || v.sat !== 0 || v.lum !== 0
  )

  // Vignette calculations
  const cx = width / 2
  const cy = height / 2
  const maxDistSq = cx * cx + cy * cy
  const vignetteAmount = adjustments.vignette / 100

  // Dehaze & Clarity
  const dehazeBoost = adjustments.dehaze / 100
  const clarityVal = adjustments.clarity / 100
  const textureVal = (adjustments.texture || 0) / 100
  const grainAmount = (adjustments.grain || 0) / 100
  const noiseReductionVal = (adjustments.noiseReduction || 0) / 100

  if (grainAmount > 0) {
    initGrainTable()
  }

  // Pixel Loop
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    let r = data[idx]
    let g = data[idx + 1]
    let b = data[idx + 2]

    // --- Exposure ---
    if (exposureMult !== 1) {
      r *= exposureMult
      g *= exposureMult
      b *= exposureMult
    }

    // --- Temperature & Tint ---
    r += tempShiftR + tintShiftR
    g += tintShiftG
    b += tempShiftB + tintShiftB

    // --- Highlights & Shadows & Whites & Blacks ---
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    const normLum = Math.max(0, Math.min(1, lum / 255))

    if (hlFactor !== 0 && normLum > 0.5) {
      const w = (normLum - 0.5) * 2
      const delta = hlFactor * 45 * w
      r += delta
      g += delta
      b += delta
    }

    if (shFactor !== 0 && normLum < 0.5) {
      const w = (0.5 - normLum) * 2
      const delta = shFactor * 45 * w
      r += delta
      g += delta
      b += delta
    }

    if (whitesFactor !== 0 && normLum > 0.75) {
      const w = (normLum - 0.75) * 4
      const delta = whitesFactor * 35 * w
      r += delta
      g += delta
      b += delta
    }

    if (blacksFactor !== 0 && normLum < 0.25) {
      const w = (0.25 - normLum) * 4
      const delta = blacksFactor * 35 * w
      r += delta
      g += delta
      b += delta
    }

    // --- Contrast ---
    if (contrastFactor !== 1) {
      r = contrastFactor * (r - 128) + 128
      g = contrastFactor * (g - 128) + 128
      b = contrastFactor * (b - 128) + 128
    }

    // --- Dehaze & Clarity & Texture ---
    if (dehazeBoost !== 0 || clarityVal !== 0 || textureVal !== 0) {
      const midWeight = 1 - 2 * Math.abs(normLum - 0.5)
      // Clarity operates on midtones
      const clarityDelta = (clarityVal * 28) * midWeight
      // Dehaze removes haze: expands contrast, deepens black level
      const dehazeDelta = (dehazeBoost * 32) * (1 - normLum * 0.4)
      // Texture enhances subtle micro-contrast
      const textureDelta = textureVal * 20 * (0.5 + midWeight * 0.5)

      const combinedDelta = clarityDelta + dehazeDelta + textureDelta
      r += (r - 128) * (combinedDelta / 255)
      g += (g - 128) * (combinedDelta / 255)
      b += (b - 128) * (combinedDelta / 255)

      if (dehazeBoost !== 0) {
        // Dehaze deepens shadow floor slightly
        const floorDelta = dehazeBoost * 8 * (1 - normLum)
        r -= floorDelta
        g -= floorDelta
        b -= floorDelta
      }
    }

    // Clamp before color conversions
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))

    // --- Saturation & Vibrance & HSL Mixer ---
    if (hasHslMixer) {
      let [h, s, l] = rgbToHsl(r, g, b)

      const weights = getColorChannelWeights(h)
      let hueDelta = 0
      let satDelta = 0
      let lumDelta = 0

      for (const [ch, weight] of Object.entries(weights) as [ColorChannel, number][]) {
        const adj = adjustments.hsl[ch]
        if (adj) {
          hueDelta += adj.hue * weight * 0.3
          satDelta += (adj.sat / 100) * weight
          lumDelta += (adj.lum / 100) * weight * 0.3
        }
      }

      h += hueDelta
      s = Math.max(0, Math.min(1, s * (1 + satDelta)))
      l = Math.max(0, Math.min(1, l + lumDelta))

      if (vibranceAmount !== 0) {
        const vibFactor = 1 + vibranceAmount * (1 - s) * 1.5
        s = Math.max(0, Math.min(1, s * vibFactor))
      }

      if (globalSat !== 1) {
        s = Math.max(0, Math.min(1, s * globalSat))
      }

      const [newR, newG, newB] = hslToRgb(h, s, l)
      r = newR
      g = newG
      b = newB
    } else if (globalSat !== 1 || vibranceAmount !== 0) {
      // Lightning-fast RGB saturation & vibrance path (10x faster)
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      let satFactor = globalSat
      if (vibranceAmount !== 0) {
        const maxC = Math.max(r, g, b)
        const minC = Math.min(r, g, b)
        const currentSat = maxC === 0 ? 0 : (maxC - minC) / 255
        satFactor *= (1 + vibranceAmount * (1 - currentSat) * 1.5)
      }
      r = Math.max(0, Math.min(255, gray + (r - gray) * satFactor))
      g = Math.max(0, Math.min(255, gray + (g - gray) * satFactor))
      b = Math.max(0, Math.min(255, gray + (b - gray) * satFactor))
    }

    // --- Color Grading / Split Toning via Precomputed LUTs ---
    if (hasColorGrading) {
      const lumInt = Math.max(0, Math.min(255, Math.round(lum)))
      const sW = shadowWeightLUT[lumInt]
      if (sW > 0) {
        r = r * (1 - sW) + sR * sW
        g = g * (1 - sW) + sG * sW
        b = b * (1 - sW) + sB * sW
      }

      const mW = midWeightLUT[lumInt]
      if (mW > 0) {
        r = r * (1 - mW) + mR * mW
        g = g * (1 - mW) + mG * mW
        b = b * (1 - mW) + mB * mW
      }

      const hW = highWeightLUT[lumInt]
      if (hW > 0) {
        r = r * (1 - hW) + hR * hW
        g = g * (1 - hW) + hG * hW
        b = b * (1 - hW) + hB * hW
      }
    }

    // --- Curves ---
    if (hasCurves && curveRGB && curveR && curveG && curveB) {
      const rIdx = Math.max(0, Math.min(255, Math.round(r)))
      const gIdx = Math.max(0, Math.min(255, Math.round(g)))
      const bIdx = Math.max(0, Math.min(255, Math.round(b)))

      r = curveRGB[curveR[rIdx]]
      g = curveRGB[curveG[gIdx]]
      b = curveRGB[curveB[bIdx]]
    }

    // --- Vignette ---
    if (vignetteAmount !== 0) {
      const px = i % width
      const py = Math.floor(i / width)
      const dx = px - cx
      const dy = py - cy
      const distRatio = (dx * dx + dy * dy) / maxDistSq
      if (distRatio > 0.15) {
        const vWeight = (distRatio - 0.15) / 0.85
        const vFactor = Math.max(0, 1 + vignetteAmount * vWeight * 0.9)
        r *= vFactor
        g *= vFactor
        b *= vFactor
      }
    }

    // --- Fade (Матовость / Black point lift) ---
    if (adjustments.fade && adjustments.fade > 0) {
      const fadeNorm = adjustments.fade / 100
      const lift = fadeNorm * 38
      const comp = 1 - fadeNorm * 0.1
      r = r * comp + lift * (1 - r / 255)
      g = g * comp + lift * (1 - g / 255)
      b = b * comp + lift * (1 - b / 255)
    }

    // --- Film Grain ---
    if (grainAmount > 0) {
      // Grain is strongest in midtones (bell curve around 0.5) and tapers at pure black/white
      const midWeight = 1 - 2 * Math.abs(normLum - 0.5)
      const gIntensity = Math.max(0.25, midWeight) * grainAmount * 34
      const noise = GRAIN_TABLE[(i * 7 + (i >> 2) * 13) % GRAIN_TABLE_SIZE] * gIntensity
      r += noise
      g += noise
      b += noise
    }

    // Final Output Clamping
    data[idx] = Math.max(0, Math.min(255, Math.round(r)))
    data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)))
    data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)))
  }

  // Combined Edge & Detail pass (Sharpen, Micro-Texture, Noise Reduction)
  if (adjustments.sharpen > 0 || textureVal !== 0 || noiseReductionVal > 0) {
    applyDetailEnhancements(imageData, adjustments.sharpen / 100, textureVal, noiseReductionVal)
  }
}

function applyDetailEnhancements(
  imageData: ImageData,
  sharpenAmount: number,
  textureAmount: number,
  noiseReductionAmount: number
) {
  const src = new Uint8ClampedArray(imageData.data)
  const data = imageData.data
  const w = imageData.width
  const h = imageData.height

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4

      for (let c = 0; c < 3; c++) {
        const center = src[idx + c]
        const top = src[((y - 1) * w + x) * 4 + c]
        const bottom = src[((y + 1) * w + x) * 4 + c]
        const left = src[(y * w + (x - 1)) * 4 + c]
        const right = src[(y * w + (x + 1)) * 4 + c]

        const laplacian = 4 * center - (top + bottom + left + right)
        const absLap = Math.abs(laplacian)
        let delta = 0

        // 1. Noise Reduction: Smooths flat low-contrast noise patches
        if (noiseReductionAmount > 0 && absLap < 18) {
          const avg = (top + bottom + left + right) * 0.25
          const smoothFactor = noiseReductionAmount * (1 - absLap / 18) * 0.6
          delta += (avg - center) * smoothFactor
        }

        // 2. Texture: Enhances fine micro-contrast without haloing high-contrast edges
        if (textureAmount !== 0 && absLap >= 4 && absLap <= 50) {
          delta += laplacian * (textureAmount * 0.45)
        }

        // 3. Sharpen: Sharpens visible edges
        if (sharpenAmount > 0) {
          delta += laplacian * (sharpenAmount * 0.75)
        }

        data[idx + c] = Math.max(0, Math.min(255, Math.round(center + delta)))
      }
    }
  }
}

/**
 * Computes live RGB and Luminance Histogram (256 bins each)
 */
export function computeHistogram(imageData: ImageData) {
  const rBins = new Uint32Array(256)
  const gBins = new Uint32Array(256)
  const bBins = new Uint32Array(256)
  const lBins = new Uint32Array(256)

  const data = imageData.data
  const len = data.length

  for (let i = 0; i < len; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

    rBins[r]++
    gBins[g]++
    bBins[b]++
    lBins[l]++
  }

  return { rBins, gBins, bBins, lBins }
}
