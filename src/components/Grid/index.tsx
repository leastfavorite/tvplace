"use client"

import { Ref, useState, useEffect, useRef, MouseEvent } from "react"
import style from "./style.module.css";
import { useController, UseControllerProps } from "react-hook-form";
import { FormValues } from "@/app/page";
import { colorHexToRgb } from "@/utils/color";

export interface GridProps {
    colors: string[];
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
    const [pixels, setPixels] = useState<Uint8ClampedArray<ArrayBuffer>>(() => {
        let result = new Uint8ClampedArray(4 * width * height);
        for (let i = 0; i < width * height; i++) {
            const colorStr = colors[Math.floor(Math.random() * colors.length)]
            const color = colorHexToRgb(colorStr);
            result[4 * i    ] = color.r
            result[4 * i + 1] = color.g
            result[4 * i + 2] = color.b
            result[4 * i + 3] = 255
        }
        return result
    });

    const canvasRef: Ref<HTMLCanvasElement> = useRef(null)

    useEffect(() => {
        let canvas = canvasRef.current
        if (canvas) {
            const context = canvas.getContext("2d");
            setCtx(context);
        };
    }, [canvasRef]);

    useEffect(() => {
        if (ctx) {
            let imageData = new ImageData(pixels, width, height);
            ctx.putImageData(imageData, 0, 0);
        }

    }, [ctx, pixels]);

    //
    // const mouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    //     const r = e.currentTarget.getBoundingClientRect()
    //     const x = Math.floor((e.pageX - r.x) / scale)
    //     const y = Math.floor((e.pageY - r.y) / scale)
    // };

    return (
        <div className={style.container} style={{transform: "scale(800%)"}}>
            <canvas width={width} height={height} ref={canvasRef} />
        </div>
    )
}
