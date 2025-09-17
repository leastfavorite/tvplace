import styles from './style.module.css'

// sloppy utility function for getting the keyframes used in the
// stylesheet
//
// function getKeyframes() {
//   let pts = ['50% 50%']
//   for (let i = 0; i < 12; i++) {
//     const r = i % 2 ? 1 / Math.cos(Math.PI / 6) : 1
//
//     const theta = Math.PI / 2 + i * (Math.PI / 6)
//
//     const x = Math.round(50 + 50 * r * Math.cos(theta))
//     const y = Math.round(50 - 50 * r * Math.sin(theta))
//
//     pts.push(`${x}% ${y}%`)
//   }
//   pts.push(pts[1])
//
//   let polygons = []
//   for (let i = 1; i < pts.length; i++) {
//     let polygon = new Array(14).fill(pts[i])
//     polygon.splice(0, i, pts.slice(0, i))
//     polygons.push(`clip-path: polygon(${polygon.join(', ')})`)
//   }
//
//   polygons.reverse()
//
//   const keyframes = polygons
//     .map((p, i) => {
//       const pc = Math.round((100 * i) / (polygons.length - 1))
//       return `${pc}% { ${p} }`
//     })
//     .join('\n')
//
//   console.log(keyframes)
// }


export default function Loader() {
  return <div className={styles.loader} />
}
