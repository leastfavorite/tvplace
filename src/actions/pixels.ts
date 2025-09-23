import { PixelGrid } from '@/utils/pixels'
import settings from '../place.config.json'

let serverPixels: PixelGrid | null = null
export function getPixels() {
  if (!serverPixels) {
    serverPixels = new PixelGrid({
      width: settings.width,
      height: settings.height,
      colors: settings.colors,
    })
  }

  return serverPixels
}

export function getBoard() {
  return getPixels().packed
}
