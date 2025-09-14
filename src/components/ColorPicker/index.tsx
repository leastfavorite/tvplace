"use client";

import { HiPaintBrush } from "react-icons/hi2";
import styles from "./style.module.css";

import { CSSProperties } from "react";
import { UseControllerProps, useController } from "react-hook-form";
import { FormValues } from "@/app/page";
import { luminance } from "@/utils/color";

export default function ColorPicker({
  colors,
  ...props
}: { colors: string[] } & UseControllerProps<FormValues>) {
  const { field } = useController(props);

  const colorsByLuminance = [...colors].sort(
    (a, b) => luminance(a) - luminance(b),
  );

  const brightest = colorsByLuminance.at(-1)!;
  const darkest = colorsByLuminance.at(0)!;

  const contrastThreshold =
    2 * Math.sqrt(luminance(brightest) * luminance(darkest));

  return (
    <div className={styles.picker}>
      {colors.map((c, i) => {
        const iconColor =
          luminance(c) < contrastThreshold ? brightest : darkest;
        const cssVars = {
          "--selectionColor": c,
          "--iconColor": iconColor,
        } as CSSProperties;

        return (
          <div className={styles.container} key={i} style={cssVars}>
            <input {...field} type="radio" value={i} />
            <HiPaintBrush className={styles.icon} />
          </div>
        );
      })}
    </div>
  );
}
