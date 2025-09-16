"use client"

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react"
import { useController, UseControllerProps } from "react-hook-form";
import { FormValues } from "../Form";
import Grid from "../Grid";

import styles from "./style.module.css";
import settings from "../../place.config.json";
import Point from "@/utils/point";

interface PointerData {
  initial: Point,
  current: Point
  id: number,
}

interface CameraData {
  mouse: Point | null,
  pointers: PointerData[],
  zooming: boolean,
  pos: Point,
  scale: number
}

interface GridControllerProps {
  width: number,
  height: number,
  colors: string[]
}

export default function GridController({ width, height, colors, ...props }:
                                       GridControllerProps & UseControllerProps<FormValues>) {

  const MIN_SCALE = 1;
  const MAX_SCALE = 40;

  const { field, formState } = useController(props);

  const zoomRef = useRef<HTMLDivElement>(null);

  const [gridScale, setGridScale] = useState(1);

  const cameraRef = useRef<CameraData>({
    pointers: [],
    mouse: null,
    zooming: false,
    pos: new Point(0, 0),
    scale: gridScale
  })

  const pointerDown = (p: ReactPointerEvent) => {
    const cam = cameraRef.current;
    if (cam.pointers.length < 2) {
      if (cam.pointers.length === 1) {
        cam.zooming = true;
        panFromGesture(true);
      }

      cam.pointers.push({
        id: p.pointerId,
        initial: new Point(p.clientX, p.clientY),
        current: new Point(p.clientX, p.clientY)
      })
    }
  }

  const pointerMove = (p: PointerEvent) => {
    const cam = cameraRef.current;

    if (p.isPrimary) {
      cam.mouse = new Point(p.clientX, p.clientY);
    }

    const pointer = cam.pointers.find(p2 => p.pointerId === p2.id)
    if (pointer) {
      pointer.current = new Point(p.clientX, p.clientY)
      panFromGesture();
    }
  }

  const pointerUp = (p: PointerEvent) => {
    const cam = cameraRef.current;

    const idx = cam.pointers.findIndex((p2) => p.pointerId === p2.id)
    if (idx === -1) {
      return
    }

    if (cam.pointers.length > 0) {
      panFromGesture(true) || applyClick();
    }

    cam.pointers.splice(idx, 1);
    if (cam.pointers.length === 0) {
      cam.zooming = false;
    }

  }

  const wheel = (w: WheelEvent) => {
    w.preventDefault();

    const cam = cameraRef.current;
    const screenCenter = new Point(window.innerWidth, window.innerHeight).over(2);

    renderMove({
      from: cam.mouse || screenCenter,
      scale: cam.scale + w.deltaY * -0.1,
      apply: true
    })
  }

  const applyClick = () => {
    const box = zoomRef.current;
    const cam = cameraRef.current;

    if (box) {
      const rect = box.getBoundingClientRect();
      const topLeftCorner = new Point(rect.x, rect.y);

      const pixel = cam.pointers[0].initial.minus(topLeftCorner).over(cam.scale).floor();

      if (pixel.x < 0 || pixel.x >= width) {
        return
      }
      if (pixel.y < 0 || pixel.y >= height) {
        return;
      }

      field.onChange(pixel.y * width + pixel.x)
    }
  }

  interface MoveArgs {
    from?: Point,
    to?: Point,
    scale?: number,
    scalingFactor?: number
    apply?: boolean
  }

  const renderMove = ({ from, to, scale, scalingFactor, apply = false }: MoveArgs) => {
    const cam = cameraRef.current;

    from = from || new Point(0, 0);
    to = to || from;

    if (!scale) {
      if (scalingFactor) {
        scale = cam.scale * scalingFactor
      } else {
        scale = cam.scale;
        scalingFactor = 1;
      }
    }

    scale = Math.max(Math.min(scale, MAX_SCALE), MIN_SCALE);
    scalingFactor = scale / cam.scale;

    const pos = cam.pos.minus(from).times(scalingFactor).plus(to)

    if (apply) {
      cam.pos = pos
      cam.scale = scale;

      cam.pointers.forEach((p) => {
        p.initial = p.current;
      })
    }

    const zoom = zoomRef.current;
    if (zoom) {
      zoom.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`
    }
    setGridScale(Math.max(1, Math.floor(scale)));

  }

  // applies the current gesture to the zoom container
  // returns true if the gesture was applied
  const panFromGesture = (apply: boolean = false): boolean => {
    const cam = cameraRef.current;

    if (cam.pointers.length === 2) {

      const p1 = cam.pointers[0]
      const p2 = cam.pointers[1]

      const initial = p1.initial.avg(p2.initial);
      const current = p2.current.avg(p1.current);

      const currentDist = p2.current.minus(p1.current).norm();
      const initialDist = p2.initial.minus(p1.initial).norm();

      let scalingFactor = currentDist / initialDist;

      renderMove({ from: initial, to: current, scalingFactor, apply })

    } else if (cam.pointers.length === 1) {
      const p = cam.pointers[0]

      const distance = p.current.minus(p.initial).norm();

      if (!cam.zooming && distance < cam.scale) {
        return false;
      }

      renderMove({ from: p.initial, to: p.current, apply })
    }

    return true;
  }

  useEffect(() => {
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointerleave", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("wheel", wheel);

    // initial centering
    const screenCenter = new Point(window.innerWidth, window.innerHeight).over(2);
    const gridCenter = new Point(width, height).over(2)

    const scale = Math.min(window.innerWidth / width, window.innerHeight / height)
    renderMove({
      from: gridCenter,
      to: screenCenter,
      scale,
      apply: true
    })

    // TODO: on init, load values

    return () => {
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointerleave", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("wheel", wheel);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.zoom} ref={zoomRef} style={{ width, height }} onPointerDown={pointerDown}>
        <Grid colors={settings.colors} width={width} height={height} scale={gridScale} />
        <div className={styles.cursor} />
      </div>
    </div>
  )
}
