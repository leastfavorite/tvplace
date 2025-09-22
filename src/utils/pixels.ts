import { Color, colorHexToRgb } from './color'

export interface PixelGridArgs {
  width: number
  height: number
  colors: string[]
  init?: ArrayBufferLike
}

export class PixelGrid extends Uint8ClampedArray {
  w: number
  h: number
  colors: Color[]
  hash: number
  packed: Uint8ClampedArray

  constructor({ width, height, colors, init }: PixelGridArgs) {
    super(4 * width * height)

    this.w = width
    this.h = height
    this.hash = 0

    this.packed = new Uint8ClampedArray(Math.ceil((width * height) / 2))
    this.packed.fill(0)

    this.colors = [...colors.map(colorHexToRgb)]

    if (init && init.byteLength === (width * height) / 2) {
      // packed representation
      const newPixels = new Uint8ClampedArray(init);
      for (let i = 0; i < width * height / 2; i ++) {
        const b = newPixels[i];
        // TODO: cleanup
        this.setPixel(b & 15, 2 * i + 1)
        this.setPixel((b >> 4) & 15, 2 * i)
      }
    } else {
      for (let i = 0; i < width * height; i++) {
        this.setPixel(0, i)
      }
    }
  }

  setPixel(c: number, x: number, y?: number) {
    const i = (y === undefined) ? x : y * this.w + x

    const COLORBITS = 4
    const BITMASK = (1 << COLORBITS) - 1

    c &= BITMASK
    const packedLow = i % 2
    const packedIdx = Math.floor(i / 2)

    let oldColor = this.packed[packedIdx]
    if (packedLow) {
      this.packed[packedIdx] &= BITMASK << COLORBITS
      this.packed[packedIdx] |= c
    } else {
      oldColor >>= COLORBITS
      this.packed[packedIdx] &= BITMASK
      this.packed[packedIdx] |= c << COLORBITS
    }
    oldColor &= BITMASK

    const HASHBITS = 8
    const HASHMASK = (1 << HASHBITS) - 1

    const shuffle = ((i * 251) % HASHMASK) + 1
    const rawHash = (oldColor ^ c) * shuffle

    const hash = (rawHash | (rawHash >> HASHBITS)) & HASHMASK
    this.hash ^= hash

    const color = this.colors[c]

    this[4 * i + 0] = color.r
    this[4 * i + 1] = color.g
    this[4 * i + 2] = color.b
    this[4 * i + 3] = 255
  }
}
