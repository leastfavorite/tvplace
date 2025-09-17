'use client'
import ColorPicker from '@/components/ColorPicker'

import settings from '../../place.config.json' with { type: 'json' }
import { SocketProvider } from '@/components/SocketProvider'

import styles from './style.module.css'
import Camera from '../Camera'
import Grid from '../Grid'
import Point from '@/utils/point'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import Cursor from '../Cursor'
import SubmitButton from '../SubmitButton'

export type FormValues = {
  color: string
  position: Point
}

export function useColor(orElse: string = 'transparent') {
  return useWatch({
    name: 'color',
    compute: (i) => (i === undefined ? orElse : settings.colors[parseInt(i)]),
  })
}

export default function Form() {
  const methods = useForm<FormValues>({
    mode: 'onChange',
  })
  const onSubmit = (data: FormValues) => console.log(data)

  return (
    <SocketProvider>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Camera width={settings.width} height={settings.height}>
            <Grid colors={settings.colors} width={settings.width} height={settings.height} />
            <Cursor />
            <div className={styles.cursor} />
          </Camera>
          <div className={styles.toolbarContainer}>
            <div className={styles.toolbar}>
              <div className={`${styles.border} ${styles.grow}`}>
                <ColorPicker colors={settings.colors} />
              </div>
              <div>
                <div className={styles.border}>
                  <input className={styles.nameInput} maxLength={10} placeholder="enter name..." type="text" />
                </div>
                <div className={`${styles.border} ${styles.grow}`}>
                  <SubmitButton />
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </SocketProvider>
  )
}
