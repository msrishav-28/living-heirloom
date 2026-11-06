import { ApiFailure } from './api'
export async function readWav(file: FormDataEntryValue | null): Promise<{
  file: File
  durationMs: number
  pcm: Uint8Array
}> {
  if (!(file instanceof File) || file.size < 46 || file.size > 896044)
    throw new ApiFailure(
      'INVALID_INPUT',
      'Expected a WAV recording of up to 28 seconds',
      400,
    )
  const bytes = new Uint8Array(await file.arrayBuffer())
  const v = new DataView(bytes.buffer)
  const ascii = (at: number, n: number) =>
    String.fromCharCode(...bytes.subarray(at, at + n))
  if (
    ascii(0, 4) !== 'RIFF' ||
    ascii(8, 4) !== 'WAVE' ||
    ascii(12, 4) !== 'fmt ' ||
    v.getUint32(16, true) !== 16 ||
    v.getUint16(20, true) !== 1 ||
    v.getUint16(22, true) !== 1 ||
    v.getUint32(24, true) !== 16000 ||
    v.getUint16(34, true) !== 16 ||
    ascii(36, 4) !== 'data' ||
    v.getUint32(40, true) !== bytes.length - 44 ||
    v.getUint32(4, true) !== bytes.length - 8 ||
    (bytes.length - 44) % 2
  )
    throw new ApiFailure(
      'INVALID_INPUT',
      'Audio must be mono 16kHz 16-bit PCM WAV',
      400,
    )
  return { file, durationMs: (bytes.length - 44) / 32, pcm: bytes.subarray(44) }
}
