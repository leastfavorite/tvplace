"use client"

import { PointerEvent as ReactPointerEvent, useEffect, useRef } from "react"
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

export default function GridController({ ...props }: UseControllerProps<FormValues>) {

  const { field, fieldState } = useController(props);

  const zoomRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const cameraRef = useRef<CameraData>({
    pointers: [],
    zooming: false,
    x: 0,
    y: 0,
    scale: 5
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

  const applyClick = () => {
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

    const pan = panRef.current;
    if (pan) {
      pan.style.transform = `translate(${x}px, ${y}px)`
    }

    const zoom = zoomRef.current;
    const zoomContainer = zoomContainerRef.current;
    if (zoom && zoomContainer) {
      zoom.style.transform = `scale(${scale})`
      zoomContainer.style.width = `${scale * settings.width}px`;
      zoomContainer.style.height = `${scale * settings.height}px`;
    }

    return true;
  }

  useEffect(() => {
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointerleave", pointerUp);
    window.addEventListener("pointermove", pointerMove);
    render();

    return () => {
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointerleave", pointerUp);
      window.removeEventListener("pointermove", pointerMove);
    }
  }, []);

  return (
      <div className={styles.pan} ref={panRef}>

        <div className={styles.zoomContainer} ref={zoomContainerRef}>
          <div className={styles.zoom} ref={zoomRef} onPointerDown={pointerDown}>
            <Grid colors={settings.colors} width={settings.width} height={settings.height} />
          </div>
        </div>

        <div className={styles.cursor} ref={cursorRef} />
      </div>
  )
}
