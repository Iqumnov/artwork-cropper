import UTIF from 'utif'

export interface LoadedImageResult {
  dataUrl: string
  width: number
  height: number
  format: string
}

/**
 * Robustly decodes any image format, including:
 * - Apple ProRAW (.dng)
 * - Lossless TIFF (.tiff, .tif)
 * - Apple HEIC / HEIF (.heic, .heif)
 * - PNG, WebP, AVIF, JPEG, BMP, SVG
 */
export async function loadAnyImageFile(file: File): Promise<LoadedImageResult> {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  // 1. Check for Apple HEIC / HEIF
  const isHeic =
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileType === 'image/heic' ||
    fileType === 'image/heif'

  if (isHeic) {
    return await decodeHeic(file)
  }

  // 2. Check for Apple ProRAW (.dng) or TIFF (.tif, .tiff)
  const isDngOrTiff =
    fileName.endsWith('.dng') ||
    fileName.endsWith('.tiff') ||
    fileName.endsWith('.tif') ||
    fileType === 'image/tiff' ||
    fileType === 'image/x-adobe-dng'

  if (isDngOrTiff) {
    return await decodeTiffOrDng(file)
  }

  // 3. Standard web image (PNG, JPEG, WebP, AVIF, SVG, BMP)
  return await loadStandardImage(file)
}

/**
 * Decode Apple HEIC / HEIF with 100% fidelity
 */
async function decodeHeic(file: File): Promise<LoadedImageResult> {
  try {
    const heic2anyModule = await import('heic2any')
    const heic2any = heic2anyModule.default || heic2anyModule
    // Convert to PNG for lossless color and detail preservation
    const converted = await heic2any({
      blob: file,
      toType: 'image/png'
    })

    const blob = Array.isArray(converted) ? converted[0] : converted
    const dataUrl = await blobToDataUrl(blob)
    const dims = await getImageDimensions(dataUrl)

    return {
      dataUrl,
      width: dims.width,
      height: dims.height,
      format: 'Apple HEIC'
    }
  } catch (err) {
    console.warn('HEIC decode failed, falling back to standard loader:', err)
    return await loadStandardImage(file)
  }
}

/**
 * Decode Apple ProRAW (.dng) or Lossless TIFF (.tiff) using UTIF with preview fallback
 */
async function decodeTiffOrDng(file: File): Promise<LoadedImageResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const ifds = UTIF.decode(arrayBuffer)

    if (ifds && ifds.length > 0) {
      // Find the highest resolution image IFD
      let bestIfd = ifds[0]
      for (const ifd of ifds) {
        UTIF.decodeImage(arrayBuffer, ifd)
        if (ifd.width && ifd.height && ifd.width * ifd.height > (bestIfd.width || 0) * (bestIfd.height || 0)) {
          bestIfd = ifd
        }
      }

      const rgba = UTIF.toRGBA8(bestIfd)
      if (rgba && rgba.length > 0) {
        const canvas = document.createElement('canvas')
        canvas.width = bestIfd.width
        canvas.height = bestIfd.height
        const ctx = canvas.getContext('2d')

        if (ctx) {
          const imgData = ctx.createImageData(bestIfd.width, bestIfd.height)
          imgData.data.set(rgba)
          ctx.putImageData(imgData, 0, 0)
          const dataUrl = canvas.toDataURL('image/png')
          return {
            dataUrl,
            width: bestIfd.width,
            height: bestIfd.height,
            format: file.name.toLowerCase().endsWith('.dng') ? 'Apple ProRAW DNG' : 'Lossless TIFF'
          }
        }
      }
    }
  } catch (err) {
    console.warn('UTIF decode failed, checking for embedded DNG preview stream:', err)
  }

  // Fallback for ProRAW: search for embedded full-resolution JPEG stream
  try {
    const arrayBuffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)
    const jpegBlob = extractEmbeddedJpeg(uint8)
    if (jpegBlob) {
      const dataUrl = await blobToDataUrl(jpegBlob)
      const dims = await getImageDimensions(dataUrl)
      return {
        dataUrl,
        width: dims.width,
        height: dims.height,
        format: 'Apple ProRAW (Preview)'
      }
    }
  } catch (extractErr) {
    console.warn('Embedded preview extraction failed:', extractErr)
  }

  return await loadStandardImage(file)
}

/**
 * Fast embedded JPEG stream extractor from DNG / RAW byte streams
 */
function extractEmbeddedJpeg(uint8: Uint8Array): Blob | null {
  let start = -1
  let end = -1

  for (let i = 0; i < uint8.length - 1; i++) {
    // SOI: 0xFF 0xD8
    if (start === -1 && uint8[i] === 0xff && uint8[i + 1] === 0xd8) {
      start = i
    }
    // EOI: 0xFF 0xD9
    if (start !== -1 && uint8[i] === 0xff && uint8[i + 1] === 0xd9) {
      // Must be at least 64KB to be a real high-res preview, not a tiny thumbnail
      if (i - start > 65536) {
        end = i + 2
      }
    }
  }

  if (start !== -1 && end !== -1 && end > start) {
    const slice = uint8.slice(start, end)
    return new Blob([slice], { type: 'image/jpeg' })
  }

  return null
}

/**
 * Standard image file reader (PNG, JPEG, WebP, AVIF, SVG)
 */
function loadStandardImage(file: File): Promise<LoadedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      if (!dataUrl) {
        reject(new Error('Failed to read file'))
        return
      }
      const dims = await getImageDimensions(dataUrl)
      resolve({
        dataUrl,
        width: dims.width,
        height: dims.height,
        format: file.type || 'image'
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      })
    }
    img.onerror = () => {
      resolve({ width: 800, height: 600 })
    }
    img.src = src
  })
}
