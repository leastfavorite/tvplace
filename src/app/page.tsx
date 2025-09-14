"use client";
import ColorPicker from "@/components/ColorPicker";
import Grid from "@/components/Grid";
import { useForm } from "react-hook-form";

import settings from "../place.config.json" with { type: "json" };
import { SocketProvider } from "@/components/SocketProvider";

export type FormValues = {
  color: string;
  coords: string;
};

export default function App() {
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
        <Grid
          control={control}
          colors={settings.colors}
          width={settings.width}
          height={settings.height}
          name="coords"
          rules={{ required: true }}
        />
        {/* <ColorPicker control={control} colors={settings.colors} name="color" rules={{ required: true }} /> */}
        <input type="submit" />
      </form>
    </SocketProvider>
  );
}
