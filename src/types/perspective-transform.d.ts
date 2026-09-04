declare module 'perspective-transform' {
  interface PerspTransform {
    coeffs: number[]
    transform(x: number, y: number): [number, number]
    transformInverse(x: number, y: number): [number, number]
  }

  function PerspT(srcPts: number[], dstPts: number[]): PerspTransform
  export default PerspT
}
