import { FormValues } from "../Form";
import { useCameraClick } from "../Camera";
import { CSSProperties, useEffect } from "react";

import styles from "./style.module.css";
import { useController, useFormContext, useWatch } from "react-hook-form";

export default function Cursor({ colors }: { colors: string[] }) {

  const { watch } = useFormContext<FormValues>();
  const { field } = useController({ name: "position" });

  const click = useCameraClick();
  const color = useWatch({
    name: "color",
    compute: i => colors === undefined ? "transparent" : colors[parseInt(i)]
  })

  useEffect(() => {
    if (click) {
      field.onChange(click)
    }
  }, [click])


  if (!click) {
    return;
  }


  const style = {
    backgroundColor: color,
    "--coordinate": `translate(${click.x}px, ${click.y}px)`
  } as CSSProperties

  return <div className={styles.cursor} style={style} />
}
