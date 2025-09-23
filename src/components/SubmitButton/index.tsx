import { useWatch } from "react-hook-form";
import styles from "./style.module.css";
import { FormValues, useColor } from "../Form";
import Point from "@/utils/point";

import settings from "../../place.config.json"
import { CSSProperties, useEffect, useState } from "react";
import { useEvent } from "../SocketProvider";

export function UnlockedButton() {
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

export default function Button({ unlockTime }: { unlockTime?: number }) {

  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const now = Date.now()
    if (!unlockTime || now > unlockTime) {
      setRemaining(0);
      return;
    }

    const intervalRef = setInterval(() => {
      const ms = unlockTime - Date.now()
      setRemaining(Math.max(Math.ceil(ms / 1000), 0))
      if (ms <= 0) {
        clearInterval(intervalRef)
      }
    }, 100);
    return () => clearInterval(intervalRef)
  }, [unlockTime]);

  if (remaining <= 0) {
    return <UnlockedButton />
  }

  const secs = (remaining % 60).toString().padStart(2, "0");
  const mins = Math.floor(remaining / 60).toString();
  const timeLeft = `${mins}:${secs}`

  const loadingStyle = {
    "--clip": `${Math.min(100 * (remaining - 1) / (settings.cooldown - 1), 100)}%`
  } as CSSProperties

  return (
    <button className={`${styles.loading} ${styles.button}`} type="submit" disabled>
      <p>{timeLeft}</p>
      <div className={styles.loadingBar} style={loadingStyle}>
        <p>{timeLeft}</p>
      </div>
    </button>
  );
}
