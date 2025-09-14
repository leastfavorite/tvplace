"use client";

import { Ref, useState, useEffect, useRef, } from "react";
import style from "./style.module.css";
import { useController, UseControllerProps } from "react-hook-form";
import { FormValues } from "@/app/page";
import { useEvent } from "../SocketProvider";
import Camera from "../Camera";
import { PixelGrid } from "@/utils/pixels";

export interface GridProps {
  colors: string[];
  width: number;
  height: number;
}

export default function Grid({
  colors,
  width,
  height,
  ...props
}: GridProps & UseControllerProps<FormValues>) {
  const { field, fieldState } = useController(props);

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
    console.log("refreshing!");
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

  //
  // const mouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
  //     const r = e.currentTarget.getBoundingClientRect()
  //     const x = Math.floor((e.pageX - r.x) / scale)
  //     const y = Math.floor((e.pageY - r.y) / scale)
  // };

  return (
    <div className={style.container}>
      <Camera>
        <canvas width={width} height={height} ref={canvasRef} />
      </Camera>
    </div>
  );
}
