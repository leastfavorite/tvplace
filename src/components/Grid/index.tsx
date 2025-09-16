"use client";

import { Ref, useState, useEffect, useRef, } from "react";
import { useEvent } from "../SocketProvider";
import { PixelGrid } from "@/utils/pixels";
import { useCameraScale } from "../Camera";

export interface GridProps {
  colors: string[];
  width: number;
  height: number;
}

export default function Grid({ colors, width, height }: GridProps) {

  const scale = useCameraScale();

  const rawCanvasRef: Ref<HTMLCanvasElement> = useRef(null);
  const scaledCanvasRef: Ref<HTMLCanvasElement> = useRef(null);

  const [rawCtx, setRawCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [scaledCtx, setScaledCtx] = useState<CanvasRenderingContext2D | null>(null);

  const pixelsRef = useRef<PixelGrid>(null);
  const getPixels = () => {
    if (!pixelsRef.current) {
      pixelsRef.current = new PixelGrid({ width, height, colors });
    }
    return pixelsRef.current;
  }

  const refresh = () => {
    if (rawCtx) {
      const pixels = getPixels();
      const imageData = new ImageData(pixels, pixels.w, pixels.h);
      rawCtx.putImageData(imageData, 0, 0);
    }

    updateScaledCanvas();
  }

  const updateScaledCanvas = () => {
    const rawCanvas = rawCanvasRef.current;
    if (scaledCtx && rawCanvas) {
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(
        rawCanvas,
        0, 0, width, height,
        0, 0, width * scale, height * scale
      )
    }
  }

  useEvent("p", (args) => {
    const i = args[0] as number;
    const c = args[1] as number;
    getPixels().setPixel(c, i);
    refresh();
  }, [scale]);

  useEffect(() => {
    const canvas = rawCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setRawCtx(context);
    }
  }, [rawCanvasRef]);

  useEffect(() => {
    const canvas = scaledCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setScaledCtx(context);
    }
  }, [scaledCanvasRef]);

  useEffect(() => {
    const canvas = scaledCanvasRef.current;
    if (canvas) {
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.transform = `scale(${1.0 / scale})`
      updateScaledCanvas();
    }
  }, [scaledCanvasRef, scale]);

  useEffect(() => {
  }, [scale]);

  useEffect(() => refresh, [rawCtx, scaledCtx])

  return <>
    <canvas width={width} height={height} ref={rawCanvasRef} style={{ display: "none" }} />
    <canvas width={width * scale} height={height * scale} ref={scaledCanvasRef} style={{ transformOrigin: "top left", transform: `scale(${1.0 / scale})` }} />
  </>
}
