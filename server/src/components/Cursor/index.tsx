import { useColor } from '../Form'
import { useCameraClick } from '../Camera'
import { CSSProperties, useEffect } from 'react'

import styles from './style.module.css'
import { useController } from 'react-hook-form'

export default function Cursor() {
  const { field } = useController({ name: 'position' })

  const click = useCameraClick()
  const color = useColor()

  useEffect(() => {
    if (click) {
      field.onChange(click)
    }
  }, [click, field])

  if (!click) {
    return
  }

  const style = {
    backgroundColor: color,
    '--coordinate': `translate(${click.x}px, ${click.y}px)`,
  } as CSSProperties

  return <div className={styles.cursor} style={style} />
}
