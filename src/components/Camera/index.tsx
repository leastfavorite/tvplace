"use client"

import { PropsWithChildren, useRef } from "react"

export default function Camera({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} style={{transform: "scale(8)", imageRendering: "pixelated" }}>
      {children}
    </div>
  )
}
