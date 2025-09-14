"use client"

import { MouseEvent as ReactMouseEvent, useEffect, useRef } from "react"
import { useController, UseControllerProps } from "react-hook-form";
import { FormValues } from "../Form";
import Grid from "../Grid";

import styles from "./style.module.css";
import settings from "../../place.config.json";

export default function GridController({ ...props }: UseControllerProps<FormValues>) {

  const { field, fieldState } = useController(props);
  const divRef = useRef<HTMLDivElement>(null);

  const camRef = useRef({
    downX: 0,
    downY: 0,
    currentX: 0,
    currentY: 0,
    mouseDown: false,

    x: 0,
    y: 0,
    scale: 8
  })

  const isDrag = () => {
    const cam = camRef.current;
    const dx = (cam.currentX - cam.downX)
    const dy = (cam.currentY - cam.downY)

    return (dx * dx + dy * dy) > (cam.scale * cam.scale)
  }

  const updateCamera = () => {
    const div = divRef.current;
    const cam = camRef.current;
    if (div) {
      let x = cam.x;
      let y = cam.y;
      if (cam.mouseDown && isDrag()) {
        x += (cam.currentX - cam.downX) / cam.scale;
        y += (cam.currentY - cam.downY) / cam.scale;
      }
      div.style.transform = `scale(${cam.scale}) translate(${x}px, ${y}px)`
    }
  }

  useEffect(() => {
    updateCamera();
  }, [divRef]);

  const mouseDown = (m: ReactMouseEvent<HTMLDivElement>) => {
    if (m.buttons & 1) {
      const cam = camRef.current;
      cam.downX = m.clientX;
      cam.downY = m.clientY;
      cam.mouseDown = true;
    }
  }

  const mouseUp = (m: MouseEvent) => {
    const cam = camRef.current;
    if (cam.mouseDown) {
      if (isDrag()) {
        cam.x += (m.clientX - cam.downX) / cam.scale;
        cam.y += (m.clientY - cam.downY) / cam.scale;
      } else {
        console.log("click!");

        const div = divRef.current;
        if (div) {
          const r = div.getBoundingClientRect();
          const x = Math.floor((cam.downX - r.x) / cam.scale);
          const y = Math.floor((cam.downY - r.y) / cam.scale);
          if (x >= 0 && x < settings.width && y >= 0 && y < settings.height) {
            field.onChange(y * settings.width + x);
          }
        }
      }
    }
    cam.mouseDown = false;
    updateCamera();
  }

  const mouseMove = (m: MouseEvent) => {
    const cam = camRef.current;
    cam.currentX = m.clientX;
    cam.currentY = m.clientY;
    updateCamera();
  }

  useEffect(() => {
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mouseleave", mouseUp);
    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mouseleave", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
    }
  }, []);


  return (
    <div className={styles.container}>
      <div
        className={styles.camera}
        ref={divRef}
        onMouseDown={mouseDown}
      >
        <Grid colors={settings.colors} width={settings.width} height={settings.height} />
      </div>
    </div>
  )
}
