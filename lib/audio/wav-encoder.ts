export function encodeFloat32ToWav16kHzMono(
  samples: Float32Array,
  sampleRate = 16000,
): Blob {
  if (sampleRate !== 16000) throw new Error('Expected 16kHz PCM samples')
  const count = Math.min(samples.length, 448000)
  const buffer = new ArrayBuffer(44 + count * 2)
  const view = new DataView(buffer)
  const ascii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++)
      view.setUint8(offset + i, text.charCodeAt(i))
  }
  ascii(0, 'RIFF')
  view.setUint32(4, 36 + count * 2, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, 16000, true)
  view.setUint32(28, 32000, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  ascii(36, 'data')
  view.setUint32(40, count * 2, true)
  for (let i = 0; i < count; i++) {
    const value = Number.isFinite(samples[i])
      ? Math.max(-1, Math.min(1, samples[i]))
      : 0
    view.setInt16(
      44 + i * 2,
      Math.round(value * (value < 0 ? 32768 : 32767)),
      true,
    )
  }
  return new Blob([buffer], { type: 'audio/wav' })
}
