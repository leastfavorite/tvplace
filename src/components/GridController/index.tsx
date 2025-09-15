"use client"

import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react"
import { useController, UseControllerProps } from "react-hook-form";
import { FormValues } from "../Form";
import Grid from "../Grid";

import styles from "./style.module.css";
import settings from "../../place.config.json";

interface PointerData {
  id: number,
  ix: number,
  iy: number,
  cx: number,
  cy: number
}

interface CameraData {
  pointers: PointerData[],
  zooming: boolean,
  x: number,
  y: number,
  scale: number
}

interface GridControllerProps {
  width: number,
  height: number,
  colors: string[]
}

export default function GridController({ width, height, colors, ...props }:
                                       GridControllerProps & UseControllerProps<FormValues>) {

  const { field, formState } = useController(props);

  const zoomRef = useRef<HTMLDivElement>(null);

  const [gridScale, setGridScale] = useState(5);

  const cameraRef = useRef<CameraData>({
    pointers: [],
    zooming: false,
    x: 0,
    y: 0,
    scale: gridScale
  })

  const pointerDown = (p: ReactPointerEvent) => {
    const cam = cameraRef.current;
    if (cam.pointers.length < 2) {
      cam.pointers.push({
        id: p.pointerId,
        ix: p.clientX,
        iy: p.clientY,
        cx: p.clientX,
        cy: p.clientY
      })
      if (cam.pointers.length === 2) {
        cam.zooming = true;
      }
    }
  }

  const pointerMove = (p: PointerEvent) => {
    const cam = cameraRef.current;

    const evt = cam.pointers.find(p2 => p.pointerId === p2.id)
    if (evt) {
      evt.cx = p.clientX;
      evt.cy = p.clientY;

      render();
    }
  }

  const pointerUp = (p: PointerEvent) => {
    const cam = cameraRef.current;

    const idx = cam.pointers.findIndex((p2) => p.pointerId === p2.id)
    if (idx === -1) {
      return
    }

    if (cam.pointers.length > 0) {
      render(true) || applyClick();
    }

    cam.pointers.splice(idx, 1);
    if (cam.pointers.length === 0) {
      cam.zooming = false;
    }

  }

  const wheel = (w: WheelEvent) => {
    w.preventDefault();

    const cam = cameraRef.current;
    cam.scale += w.deltaY * -0.1;
    render();
  }

  const applyClick = () => {
    const box = zoomRef.current;
    const cam = cameraRef.current;
    if (box) {
      const r = box.getBoundingClientRect();
      const x = Math.floor((cam.pointers[0].ix - r.x) / cam.scale);
      const y = Math.floor((cam.pointers[0].iy - r.y) / cam.scale);

      if (x < 0 || x >= width) {
        return;
      }
      if (y < 0 || y >= height) {
        return;
      }

      field.onChange(y * width + x)
    }
  }

  // apply: applies the current gesture to the camera
  // returns *true* if the
  const render = (apply: boolean = false): boolean => {
    const cam = cameraRef.current;

    let x = cam.x;
    let y = cam.y;

    let scale = cam.scale;

    if (cam.pointers.length === 2) {
      const p1 = cam.pointers[0]
      const p2 = cam.pointers[1]

      const ix = (p1.ix + p2.ix) / 2;
      const iy = (p1.iy + p2.iy) / 2;
      const cx = (p1.cx + p2.cx) / 2;
      const cy = (p1.cy + p2.cy) / 2;

      const dcx = p2.cx - p1.cx;
      const dcy = p2.cy - p1.cy
      const dix = p2.ix - p1.ix
      const diy = p2.iy - p1.iy

      const dc = dcx * dcx + dcy * dcy;
      const di = dix * dix + diy * diy;

      const scaleFactor = Math.sqrt(dc / di);
      scale *= scaleFactor;

      x = cx - scaleFactor * (ix - cam.x)
      y = cy - scaleFactor * (iy - cam.y)

    } else if (cam.pointers.length === 1) {
      const p = cam.pointers[0]

      const dx = p.cx - p.ix;
      const dy = p.cy - p.iy;

      if (!cam.zooming && (dx * dx + dy * dy < cam.scale * cam.scale)) {
        return false;
      }

      x += dx;
      y += dy;
    }

    if (apply) {
      cam.x = x;
      cam.y = y;
      cam.scale = scale;

      cam.pointers.forEach((p) => {
        p.ix = p.cx;
        p.iy = p.cy;
      })
    }

    const zoom = zoomRef.current;
    if (zoom) {
      zoom.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    }
    setGridScale(Math.max(1, Math.floor(scale)));

    return true;
  }

  useEffect(() => {
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointerleave", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("wheel", wheel);
    render();

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
