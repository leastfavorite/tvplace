import { readFileSync } from 'node:fs'
import z from 'zod'

const filename = process.env['PLACE_CONFIG'] || './place.config.json'
const json = JSON.parse(readFileSync(filename, 'utf8'))
const Settings = z.strictObject({
  width: z.int().positive(),
  height: z.int().positive(),
  colors: z.array(z.string().regex(/#[0-9A-Fa-f]{6}/)),
  cooldown: z.int().nonnegative(),
  maxSessionsPerIp: z.int().positive(),
  dataPath: z.string(),
})

const result = Settings.parse(json)
export default result
