"use client";
import ColorPicker from "@/components/ColorPicker";
import { useForm } from "react-hook-form";

import settings from "../../place.config.json" with { type: "json" };
import { SocketProvider } from "@/components/SocketProvider";

import styles from "./style.module.css";
import Camera from "../Camera";
import Grid from "../Grid";

export type FormValues = {
  color: string;
  coords: string;
};

export default function Form() {
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      color: "",
    },
    mode: "onChange",
  });
  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <SocketProvider>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Camera
          width={settings.width}
          height={settings.height}
        >
          <Grid
            colors={settings.colors}
            width={settings.width}
            height={settings.height}
          />
          <div className={styles.cursor} />

        </Camera>
        <div className={styles.toolbarContainer}>
          <div className={styles.toolbar}>
            <ColorPicker control={control} colors={settings.colors} name="color" rules={{ required: true }} />
            <input className={styles.submit} type="submit" />
          </div>
        </div>
      </form>
    </SocketProvider>
  );
}

