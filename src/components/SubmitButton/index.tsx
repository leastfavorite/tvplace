import { useFormContext, useWatch } from "react-hook-form";
import Loader from "../Loader";
import styles from "./style.module.css";
import { FormValues, useColor } from "../Form";
import Point from "@/utils/point";

import settings from "../../place.config.json"
export default function SubmitButton() {
  const { watch } = useFormContext<FormValues>();

  const color = useColor();

  const pos = useWatch<FormValues>({
    name: "position",
    compute: (p_) => {
      const p = p_ as Point | null | undefined;

      const xPad = settings.width.toString().length;
      const yPad = settings.height.toString().length;

      const x = (p ? p.x.toString() : "").padStart(xPad, " ")
      const y = (p ? p.y.toString() : "").padStart(yPad, " ")

      const result = `@ [${x}, ${y}]`
      return result
    }
  }) as string;

  return (
    <button className={styles.button} type="submit">
      {/* <Loader /> */}
      <p className={styles.action}>place <span className={styles.color} style={{backgroundColor: color}} />
      </p>
      <p>{pos}</p>
    </button>
  );
}
