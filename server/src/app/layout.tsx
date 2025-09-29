import type { Metadata } from 'next'
import './globals.css'

import { Kode_Mono, Montserrat } from 'next/font/google'
import { SocketProvider } from '@/components/SocketProvider'

const kodeMono = Kode_Mono({
  weight: '400',
  subsets: ['latin'],
})

const montserrat = Montserrat({
  weight: '600',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'our/place',
  description: "please don't draw anything awful on our tv",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${kodeMono.className} ${montserrat.className}`}>
      <body>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  )
}
