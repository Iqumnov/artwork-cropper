/**
 * Pure TypeScript 4-point perspective transform & homography solver.
 * Calculates exact CSS matrix3d string for arbitrary 4-corner perspective warping.
 * Zero external dependencies, 100% safe in ES modules and browser environments.
 */

export interface Point2D {
  x: number
  y: number
}

/**
 * Solves an 8x8 linear system using Gaussian elimination with partial pivoting.
 */
function solve8x8(A: number[][], b: number[]): number[] | null {
  const n = 8
  const M = A.map((row, i) => [...row, b[i]])

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i
    let maxVal = Math.abs(M[i][i])
    for (let k = i + 1; k < n; k++) {
      const val = Math.abs(M[k][i])
      if (val > maxVal) {
        maxVal = val
        maxRow = k
      }
    }

    if (maxVal < 1e-12) {
      return null // Singular matrix
    }

    // Swap rows
    if (maxRow !== i) {
      const tmp = M[i]
      M[i] = M[maxRow]
      M[maxRow] = tmp
    }

    // Eliminate column entries below
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i]
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j]
      }
    }
  }

  // Back substitution
  const x = new Array<number>(n)
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n]
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j]
    }
    x[i] = sum / M[i][i]
  }

  return x
}

/**
 * Calculates the 3x3 homography matrix transforming srcPts to dstPts.
 * Points must be ordered: [Top-Left, Top-Right, Bottom-Right, Bottom-Left].
 * Returns CSS matrix3d string: "m11, m12, m13, m14, ..."
 */
export function getPerspectiveMatrix3D(
  srcPts: [number, number, number, number, number, number, number, number],
  dstPts: [number, number, number, number, number, number, number, number]
): string {
  const A: number[][] = []
  const b: number[] = []

  for (let i = 0; i < 4; i++) {
    const x = srcPts[i * 2]
    const y = srcPts[i * 2 + 1]
    const u = dstPts[i * 2]
    const v = dstPts[i * 2 + 1]

    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u])
    b.push(u)

    A.push([0, 0, 0, x, y, 1, -x * v, -y * v])
    b.push(v)
  }

  const h = solve8x8(A, b)
  if (!h) {
    return ''
  }

  // Column-major for CSS matrix3d:
  const matrix = [
    h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
    0,    0,    1, 0,
    h[2], h[5], 0, 1
  ]

  return matrix.map((val) => val.toFixed(6)).join(', ')
}
