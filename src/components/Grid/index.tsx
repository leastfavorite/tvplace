'use client'

import { Ref, useState, useEffect, useRef, useCallback } from 'react'
import { useEvent } from '../SocketProvider'
import { PixelGrid } from '@/utils/pixels'
import { useCameraScale } from '../Camera'

import settings from '../../place.config.json'

export interface GridProps {
  colors: string[]
  width: number
  height: number
}

// TODO: ideally we can determine based on browser type whether
// we want to use scaledcanvas
export default function Grid() {
  const colors = settings.colors

  const scale = useCameraScale()

  const rawCanvasRef: Ref<HTMLCanvasElement> = useRef(null)
  const scaledCanvasRef: Ref<HTMLCanvasElement> = useRef(null)

  const [rawCtx, setRawCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [scaledCtx, setScaledCtx] = useState<CanvasRenderingContext2D | null>(null)

  const pixelsRef = useRef<PixelGrid>(null)
  const getPixels = useCallback(() => {
    if (!pixelsRef.current) {
      pixelsRef.current = new PixelGrid({
        width: settings.width,
        height: settings.height,
        colors,
      })
    }
    return pixelsRef.current
  }, [colors])

  const updateScaledCanvas = useCallback(() => {
    const width = settings.width
    const height = settings.height

    const rawCanvas = rawCanvasRef.current
    if (scaledCtx && rawCanvas) {
      scaledCtx.imageSmoothingEnabled = false
      scaledCtx.drawImage(rawCanvas, 0, 0, width, height, 0, 0, width * scale, height * scale)
    }
  }, [scaledCtx, scale])

  const refresh = useCallback(() => {
    if (rawCtx) {
      const pixels = getPixels()
      const imageData = new ImageData(pixels.unpacked, pixels.w, pixels.h)
      rawCtx.putImageData(imageData, 0, 0)
    }

    updateScaledCanvas()
  }, [rawCtx, updateScaledCanvas, getPixels])

  // TODO: type these
  useEvent(
    'p',
    useCallback(
      (c: number, i: number) => {
        getPixels().setPixel(c, i)
        refresh()
      },
      [getPixels, refresh],
    ),
  )

  useEvent(
    'r',
    useCallback(
      (newPixels: ArrayBufferLike) => {
        pixelsRef.current = new PixelGrid({
          width: settings.width,
          height: settings.height,
          colors,
          init: newPixels,
        })
        refresh()
      },
      [pixelsRef, colors, refresh],
    ),
  )

  useEffect(() => {
    const canvas = rawCanvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      setRawCtx(context)
    }
  }, [rawCanvasRef])

  useEffect(() => {
    const canvas = scaledCanvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      setScaledCtx(context)
    }
  }, [scaledCanvasRef])

  useEffect(() => {
    const canvas = scaledCanvasRef.current
    if (canvas) {
      canvas.width = settings.width * scale
      canvas.height = settings.height * scale
      canvas.style.transform = `scale(${1.0 / scale})`
      updateScaledCanvas()
    }
  }, [scaledCanvasRef, scale, updateScaledCanvas])

  useEffect(() => {}, [scale])

  useEffect(refresh, [refresh, rawCtx, scaledCtx])

  return (
    <>
      <canvas
        width={settings.width}
        height={settings.height}
        ref={rawCanvasRef}
        style={{ display: 'none' }}
      />
      <canvas
        width={settings.width * scale}
        height={settings.height * scale}
        ref={scaledCanvasRef}
        style={{
          transformOrigin: 'top left',
          transform: `scale(${1.0 / scale})`,
        }}
      />
    </>
  )
}
