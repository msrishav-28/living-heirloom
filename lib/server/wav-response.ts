import { ApiFailure, noStore } from './api'

const MAX_WAV_BYTES = 15_000_000
const TRANSFER_CHUNK_BYTES = 64 * 1024

/** Validate before sending headers, then stream bounded chunks without Content-Length. */
export async function wavResponse(upstream: Response): Promise<Response> {
  const reader = upstream.body?.getReader()
  const invalidAudio = () =>
    new ApiFailure(
      'GNANI_UPSTREAM_ERROR',
      'Voice service did not return valid WAV audio',
      502,
    )
  if (!reader) throw invalidAudio()
  const chunks: Uint8Array[] = []
  const header = new Uint8Array(12)
  let length = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (length + value.length > MAX_WAV_BYTES) throw invalidAudio()
      if (length < header.length)
        header.set(value.subarray(0, header.length - length), length)
      length += value.length
      chunks.push(value)
    }
    const ascii = (at: number, count: number) =>
      String.fromCharCode(...header.subarray(at, at + count))
    if (length < 44 || ascii(0, 4) !== 'RIFF' || ascii(8, 4) !== 'WAVE')
      throw invalidAudio()
  } catch {
    // An errored stream may also reject cancellation; preserve the safe provider error.
    await reader.cancel().catch(() => undefined)
    throw invalidAudio()
  } finally {
    reader.releaseLock()
  }
  let index = 0,
    offset = 0
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      while (index < chunks.length && offset === chunks[index].length) {
        index++
        offset = 0
      }
      if (index === chunks.length) {
        chunks.length = 0
        controller.close()
        return
      }
      const end = Math.min(offset + TRANSFER_CHUNK_BYTES, chunks[index].length)
      controller.enqueue(chunks[index].subarray(offset, end))
      offset = end
    },
    cancel() {
      chunks.length = 0
    },
  })
  return new Response(stream, {
    headers: {
      ...noStore,
      'Content-Type': 'audio/wav',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
