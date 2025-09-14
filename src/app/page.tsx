"use client";
import ColorPicker from "@/components/ColorPicker";
import Grid from "@/components/Grid";
import { useForm } from "react-hook-form"

export type FormValues = {
  color: string
  coords: string
}

export default function App() {
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      color: "",
    },
    mode: "onChange",
  })
  const onSubmit = (data: FormValues) => console.log(data)

  const COLORS = [
      0x000000, 0x1D2B53, 0x7E2553, 0x008751,
      0xAB5236, 0x5F574F, 0xC2C3C7, 0xFFF1E8,
      0xFF004D, 0xFFA300, 0xFFEC27, 0x00E436,
      0x29ADFF, 0x83769C, 0xFF77A8, 0xFFCCAA
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/*
          grid selector
          color selector
          submit button
      */}
      <Grid control={control} colors={COLORS} width={128} height={72} name="coordinates" rules={{ required: true }} />
      <ColorPicker control={control} colors={COLORS} name="color" rules={{ required: true }} />
      <input type="submit" />
    </form>
  )
}
