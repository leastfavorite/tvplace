import { Color, colorHexToRgb } from '@/utils/color'

export interface PixelGridArgs {
  width: number
  height: number
  colors: string[]
  init?: ArrayBufferLike
}

export class PixelGrid {
  w: number
  h: number
  colors: Color[]
  packed: Uint8ClampedArray<ArrayBuffer>
  unpacked: Uint8ClampedArray<ArrayBuffer>

  constructor({ width, height, colors, init }: PixelGridArgs) {
    this.w = width
    this.h = height

    this.packed = new Uint8ClampedArray(new ArrayBuffer(Math.ceil((width * height) / 2)))
    this.unpacked = new Uint8ClampedArray(new ArrayBuffer(width * height * 4))

    this.colors = [...colors.map(colorHexToRgb)]

    if (init && init.byteLength === (width * height) / 2) {
      // packed representation
      const newPixels = new Uint8ClampedArray(init)
      for (let i = 0; i < (width * height) / 2; i++) {
        const b = newPixels[i]
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
    const i = y === undefined ? x : y * this.w + x

    const COLORBITS = 4
    const BITMASK = (1 << COLORBITS) - 1

    c &= BITMASK
    const packedLow = i % 2
    const packedIdx = Math.floor(i / 2)

    if (packedLow) {
      this.packed[packedIdx] &= BITMASK << COLORBITS
      this.packed[packedIdx] |= c
    } else {
      this.packed[packedIdx] &= BITMASK
      this.packed[packedIdx] |= c << COLORBITS
    }

    const color = this.colors[c]

    this.unpacked[4 * i + 0] = color.r
    this.unpacked[4 * i + 1] = color.g
    this.unpacked[4 * i + 2] = color.b
    this.unpacked[4 * i + 3] = 255
  }
}
