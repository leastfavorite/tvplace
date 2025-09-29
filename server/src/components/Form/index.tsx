'use client'
import ColorPicker from '@/components/ColorPicker'

import settings from '@/utils/settings'
import { useEvent, useSocket } from '@/components/SocketProvider'

import styles from './style.module.css'
import Camera from '../Camera'
import Grid from '../Grid'
import Point from '@/utils/point'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import Cursor from '../Cursor'
import SubmitButton from '../SubmitButton'
import { useCallback, useState } from 'react'

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
  const socket = useSocket()

  const [unlockTime, setUnlockTime] = useState(0)
  useEvent('c', setUnlockTime)

  const methods = useForm<FormValues>({
    mode: 'onChange',
  })

  const onSubmit = useCallback(
    (data: FormValues) => {
      if (socket) {
        socket.emit('p', parseInt(data.color), data.position.y * settings.width + data.position.x)
      }
    },
    [socket],
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Camera>
          <Grid />
          <Cursor />
        </Camera>
        <div className={styles.toolbarContainer}>
          <div className={styles.toolbar}>
            <div className={`${styles.border} ${styles.grow}`}>
              <ColorPicker colors={settings.colors} />
            </div>
            <div>
              {/*
              <div className={styles.border}>
                <input
                  className={styles.nameInput}
                  maxLength={10}
                  placeholder="enter name..."
                  type="text"
                />
              </div>
              */}
              <div className={`${styles.border} ${styles.grow}`}>
                <SubmitButton unlockTime={unlockTime} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
