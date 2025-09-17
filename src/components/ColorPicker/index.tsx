'use client'

import { HiPaintBrush } from 'react-icons/hi2'
import styles from './style.module.css'

import { CSSProperties } from 'react'
import { useFormContext } from 'react-hook-form'
import { luminance } from '@/utils/color'
import { FormValues } from '../Form'

export default function ColorPicker({ colors }: { colors: string[] }) {
  const { register } = useFormContext<FormValues>()

  const colorsByLuminance = [...colors].sort((a, b) => luminance(a) - luminance(b))

  const brightest = colorsByLuminance.at(-1)!
  const darkest = colorsByLuminance.at(0)!

  const contrastThreshold = 2 * Math.sqrt(luminance(brightest) * luminance(darkest))

  return (
    <div className={styles.picker}>
      {colors.map((c, i) => {
        const iconColor = luminance(c) < contrastThreshold ? brightest : darkest
        const cssVars = {
          '--selectionColor': c,
          '--iconColor': iconColor,
        } as CSSProperties

        return (
          <div className={styles.container} key={i} style={cssVars}>
            <input {...register('color', { required: true })} type="radio" value={i} />
            <HiPaintBrush className={styles.icon} />
          </div>
        )
      })}
    </div>
  )
}
