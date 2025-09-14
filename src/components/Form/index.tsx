"use client";
import ColorPicker from "@/components/ColorPicker";
import Grid from "@/components/Grid";
import { useForm } from "react-hook-form";

import settings from "../../place.config.json" with { type: "json" };
import { SocketProvider } from "@/components/SocketProvider";

import styles from "./style.module.css";
import GridController from "../GridController";

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
        <GridController
          control={control}
          colors={settings.colors}
          width={settings.width}
          height={settings.height}
          name="coords"
          rules={{ required: true }}
        />
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

