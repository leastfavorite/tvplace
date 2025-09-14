"use client";

import { Ref, useState, useEffect, useRef, } from "react";
import style from "./style.module.css";
import { useEvent } from "../SocketProvider";
import Camera from "../GridController";
import { PixelGrid } from "@/utils/pixels";

export interface GridProps {
  colors: string[];
  width: number;
  height: number;
}

export default function Grid({ colors, width, height }: GridProps) {

  const canvasRef: Ref<HTMLCanvasElement> = useRef(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const pixelsRef = useRef<PixelGrid>(null);
  const getPixels = () => {
    if (!pixelsRef.current) {
      pixelsRef.current = new PixelGrid({ width, height, colors });
    }
    return pixelsRef.current;
  }

  const refresh = () => {
    if (ctx) {
      const pixels = getPixels();
      const imageData = new ImageData(pixels, pixels.w, pixels.h);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  useEvent("p", (args) => {
    const i = args[0] as number;
    const c = args[1] as number;
    getPixels().setPixel(c, i);
    refresh();
  });


  useEffect(() => {
    let canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setCtx(context);
    }
  }, [canvasRef]);

  useEffect(() => refresh, [ctx])

  return <canvas width={width} height={height} ref={canvasRef} />
}
