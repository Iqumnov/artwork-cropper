import { LightroomAdjustments, ColorChannel, ToneCurvePoint } from '../types'

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

  // Curves LUTs
  const curveRGB = buildCurveLUT(adjustments.curves.rgb)
  const curveR = buildCurveLUT(adjustments.curves.red)
  const curveG = buildCurveLUT(adjustments.curves.green)
  const curveB = buildCurveLUT(adjustments.curves.blue)

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

    // --- Dehaze & Clarity Midtone Contrast ---
    if (dehazeBoost !== 0 || clarityVal !== 0) {
      const midWeight = 1 - 2 * Math.abs(normLum - 0.5)
      const clarityDelta = (clarityVal * 25 + dehazeBoost * 20) * midWeight
      r += (r - 128) * (clarityDelta / 255)
      g += (g - 128) * (clarityDelta / 255)
      b += (b - 128) * (clarityDelta / 255)
    }

    // Clamp before color conversions
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))

    // --- Saturation & Vibrance & HSL Mixer ---
    if (globalSat !== 1 || vibranceAmount !== 0 || hasHslMixer) {
      let [h, s, l] = rgbToHsl(r, g, b)

      // HSL Mixer adjustments
      if (hasHslMixer) {
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
      }

      // Vibrance (protects already saturated colors)
      if (vibranceAmount !== 0) {
        const vibFactor = 1 + vibranceAmount * (1 - s) * 1.5
        s = Math.max(0, Math.min(1, s * vibFactor))
      }

      // Saturation
      if (globalSat !== 1) {
        s = Math.max(0, Math.min(1, s * globalSat))
      }

      const [newR, newG, newB] = hslToRgb(h, s, l)
      r = newR
      g = newG
      b = newB
    }

    // --- Color Grading / Split Toning with Midtones & Balance ---
    if (shadowSat > 0 && normLum < midPoint + 0.1) {
      const w = Math.pow(Math.max(0, 1 - normLum / (midPoint + 0.1)), 2) * shadowSat * 0.4
      r = r * (1 - w) + sR * w
      g = g * (1 - w) + sG * w
      b = b * (1 - w) + sB * w
    }

    if (midSat > 0) {
      const midDist = Math.abs(normLum - midPoint)
      if (midDist < 0.35) {
        const w = Math.cos((midDist / 0.35) * (Math.PI / 2)) * midSat * 0.35
        r = r * (1 - w) + mR * w
        g = g * (1 - w) + mG * w
        b = b * (1 - w) + mB * w
      }
    }

    if (highSat > 0 && normLum > midPoint - 0.1) {
      const w = Math.pow(Math.max(0, (normLum - (midPoint - 0.1)) / (1 - (midPoint - 0.1))), 2) * highSat * 0.4
      r = r * (1 - w) + hR * w
      g = g * (1 - w) + hG * w
      b = b * (1 - w) + hB * w
    }

    // --- Curves ---
    let rIdx = Math.max(0, Math.min(255, Math.round(r)))
    let gIdx = Math.max(0, Math.min(255, Math.round(g)))
    let bIdx = Math.max(0, Math.min(255, Math.round(b)))

    r = curveRGB[curveR[rIdx]]
    g = curveRGB[curveG[gIdx]]
    b = curveRGB[curveB[bIdx]]

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

    // Final Output Clamping
    data[idx] = Math.max(0, Math.min(255, Math.round(r)))
    data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)))
    data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)))
  }

  // Sharpen pass (if sharpen > 0)
  if (adjustments.sharpen > 0) {
    applySharpenFilter(imageData, adjustments.sharpen / 100)
  }
}

function applySharpenFilter(imageData: ImageData, amount: number) {
  const src = new Uint8ClampedArray(imageData.data)
  const data = imageData.data
  const w = imageData.width
  const h = imageData.height
  const weight = amount * 0.8

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
        data[idx + c] = Math.max(0, Math.min(255, Math.round(center + laplacian * weight)))
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
