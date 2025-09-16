export interface Color {
  r: number
  g: number
  b: number
}

export const colorHexToRgb = (c: string): Color => {
  if (c.startsWith('#')) {
    c = c.slice(1)
  }

  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)

  return { r: r, g: g, b: b }
}

export const rgbToSRGB = (c: Color): Color => {
  return {
    r: c.r / 255,
    g: c.g / 255,
    b: c.b / 255,
  }
}

export const sRGBToLinear = (c: Color): Color => {
  let transfer = (p: number) => {
    if (p < 0.04045) {
      return p / 12.92
    }
    return Math.pow((p + 0.055) / 1.055, 2.4)
  }

  return {
    r: transfer(c.r),
    g: transfer(c.g),
    b: transfer(c.b),
  }
}

export const luminance = (color: string): number => {
  const c = sRGBToLinear(rgbToSRGB(colorHexToRgb(color)))
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b
}
