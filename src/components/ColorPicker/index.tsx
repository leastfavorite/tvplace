"use client";

import { HiPaintBrush } from "react-icons/hi2";
import styles from "./style.module.css";

import { CSSProperties } from "react";
import { UseControllerProps, useController } from 'react-hook-form';
import { FormValues } from "@/app/page";

const rgbToLinear = (c: number) => c < 10.31475 ? c / 3294.6 : Math.pow((c / 255 + 0.055) / 1.055, 2.4)
const getLuminance = (c: number) => {
  const r = rgbToLinear((c >> 16) & 255);
  const g = rgbToLinear((c >>  8) & 255);
  const b = rgbToLinear((c >>  0) & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05;
}
const colorAsStr = (c: number) => `#${c.toString(16).padStart(6, '0')}`

export default function ColorPicker({ colors, ...props }: { colors: number[]  } & UseControllerProps<FormValues>) {
  const { field } = useController(props)

  const colorsByLuminance = [...colors].sort(
    (a, b) => getLuminance(a) - getLuminance(b));
  const brightest = colorsByLuminance.at(-1)!;
  const darkest = colorsByLuminance.at(0)!;

  const contrastThreshold = 2 * Math.sqrt(
    getLuminance(brightest) * getLuminance(darkest));

  return (
    <div className={styles.picker} >
      {colors.map((c, i) => {
        const iconColor = getLuminance(c) < contrastThreshold ? brightest : darkest;
        const cssVars = {
          "--selectionColor": colorAsStr(c),
          "--iconColor": colorAsStr(iconColor)
        } as CSSProperties

        return (
          <div className={styles.container} key={i} style={cssVars} >
            <input {...field}
              type="radio"
              value={i}
            />
            <HiPaintBrush className={styles.icon}/>
          </div>
        )
      })}
    </div>
  )
}


