// @vitest-environment node
import { expect, test } from 'vitest'
import { wavResponse } from '../wav-response'
function wav(size: number) {
  const bytes = new Uint8Array(size)
  bytes.set(new TextEncoder().encode('RIFF'), 0)
  bytes.set(new TextEncoder().encode('WAVE'), 8)
  bytes.set(new TextEncoder().encode('fmt '), 12)
  bytes.set(new TextEncoder().encode('data'), 36)
  const view = new DataView(bytes.buffer)
  view.setUint32(4, size - 8, true)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, 44100, true)
  view.setUint32(28, 88200, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  view.setUint32(40, size - 44, true)
  return bytes
}
test('streams a narration exceeding the buffered hosting limit without changing bytes', async () => {
  const bytes = wav(5_000_000)
  bytes[bytes.length - 1] = 42
  const response = await wavResponse(new Response(bytes))
  expect(response.headers.get('content-length')).toBeNull()
  expect(response.headers.get('content-type')).toBe('audio/wav')
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  const reader = response.body!.getReader()
  let length = 0,
    last = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    expect(value.length).toBeLessThanOrEqual(65536)
    length += value.length
    last = value[value.length - 1]
  }
  expect(length).toBe(bytes.length)
  expect(last).toBe(42)
})
test('recognizes a WAV header split across upstream chunks', async () => {
  const bytes = wav(44)
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes.subarray(0, 3))
      controller.enqueue(bytes.subarray(3, 10))
      controller.enqueue(bytes.subarray(10))
      controller.close()
    },
  })
  const response = await wavResponse(new Response(body))
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes)
})
test.each([
  new Response(null),
  new Response('invalid'),
  new Response(new Uint8Array(44)),
  new Response(wav(15_000_001)),
])(
  'rejects invalid or oversized audio before returning success',
  async (response) => {
    await expect(wavResponse(response)).rejects.toMatchObject({
      code: 'GNANI_UPSTREAM_ERROR',
      status: 502,
    })
  },
)
test('upstream interruption becomes a safe provider error', async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.error(new Error('private upstream details'))
    },
  })
  await expect(wavResponse(new Response(body))).rejects.toMatchObject({
    code: 'GNANI_UPSTREAM_ERROR',
    status: 502,
  })
})
