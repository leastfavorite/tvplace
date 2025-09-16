"use client";
import ColorPicker from "@/components/ColorPicker";

import settings from "../../place.config.json" with { type: "json" };
import { SocketProvider } from "@/components/SocketProvider";

import styles from "./style.module.css";
import Camera from "../Camera";
import Grid from "../Grid";
import Point from "@/utils/point";
import { FormProvider, useForm } from "react-hook-form";
import Cursor from "../Cursor";

export type FormValues = {
  color: string;
  position: Point;
}

export default function Form() {
  const methods = useForm<FormValues>({
    mode: "onChange",
  });
  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <SocketProvider>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Camera
            width={settings.width}
            height={settings.height}
          >
            <Grid
              colors={settings.colors}
              width={settings.width}
              height={settings.height}
            />
            <Cursor colors={settings.colors} />
            <div className={styles.cursor} />
          </Camera>
          <div className={styles.toolbarContainer}>
            <div className={styles.toolbar}>
              <ColorPicker colors={settings.colors} />
              <input className={styles.submit} type="submit" />
            </div>
          </div>
        </form>
      </FormProvider>
    </SocketProvider>
  );
}

