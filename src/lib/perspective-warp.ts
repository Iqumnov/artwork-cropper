import { ScanPoint } from '../types'

// Dynamic OpenCV loader
let opencvLoadPromise: Promise<boolean> | null = null
let isOpenCVLoaded = false

export async function loadOpenCV(): Promise<boolean> {
  if (isOpenCVLoaded && (window as any).cv?.Mat) {
    return true
  }

  if (opencvLoadPromise) {
    return opencvLoadPromise
  }

  opencvLoadPromise = (async () => {
    try {
      if ((window as any).cv?.Mat) {
        isOpenCVLoaded = true
        return true
      }

      const script = document.createElement('script')
      script.src = 'https://docs.opencv.org/4.x/opencv.js'
      script.async = true

      const loadPromise = new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        setTimeout(() => reject(new Error('OpenCV load timeout')), 15000)
      })

      document.head.appendChild(script)
      await loadPromise

      await new Promise<void>((resolve) => {
        const check = () => {
          if ((window as any).cv?.Mat) {
            resolve()
          } else {
            setTimeout(check, 100)
          }
        }
        check()
      })

      isOpenCVLoaded = true
      return true
    } catch (e) {
      console.warn('OpenCV not loaded, using built-in canvas perspective warp fallback:', e)
      isOpenCVLoaded = false
      return false
    }
  })()

  return opencvLoadPromise
}

export function isOpenCVAvailable(): boolean {
  return isOpenCVLoaded && !!(window as any).cv?.Mat
}

// Distance helper
export function pointDistance(p1: ScanPoint, p2: ScanPoint): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// Polygon area calculation
export function calculatePolygonArea(points: ScanPoint[]): number {
  if (points.length < 3) return 0
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area / 2)
}

// Convexity check
export function isConvexPolygon(points: ScanPoint[]): boolean {
  if (points.length !== 4) return false
  let sign = 0
  for (let i = 0; i < 4; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % 4]
    const p3 = points[(i + 2) % 4]
    const cross = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x)
    if (cross !== 0) {
      if (sign === 0) {
        sign = cross > 0 ? 1 : -1
      } else if ((cross > 0 ? 1 : -1) !== sign) {
        return false
      }
    }
  }
  return true
}

// Validation logic matching /artei
export function validateScanPoints(
  points: ScanPoint[],
  imageDims: { width: number; height: number }
): boolean {
  if (points.length !== 4) return false

  const area = calculatePolygonArea(points)
  const minArea = (imageDims.width * imageDims.height) * 0.04
  if (area < minArea) return false

  if (!isConvexPolygon(points)) return false

  const diagonal = Math.hypot(imageDims.width, imageDims.height)
  const minDistance = diagonal * 0.06

  for (let i = 0; i < 4; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % 4]
    if (pointDistance(p1, p2) < minDistance) {
      return false
    }
  }

  return true
}

export function orderCorners(pts: ScanPoint[]): ScanPoint[] {
  if (pts.length !== 4) return pts
  const cx = pts.reduce((sum, p) => sum + p.x, 0) / 4
  const cy = pts.reduce((sum, p) => sum + p.y, 0) / 4

  const withAngle = pts.map(p => ({
    p,
    angle: Math.atan2(p.y - cy, p.x - cx)
  }))
  withAngle.sort((a, b) => a.angle - b.angle)

  let tlIdx = 0
  let minSum = Infinity
  for (let i = 0; i < 4; i++) {
    const sum = withAngle[i].p.x + withAngle[i].p.y
    if (sum < minSum) {
      minSum = sum
      tlIdx = i
    }
  }

  return [
    withAngle[tlIdx].p,
    withAngle[(tlIdx + 1) % 4].p,
    withAngle[(tlIdx + 2) % 4].p,
    withAngle[(tlIdx + 3) % 4].p
  ]
}

/**
 * Automatically detects the 4 corners of an artwork or document.
 * 1. Checks OpenCV if loaded.
 * 2. Uses lightning-fast pure-Canvas gradient ray-casting & quad fitting fallback (100% offline).
 */
export async function detectDocumentCorners(
  sourceImage: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number
): Promise<ScanPoint[]> {
  if (isOpenCVAvailable()) {
    try {
      const cvCorners = detectWithOpenCV(sourceImage, naturalWidth, naturalHeight)
      if (cvCorners && validateScanPoints(cvCorners, { width: naturalWidth, height: naturalHeight })) {
        return cvCorners
      }
    } catch (e) {
      console.warn('OpenCV corner detection error:', e)
    }
  }

  return detectWithCanvasEdges(sourceImage, naturalWidth, naturalHeight)
}

function detectWithOpenCV(
  sourceImage: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number
): ScanPoint[] | null {
  const cv = (window as any).cv
  const tempCanvas = document.createElement('canvas')
  const maxDim = 480
  const scale = Math.min(1, maxDim / Math.max(naturalWidth, naturalHeight))
  tempCanvas.width = Math.round(naturalWidth * scale)
  tempCanvas.height = Math.round(naturalHeight * scale)
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(sourceImage, 0, 0, tempCanvas.width, tempCanvas.height)

  const srcMat = cv.imread(tempCanvas)
  const gray = new cv.Mat()
  cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY)
  cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)

  const edges = new cv.Mat()
  cv.Canny(gray, edges, 40, 140)

  const contours = new cv.MatVector()
  const hierarchy = new cv.Mat()
  cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

  let maxArea = 0
  let bestQuad: ScanPoint[] | null = null

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i)
    const peri = cv.arcLength(cnt, true)

    for (const epsFactor of [0.015, 0.02, 0.03, 0.04]) {
      const approx = new cv.Mat()
      cv.approxPolyDP(cnt, approx, epsFactor * peri, true)

      if (approx.rows === 4) {
        const area = cv.contourArea(approx)
        if (area > maxArea && area > tempCanvas.width * tempCanvas.height * 0.15) {
          const pts: ScanPoint[] = []
          for (let j = 0; j < 4; j++) {
            pts.push({
              x: Math.round(approx.data32S[j * 2] / scale),
              y: Math.round(approx.data32S[j * 2 + 1] / scale)
            })
          }
          if (isConvexPolygon(pts)) {
            maxArea = area
            bestQuad = pts
          }
        }
      }
      approx.delete()
      if (bestQuad) break
    }
    cnt.delete()
  }

  srcMat.delete()
  gray.delete()
  edges.delete()
  contours.delete()
  hierarchy.delete()

  if (bestQuad && bestQuad.length === 4) {
    return orderCorners(bestQuad)
  }

  return null
}

function detectWithCanvasEdges(
  sourceImage: CanvasImageSource,
  naturalWidth: number,
  naturalHeight: number
): ScanPoint[] {
  const defaultCorners: ScanPoint[] = [
    { x: Math.round(naturalWidth * 0.05), y: Math.round(naturalHeight * 0.05) },
    { x: Math.round(naturalWidth * 0.95), y: Math.round(naturalHeight * 0.05) },
    { x: Math.round(naturalWidth * 0.95), y: Math.round(naturalHeight * 0.95) },
    { x: Math.round(naturalWidth * 0.05), y: Math.round(naturalHeight * 0.95) }
  ]

  try {
    const canvas = document.createElement('canvas')
    const maxDim = 540
    const scale = Math.min(maxDim / naturalWidth, maxDim / naturalHeight)
    const w = Math.max(60, Math.round(naturalWidth * scale))
    const h = Math.max(60, Math.round(naturalHeight * scale))
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return defaultCorners

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(sourceImage, 0, 0, w, h)
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data

    // 1. Grayscale luminance and robust background color estimation from 4 outer corners
    const luma = new Float32Array(w * h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        luma[y * w + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
      }
    }

    const rimX = Math.max(4, Math.round(w * 0.08))
    const rimY = Math.max(4, Math.round(h * 0.08))
    const rSamples: number[] = []
    const gSamples: number[] = []
    const bSamples: number[] = []

    for (let y = 0; y < rimY; y++) {
      for (let x = 0; x < rimX; x++) {
        const idxTL = (y * w + x) * 4
        rSamples.push(data[idxTL]); gSamples.push(data[idxTL + 1]); bSamples.push(data[idxTL + 2])
        const idxTR = (y * w + (w - 1 - x)) * 4
        rSamples.push(data[idxTR]); gSamples.push(data[idxTR + 1]); bSamples.push(data[idxTR + 2])
        const idxBL = ((h - 1 - y) * w + x) * 4
        rSamples.push(data[idxBL]); gSamples.push(data[idxBL + 1]); bSamples.push(data[idxBL + 2])
        const idxBR = ((h - 1 - y) * w + (w - 1 - x)) * 4
        rSamples.push(data[idxBR]); gSamples.push(data[idxBR + 1]); bSamples.push(data[idxBR + 2])
      }
    }

    rSamples.sort((a, b) => a - b)
    gSamples.sort((a, b) => a - b)
    bSamples.sort((a, b) => a - b)
    const midIdx = Math.floor(rSamples.length / 2)
    const bgR = rSamples[midIdx] ?? 240
    const bgG = gSamples[midIdx] ?? 240
    const bgB = bSamples[midIdx] ?? 240

    // 2. Gaussian blur (3x3) on luma map to reduce noise before gradient computation
    const blurred = new Float32Array(w * h)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        blurred[y * w + x] =
          (luma[(y-1)*w+(x-1)] + 2*luma[(y-1)*w+x] + luma[(y-1)*w+(x+1)] +
           2*luma[y*w+(x-1)]   + 4*luma[y*w+x]     + 2*luma[y*w+(x+1)] +
           luma[(y+1)*w+(x-1)] + 2*luma[(y+1)*w+x] + luma[(y+1)*w+(x+1)]) / 16
      }
    }

    // 3. 2D Sobel Gradient Magnitude Map (on blurred luma)
    const grad = new Float32Array(w * h)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx =
          -blurred[(y - 1) * w + (x - 1)] + blurred[(y - 1) * w + (x + 1)]
          - 2 * blurred[y * w + (x - 1)] + 2 * blurred[y * w + (x + 1)]
          - blurred[(y + 1) * w + (x - 1)] + blurred[(y + 1) * w + (x + 1)]

        const gy =
          -blurred[(y - 1) * w + (x - 1)] - 2 * blurred[(y - 1) * w + x] - blurred[(y - 1) * w + (x + 1)]
          + blurred[(y + 1) * w + (x - 1)] + 2 * blurred[(y + 1) * w + x] + blurred[(y + 1) * w + (x + 1)]

        grad[y * w + x] = Math.hypot(gx, gy)
      }
    }

    // Adaptive edge threshold: 80th percentile of non-zero gradient values
    const nonZeroGrads: number[] = []
    for (let i = 0; i < grad.length; i++) { if (grad[i] > 0) nonZeroGrads.push(grad[i]) }
    nonZeroGrads.sort((a, b) => a - b)
    const adaptiveThreshold = nonZeroGrads.length > 0
      ? nonZeroGrads[Math.floor(nonZeroGrads.length * 0.80)] * 0.3
      : 20

    const getBgDist = (x: number, y: number) => {
      const idx = (y * w + x) * 4
      const dr = data[idx] - bgR
      const dg = data[idx + 1] - bgG
      const db = data[idx + 2] - bgB
      return Math.sqrt(dr * dr + dg * dg + db * db)
    }

    // 3. Dense Inward Ray-Casting (48 rays per side) with global boundary peak detection
    const numRays = 48
    const topPts: { x: number; y: number }[] = []
    const botPts: { x: number; y: number }[] = []
    const leftPts: { x: number; y: number }[] = []
    const rightPts: { x: number; y: number }[] = []

    const minDepthY = Math.max(3, Math.round(h * 0.012))
    const maxDepthY = Math.round(h * 0.46)
    const minDepthX = Math.max(3, Math.round(w * 0.012))
    const maxDepthX = Math.round(w * 0.46)

    // Top rays: search downward
    for (let i = 1; i <= numRays; i++) {
      const x = Math.round((i / (numRays + 1)) * (w - 2 * rimX) + rimX)
      let bestScore = 0
      let bestY = -1
      for (let y = minDepthY; y < maxDepthY; y++) {
        const g = grad[y * w + x]
        const d = getBgDist(x, y)
        const score = g * 0.65 + d * 0.35
        if (score > bestScore) {
          bestScore = score
          bestY = y
        }
      }
      if (bestY > 0 && bestScore > adaptiveThreshold) topPts.push({ x, y: bestY })
    }

    // Bottom rays: search upward
    for (let i = 1; i <= numRays; i++) {
      const x = Math.round((i / (numRays + 1)) * (w - 2 * rimX) + rimX)
      let bestScore = 0
      let bestY = -1
      for (let y = h - 1 - minDepthY; y > h - 1 - maxDepthY; y--) {
        const g = grad[y * w + x]
        const d = getBgDist(x, y)
        const score = g * 0.65 + d * 0.35
        if (score > bestScore) {
          bestScore = score
          bestY = y
        }
      }
      if (bestY > 0 && bestScore > adaptiveThreshold) botPts.push({ x, y: bestY })
    }

    // Left rays: search inward rightward
    for (let i = 1; i <= numRays; i++) {
      const y = Math.round((i / (numRays + 1)) * (h - 2 * rimY) + rimY)
      let bestScore = 0
      let bestX = -1
      for (let x = minDepthX; x < maxDepthX; x++) {
        const g = grad[y * w + x]
        const d = getBgDist(x, y)
        const score = g * 0.65 + d * 0.35
        if (score > bestScore) {
          bestScore = score
          bestX = x
        }
      }
      if (bestX > 0 && bestScore > adaptiveThreshold) leftPts.push({ x: bestX, y })
    }

    // Right rays: search inward leftward
    for (let i = 1; i <= numRays; i++) {
      const y = Math.round((i / (numRays + 1)) * (h - 2 * rimY) + rimY)
      let bestScore = 0
      let bestX = -1
      for (let x = w - 1 - minDepthX; x > w - 1 - maxDepthX; x--) {
        const g = grad[y * w + x]
        const d = getBgDist(x, y)
        const score = g * 0.65 + d * 0.35
        if (score > bestScore) {
          bestScore = score
          bestX = x
        }
      }
      if (bestX > 0 && bestScore > adaptiveThreshold) rightPts.push({ x: bestX, y })
    }

    // 4. Normal-Form RANSAC & Orthogonal Distance Regression (ODR) line fitting
    interface FittedLine {
      a: number
      b: number
      c: number
    }

    const fitODRLine = (pts: { x: number; y: number }[]): FittedLine | null => {
      if (pts.length < 3) return null
      let sumX = 0, sumY = 0
      const n = pts.length
      for (const p of pts) { sumX += p.x; sumY += p.y }
      const cx = sumX / n
      const cy = sumY / n

      let sxx = 0, syy = 0, sxy = 0
      for (const p of pts) {
        const dx = p.x - cx
        const dy = p.y - cy
        sxx += dx * dx
        syy += dy * dy
        sxy += dx * dy
      }

      const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy)
      const a = -Math.sin(angle)
      const b = Math.cos(angle)
      const c = -(a * cx + b * cy)
      return { a, b, c }
    }

    const ransacLine = (
      pts: { x: number; y: number }[],
      orientation: 'horizontal' | 'vertical',
      threshold: number
    ): FittedLine | null => {
      if (pts.length < 4) return null
      let bestInliers: { x: number; y: number }[] = []
      const iterations = 120  // Increased from 100 for better coverage

      for (let iter = 0; iter < iterations; iter++) {
        const p1 = pts[Math.floor(Math.random() * pts.length)]
        const p2 = pts[Math.floor(Math.random() * pts.length)]
        if (p1 === p2) continue

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.hypot(dx, dy)
        if (dist < 15) continue

        // Angle check: allow up to 65 degree tilt relative to orientation
        if (orientation === 'horizontal') {
          if (Math.abs(dx) < Math.abs(dy) * 0.45) continue
        } else {
          if (Math.abs(dy) < Math.abs(dx) * 0.45) continue
        }

        const a = -dy / dist
        const b = dx / dist
        const c = -(a * p1.x + b * p1.y)

        const inliers = pts.filter(p => Math.abs(a * p.x + b * p.y + c) <= threshold)
        if (inliers.length > bestInliers.length) {
          bestInliers = inliers
          // Early exit: if we have > 85% inliers, this is a great fit
          if (bestInliers.length / pts.length > 0.85) break
        }
      }

      if (bestInliers.length < Math.max(4, Math.round(pts.length * 0.2))) return null
      return fitODRLine(bestInliers)
    }

    const intersectLines = (l1: FittedLine, l2: FittedLine): ScanPoint | null => {
      const denom = l1.a * l2.b - l2.a * l1.b
      if (Math.abs(denom) < 1e-4) return null
      const x = (l1.b * l2.c - l2.b * l1.c) / denom
      const y = (l2.a * l1.c - l1.a * l2.c) / denom
      return {
        x: Math.max(0, Math.min(naturalWidth, Math.round(x / scale))),
        y: Math.max(0, Math.min(naturalHeight, Math.round(y / scale)))
      }
    }

    const topL = ransacLine(topPts, 'horizontal', Math.max(3, h * 0.028))
    const botL = ransacLine(botPts, 'horizontal', Math.max(3, h * 0.028))
    const leftL = ransacLine(leftPts, 'vertical', Math.max(3, w * 0.028))
    const rightL = ransacLine(rightPts, 'vertical', Math.max(3, w * 0.028))

    if (topL && botL && leftL && rightL) {
      const tl = intersectLines(topL, leftL)
      const tr = intersectLines(topL, rightL)
      const br = intersectLines(botL, rightL)
      const bl = intersectLines(botL, leftL)

      if (tl && tr && br && bl) {
        const candidate = orderCorners([tl, tr, br, bl])
        if (validateScanPoints(candidate, { width: naturalWidth, height: naturalHeight })) {
          return candidate
        }
      }
    }

    // 5. Percentile Bounding Box Fallback
    const allPts = [...topPts, ...botPts, ...leftPts, ...rightPts]
    if (allPts.length >= 12) {
      const xs = allPts.map(p => p.x).sort((a, b) => a - b)
      const ys = allPts.map(p => p.y).sort((a, b) => a - b)

      const minX = xs[Math.floor(xs.length * 0.05)]
      const maxX = xs[Math.floor(xs.length * 0.95)]
      const minY = ys[Math.floor(ys.length * 0.05)]
      const maxY = ys[Math.floor(ys.length * 0.95)]

      const candidate = orderCorners([
        { x: Math.round(minX / scale), y: Math.round(minY / scale) },
        { x: Math.round(maxX / scale), y: Math.round(minY / scale) },
        { x: Math.round(maxX / scale), y: Math.round(maxY / scale) },
        { x: Math.round(minX / scale), y: Math.round(maxY / scale) },
      ])
      if (validateScanPoints(candidate, { width: naturalWidth, height: naturalHeight })) {
        return candidate
      }
    }
  } catch (err) {
    console.warn('Canvas edge detection fallback warning:', err)
  }

  return defaultCorners
}

/**
 * Solve 3x3 Homography Matrix mapping src -> dst
 */
function getHomographyMatrix(src: ScanPoint[], dst: ScanPoint[]): number[] | null {
  const a: number[][] = []
  for (let i = 0; i < 4; i++) {
    const sx = src[i].x
    const sy = src[i].y
    const dx = dst[i].x
    const dy = dst[i].y
    a.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx, dx])
    a.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy, dy])
  }

  // Gaussian elimination
  const n = 8
  for (let i = 0; i < n; i++) {
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) {
        maxRow = k
      }
    }
    const temp = a[i]
    a[i] = a[maxRow]
    a[maxRow] = temp

    if (Math.abs(a[i][i]) < 1e-9) return null

    for (let k = i + 1; k < n; k++) {
      const c = a[k][i] / a[i][i]
      for (let j = i; j <= n; j++) {
        a[k][j] -= c * a[i][j]
      }
    }
  }

  const h = new Array(9).fill(1)
  for (let i = n - 1; i >= 0; i--) {
    let sum = a[i][n]
    for (let j = i + 1; j < n; j++) {
      sum -= a[i][j] * h[j]
    }
    h[i] = sum / a[i][i]
  }

  return h
}

/**
 * High quality perspective warp:
 * Uses OpenCV if available, otherwise fast inverse-mapping canvas bilinear interpolation
 */
export function warpPerspectiveCanvas(
  sourceImage: CanvasImageSource,
  points: ScanPoint[],
  naturalWidth: number,
  naturalHeight: number
): HTMLCanvasElement {
  // Output dimensions based on quadrilateral side lengths
  const widthTop = pointDistance(points[0], points[1])
  const widthBottom = pointDistance(points[3], points[2])
  const heightLeft = pointDistance(points[0], points[3])
  const heightRight = pointDistance(points[1], points[2])

  const targetWidth = Math.max(10, Math.round(Math.max(widthTop, widthBottom)))
  const targetHeight = Math.max(10, Math.round(Math.max(heightLeft, heightRight)))

  // Pure Canvas Homography Bilinear Interpolation (100% seamless, NO triangle mesh, NO seams, NO diagonal lines)
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = targetWidth
  outputCanvas.height = targetHeight
  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return outputCanvas

  // Create source canvas for reading
  let srcCanvas: HTMLCanvasElement
  if (sourceImage instanceof HTMLCanvasElement) {
    srcCanvas = sourceImage
  } else {
    srcCanvas = document.createElement('canvas')
    srcCanvas.width = naturalWidth
    srcCanvas.height = naturalHeight
    const srcCtx = srcCanvas.getContext('2d')!
    srcCtx.drawImage(sourceImage, 0, 0)
  }

  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })
  if (!srcCtx) return outputCanvas

  const srcImageData = srcCtx.getImageData(0, 0, naturalWidth, naturalHeight)
  const srcData = srcImageData.data

  const dstCorners: ScanPoint[] = [
    { x: 0, y: 0 },
    { x: targetWidth, y: 0 },
    { x: targetWidth, y: targetHeight },
    { x: 0, y: targetHeight }
  ]

  const H_inv = getHomographyMatrix(dstCorners, points)
  if (!H_inv) {
    // If matrix singular, draw direct bounding box
    ctx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight)
    return outputCanvas
  }

  const dstImageData = ctx.createImageData(targetWidth, targetHeight)
  const dstData = dstImageData.data

  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = H_inv
  const maxSrcX = naturalWidth - 1
  const maxSrcY = naturalHeight - 1

  let dstIdx = 0
  for (let y = 0; y < targetHeight; y++) {
    const numX_base = h1 * y + h2
    const numY_base = h4 * y + h5
    const denom_base = h7 * y + h8

    for (let x = 0; x < targetWidth; x++) {
      const curDenom = h6 * x + denom_base
      if (curDenom === 0) {
        dstData[dstIdx + 3] = 255
        dstIdx += 4
        continue
      }

      const invDenom = 1 / curDenom
      const rawSrcX = (h0 * x + numX_base) * invDenom
      const rawSrcY = (h3 * x + numY_base) * invDenom

      // Clamp cleanly to source boundaries to prevent transparent edges
      const srcX = Math.max(0, Math.min(maxSrcX, rawSrcX))
      const srcY = Math.max(0, Math.min(maxSrcY, rawSrcY))

      const x0 = Math.floor(srcX)
      const y0 = Math.floor(srcY)
      const x1 = Math.min(x0 + 1, maxSrcX)
      const y1 = Math.min(y0 + 1, maxSrcY)

      const fx = srcX - x0
      const fy = srcY - y0

      const w00 = (1 - fx) * (1 - fy)
      const w10 = fx * (1 - fy)
      const w01 = (1 - fx) * fy
      const w11 = fx * fy

      const idx00 = (y0 * naturalWidth + x0) * 4
      const idx10 = (y0 * naturalWidth + x1) * 4
      const idx01 = (y1 * naturalWidth + x0) * 4
      const idx11 = (y1 * naturalWidth + x1) * 4

      dstData[dstIdx] = Math.round(srcData[idx00] * w00 + srcData[idx10] * w10 + srcData[idx01] * w01 + srcData[idx11] * w11)
      dstData[dstIdx + 1] = Math.round(srcData[idx00 + 1] * w00 + srcData[idx10 + 1] * w10 + srcData[idx01 + 1] * w01 + srcData[idx11 + 1] * w11)
      dstData[dstIdx + 2] = Math.round(srcData[idx00 + 2] * w00 + srcData[idx10 + 2] * w10 + srcData[idx01 + 2] * w01 + srcData[idx11 + 2] * w11)
      const alpha = Math.round(srcData[idx00 + 3] * w00 + srcData[idx10 + 3] * w10 + srcData[idx01 + 3] * w01 + srcData[idx11 + 3] * w11)
      dstData[dstIdx + 3] = alpha >= 250 ? 255 : alpha
      dstIdx += 4
    }
  }

  ctx.putImageData(dstImageData, 0, 0)
  return outputCanvas
}
