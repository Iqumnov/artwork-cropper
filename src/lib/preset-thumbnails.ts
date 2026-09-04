import { Preset, LightroomAdjustments } from '../types'
import { applyLightroomAdjustments } from './color-engine'
import { getDefaultAdjustments } from './presets'

const thumbnailCache = new Map<string, string>()
let baseLandscapeCanvas: HTMLCanvasElement | null = null
let baseLandscapeLoaded = false
let baseLandscapePromise: Promise<HTMLCanvasElement | null> | null = null

const THUMB_W = 360
const THUMB_H = 240

/**
 * Loads the reference natural landscape image onto an offscreen canvas
 */
function loadBaseLandscape(): Promise<HTMLCanvasElement | null> {
  if (baseLandscapeLoaded && baseLandscapeCanvas) {
    return Promise.resolve(baseLandscapeCanvas)
  }
  if (baseLandscapePromise) {
    return baseLandscapePromise
  }

  baseLandscapePromise = new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = THUMB_W
      canvas.height = THUMB_H
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, THUMB_W, THUMB_H)
        baseLandscapeCanvas = canvas
        baseLandscapeLoaded = true
        resolve(canvas)
      } else {
        resolve(null)
      }
    }
    img.onerror = () => {
      // Fallback: draw a pleasant scenic landscape canvas with mountains, lake and sky
      const canvas = document.createElement('canvas')
      canvas.width = THUMB_W
      canvas.height = THUMB_H
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, THUMB_H * 0.5)
        skyGrad.addColorStop(0, '#5b9bd5')
        skyGrad.addColorStop(1, '#d0e5f5')
        ctx.fillStyle = skyGrad
        ctx.fillRect(0, 0, THUMB_W, THUMB_H * 0.5)

        // Distant Mountains
        ctx.fillStyle = '#6b7a8a'
        ctx.beginPath()
        ctx.moveTo(0, THUMB_H * 0.45)
        ctx.lineTo(THUMB_W * 0.25, THUMB_H * 0.2)
        ctx.lineTo(THUMB_W * 0.5, THUMB_H * 0.35)
        ctx.lineTo(THUMB_W * 0.75, THUMB_H * 0.15)
        ctx.lineTo(THUMB_W, THUMB_H * 0.4)
        ctx.lineTo(THUMB_W, THUMB_H * 0.5)
        ctx.lineTo(0, THUMB_H * 0.5)
        ctx.fill()

        // Green Lake
        const lakeGrad = ctx.createLinearGradient(0, THUMB_H * 0.5, 0, THUMB_H)
        lakeGrad.addColorStop(0, '#2d7082')
        lakeGrad.addColorStop(1, '#1b4b57')
        ctx.fillStyle = lakeGrad
        ctx.fillRect(0, THUMB_H * 0.5, THUMB_W, THUMB_H * 0.5)

        baseLandscapeCanvas = canvas
        baseLandscapeLoaded = true
        resolve(canvas)
      } else {
        resolve(null)
      }
    }
    img.src = '/nature_landscape.webp'
  })

  return baseLandscapePromise
}

/**
 * Generates an authentic nature preview for a specific preset
 */
export async function getPresetNatureThumbnail(preset: Preset): Promise<string> {
  const cacheKey = `${preset.id}_${JSON.stringify(preset.adjustments)}`
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!
  }

  const base = await loadBaseLandscape()
  if (!base) return ''

  const canvas = document.createElement('canvas')
  canvas.width = THUMB_W
  canvas.height = THUMB_H
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return ''

  // Draw base landscape
  ctx.drawImage(base, 0, 0)

  // Merge full default adjustments with preset adjustments
  const merged: LightroomAdjustments = {
    ...getDefaultAdjustments(),
    ...preset.adjustments,
  }

  // Apply real lightroom adjustments to thumbnail
  const imageData = ctx.getImageData(0, 0, THUMB_W, THUMB_H)
  applyLightroomAdjustments(imageData, merged)
  ctx.putImageData(imageData, 0, 0)

  const dataUrl = canvas.toDataURL('image/webp', 0.95)
  thumbnailCache.set(cacheKey, dataUrl)
  return dataUrl
}
