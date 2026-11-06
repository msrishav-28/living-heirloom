import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { mkdir, copyFile, readdir } from 'node:fs/promises'
const require = createRequire(import.meta.url)
const vad = dirname(require.resolve('@ricky0123/vad-web'))
const ort = join(
  dirname(require.resolve('onnxruntime-web/wasm', { paths: [vad] })),
)
await mkdir('public/vad', { recursive: true })
for (const file of ['vad.worklet.bundle.min.js', 'silero_vad_v5.onnx'])
  await copyFile(join(vad, file), join('public/vad', file))
for (const file of await readdir(ort))
  if (file.endsWith('.wasm') || file.endsWith('.mjs'))
    await copyFile(join(ort, file), join('public/vad', file))
