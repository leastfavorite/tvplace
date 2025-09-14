"use client"

import { Ref, useState, useEffect, useRef, MouseEvent } from "react"
import style from "./style.module.css";
import { useController, UseControllerProps } from "react-hook-form";
import { FormValues } from "@/app/page";

export interface GridProps {
    colors: number[];
    width: number;
    height: number;
}

export default function Grid({ colors, width, height, ...props }: GridProps & UseControllerProps<FormValues>) {
    const { field, fieldState } = useController(props);
    //
    // // TODO get from props
    // const width = 128;
    // const height = 72;
    // const scale = 8;
    //
    //
    // const containerRef: Ref<HTMLDivElement> = useRef(null)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
    const canvasRef: Ref<HTMLCanvasElement> = useRef(null)

    useEffect(() => {
        let canvas = canvasRef.current
        if (canvas) {

            const context = canvas.getContext("2d");
            setCtx(context);

            let pixels = new Uint8ClampedArray(4 * width * height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const color = colors[Math.floor(Math.random() * 16)]
                    const i = 4 * (y * width + x)
                    pixels[i] = (color >> 16) & 255;
                    pixels[i + 1] = (color >> 8) & 255;
                    pixels[i + 2] = color & 255;
                    pixels[i + 3] = 255;
                }
            }
            let imageData = new ImageData(pixels, width, height)

            if (context) {
                context.putImageData(imageData, 0, 0)
            }
        };
    }, [canvasRef]);

    //
    // const mouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    //     const r = e.currentTarget.getBoundingClientRect()
    //     const x = Math.floor((e.pageX - r.x) / scale)
    //     const y = Math.floor((e.pageY - r.y) / scale)
    // };

    return (
        <div className={style.container}>
            <canvas width={width} height={height} ref={canvasRef} />
        </div>
    )
}
