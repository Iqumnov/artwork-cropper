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
    { x: Math.round(naturalWidth * 0.06), y: Math.round(naturalHeight * 0.06) },
    { x: Math.round(naturalWidth * 0.94), y: Math.round(naturalHeight * 0.06) },
    { x: Math.round(naturalWidth * 0.94), y: Math.round(naturalHeight * 0.94) },
    { x: Math.round(naturalWidth * 0.06), y: Math.round(naturalHeight * 0.94) }
  ]

  try {
    const canvas = document.createElement('canvas')
    const maxDim = 280
    const scale = Math.min(maxDim / naturalWidth, maxDim / naturalHeight)
    const w = Math.max(20, Math.round(naturalWidth * scale))
    const h = Math.max(20, Math.round(naturalHeight * scale))
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return defaultCorners

    ctx.drawImage(sourceImage, 0, 0, w, h)
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data

    const luma = new Float32Array(w * h)
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4
      luma[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
    }

    let bgSum = 0
    let bgCount = 0
    const borderThickness = Math.max(2, Math.round(Math.min(w, h) * 0.04))

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x < borderThickness || x >= w - borderThickness || y < borderThickness || y >= h - borderThickness) {
          bgSum += luma[y * w + x]
          bgCount++
        }
      }
    }
    const bgLuma = bgCount > 0 ? bgSum / bgCount : 128

    const numRays = 16
    const topPts: { x: number; y: number }[] = []
    const bottomPts: { x: number; y: number }[] = []
    const leftPts: { x: number; y: number }[] = []
    const rightPts: { x: number; y: number }[] = []

    const maxRayDepthY = Math.round(h * 0.42)
    const maxRayDepthX = Math.round(w * 0.42)
    const contrastThreshold = 22

    for (let i = 1; i <= numRays; i++) {
      const x = Math.round((i / (numRays + 1)) * w)

      for (let y = borderThickness; y < maxRayDepthY; y++) {
        const diff = Math.abs(luma[y * w + x] - bgLuma)
        const grad = Math.abs(luma[(y + 1) * w + x] - luma[(y - 1) * w + x])
        if (diff > contrastThreshold || grad > 25) {
          topPts.push({ x, y })
          break
        }
      }

      for (let y = h - 1 - borderThickness; y > h - 1 - maxRayDepthY; y--) {
        const diff = Math.abs(luma[y * w + x] - bgLuma)
        const grad = Math.abs(luma[(y - 1) * w + x] - luma[(y + 1) * w + x])
        if (diff > contrastThreshold || grad > 25) {
          bottomPts.push({ x, y })
          break
        }
      }
    }

    for (let i = 1; i <= numRays; i++) {
      const y = Math.round((i / (numRays + 1)) * h)

      for (let x = borderThickness; x < maxRayDepthX; x++) {
        const diff = Math.abs(luma[y * w + x] - bgLuma)
        const grad = Math.abs(luma[y * w + (x + 1)] - luma[y * w + (x - 1)])
        if (diff > contrastThreshold || grad > 25) {
          leftPts.push({ x, y })
          break
        }
      }

      for (let x = w - 1 - borderThickness; x > w - 1 - maxRayDepthX; x--) {
        const diff = Math.abs(luma[y * w + x] - bgLuma)
        const grad = Math.abs(luma[y * w + (x - 1)] - luma[y * w + (x + 1)])
        if (diff > contrastThreshold || grad > 25) {
          rightPts.push({ x, y })
          break
        }
      }
    }

    if (topPts.length >= 4 && bottomPts.length >= 4 && leftPts.length >= 4 && rightPts.length >= 4) {
      const fitHLine = (pts: { x: number; y: number }[]) => {
        let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0
        const n = pts.length
        for (const p of pts) {
          sumX += p.x
          sumY += p.y
          sumXX += p.x * p.x
          sumXY += p.x * p.y
        }
        const denom = n * sumXX - sumX * sumX
        const a = Math.abs(denom) > 1e-4 ? (n * sumXY - sumX * sumY) / denom : 0
        const b = (sumY - a * sumX) / n
        return { a, b }
      }

      const fitVLine = (pts: { x: number; y: number }[]) => {
        let sumX = 0, sumY = 0, sumYY = 0, sumXY = 0
        const n = pts.length
        for (const p of pts) {
          sumX += p.x
          sumY += p.y
          sumYY += p.y * p.y
          sumXY += p.x * p.y
        }
        const denom = n * sumYY - sumY * sumY
        const a = Math.abs(denom) > 1e-4 ? (n * sumXY - sumX * sumY) / denom : 0
        const b = (sumX - a * sumY) / n
        return { a, b }
      }

      const topL = fitHLine(topPts)
      const botL = fitHLine(bottomPts)
      const leftL = fitVLine(leftPts)
      const rightL = fitVLine(rightPts)

      const intersect = (hLine: { a: number; b: number }, vLine: { a: number; b: number }) => {
        const denom = 1 - hLine.a * vLine.a
        if (Math.abs(denom) < 1e-4) return { x: 0, y: 0 }
        const y = (hLine.a * vLine.b + hLine.b) / denom
        const x = vLine.a * y + vLine.b
        return {
          x: Math.max(0, Math.min(naturalWidth, Math.round(x / scale))),
          y: Math.max(0, Math.min(naturalHeight, Math.round(y / scale)))
        }
      }

      const tl = intersect(topL, leftL)
      const tr = intersect(topL, rightL)
      const br = intersect(botL, rightL)
      const bl = intersect(botL, leftL)

      const candidate: ScanPoint[] = [tl, tr, br, bl]
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
    a.push([-sx, -sy, -1, 0, 0, 0, sx * dx, sy * dx, dx])
    a.push([0, 0, 0, -sx, -sy, -1, sx * dy, sy * dy, dy])
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

  // 1. Try OpenCV if available
  if (isOpenCVAvailable()) {
    try {
      const cv = (window as any).cv
      let srcMat: any
      if (sourceImage instanceof HTMLCanvasElement) {
        srcMat = cv.imread(sourceImage)
      } else {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = naturalWidth
        tempCanvas.height = naturalHeight
        const tCtx = tempCanvas.getContext('2d')!
        tCtx.drawImage(sourceImage, 0, 0)
        srcMat = cv.imread(tempCanvas)
      }

      const dstMat = new cv.Mat()
      const dsize = new cv.Size(targetWidth, targetHeight)

      const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        points[0].x, points[0].y,
        points[1].x, points[1].y,
        points[2].x, points[2].y,
        points[3].x, points[3].y,
      ])

      const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        targetWidth, 0,
        targetWidth, targetHeight,
        0, targetHeight,
      ])

      const M = cv.getPerspectiveTransform(srcTri, dstTri)
      cv.warpPerspective(srcMat, dstMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(0, 0, 0, 0))

      const outputCanvas = document.createElement('canvas')
      cv.imshow(outputCanvas, dstMat)

      srcMat.delete()
      dstMat.delete()
      srcTri.delete()
      dstTri.delete()
      M.delete()

      return outputCanvas
    } catch (e) {
      console.warn('OpenCV warp failed, falling back to pure Canvas homography:', e)
    }
  }

  // 2. Pure Canvas Homography Mesh Subdivision Fallback (Zero dependency, high speed)
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = targetWidth
  outputCanvas.height = targetHeight
  const ctx = outputCanvas.getContext('2d')
  if (!ctx) return outputCanvas

  // Create source canvas for reading
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = naturalWidth
  srcCanvas.height = naturalHeight
  const srcCtx = srcCanvas.getContext('2d')!
  srcCtx.drawImage(sourceImage, 0, 0)

  // Subdivide quadrilateral into triangular mesh (16x16 grid)
  const subdivisions = 16
  const dstCorners: ScanPoint[] = [
    { x: 0, y: 0 },
    { x: targetWidth, y: 0 },
    { x: targetWidth, y: targetHeight },
    { x: 0, y: targetHeight }
  ]

  const H_inv = getHomographyMatrix(dstCorners, points)
  if (!H_inv) {
    // If matrix singular, draw bounding box
    ctx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight)
    return outputCanvas
  }

  const mapDstToSrc = (x: number, y: number): ScanPoint => {
    const denom = H_inv[6] * x + H_inv[7] * y + H_inv[8]
    return {
      x: (H_inv[0] * x + H_inv[1] * y + H_inv[2]) / denom,
      y: (H_inv[3] * x + H_inv[4] * y + H_inv[5]) / denom
    }
  }

  // Draw grid of warped triangles
  const stepX = targetWidth / subdivisions
  const stepY = targetHeight / subdivisions

  for (let i = 0; i < subdivisions; i++) {
    for (let j = 0; j < subdivisions; j++) {
      const x0 = i * stepX
      const y0 = j * stepY
      const x1 = (i + 1) * stepX
      const y1 = (j + 1) * stepY

      const s0 = mapDstToSrc(x0, y0)
      const s1 = mapDstToSrc(x1, y0)
      const s2 = mapDstToSrc(x0, y1)
      const s3 = mapDstToSrc(x1, y1)

      // Upper triangle (s0, s1, s2) -> (x0, y0), (x1, y0), (x0, y1)
      drawWarpedTriangle(ctx, srcCanvas, s0, s1, s2, { x: x0, y: y0 }, { x: x1, y: y0 }, { x: x0, y: y1 })
      // Lower triangle (s1, s3, s2) -> (x1, y0), (x1, y1), (x0, y1)
      drawWarpedTriangle(ctx, srcCanvas, s1, s3, s2, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 })
    }
  }

  return outputCanvas
}

function drawWarpedTriangle(
  ctx: CanvasRenderingContext2D,
  srcImg: CanvasImageSource,
  s0: ScanPoint, s1: ScanPoint, s2: ScanPoint,
  d0: ScanPoint, d1: ScanPoint, d2: ScanPoint
) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(d0.x, d0.y)
  ctx.lineTo(d1.x, d1.y)
  ctx.lineTo(d2.x, d2.y)
  ctx.closePath()
  ctx.clip()

  // Solve affine transform matrix for triangle
  const denom = (s0.x * (s1.y - s2.y) - s1.x * (s0.y - s2.y) + s2.x * (s0.y - s1.y))
  if (Math.abs(denom) < 1e-6) {
    ctx.restore()
    return
  }

  const a = (d0.x * (s1.y - s2.y) - d1.x * (s0.y - s2.y) + d2.x * (s0.y - s1.y)) / denom
  const b = (d0.y * (s1.y - s2.y) - d1.y * (s0.y - s2.y) + d2.y * (s0.y - s1.y)) / denom
  const c = (s0.x * (d1.x - d2.x) - s1.x * (d0.x - d2.x) + s2.x * (d0.x - d1.x)) / denom
  const d = (s0.x * (d1.y - d2.y) - s1.x * (d0.y - d2.y) + s2.x * (d0.y - d1.y)) / denom
  const e = (s0.x * (s1.y * d2.x - s2.y * d1.x) - s1.x * (s0.y * d2.x - s2.y * d0.x) + s2.x * (s0.y * d1.x - s1.y * d0.x)) / denom
  const f = (s0.x * (s1.y * d2.y - s2.y * d1.y) - s1.x * (s0.y * d2.y - s2.y * d0.y) + s2.x * (s0.y * d1.y - s1.y * d0.y)) / denom

  ctx.transform(a, b, c, d, e, f)
  ctx.drawImage(srcImg, 0, 0)
  ctx.restore()
}
