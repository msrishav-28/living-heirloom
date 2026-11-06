// @vitest-environment node
import { test, expect, vi, afterEach } from 'vitest'
import { POST } from '../route'
import { encodeFloat32ToWav16kHzMono } from '@/lib/audio/wav-encoder'
function request(consent = true) {
  const form = new FormData()
  form.set('lang', 'hi-IN')
  form.set(
    'audio',
    encodeFloat32ToWav16kHzMono(new Float32Array(16000)),
    'speech.wav',
  )
  if (consent) form.set('consent', 'true')
  return new Request('http://localhost/api/gnani/stt', {
    method: 'POST',
    body: form,
  })
}
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})
test('missing config fails before any paid request', async () => {
  vi.stubEnv('GNANI_API_KEY', '')
  const res = await POST(request())
  expect(res.status).toBe(503)
  expect(await res.json()).toMatchObject({ ok: false, code: 'CONFIG_MISSING' })
  expect(res.headers.get('Cache-Control')).toBe('private, no-store')
})
test('requires consent', async () => {
  const res = await POST(request(false))
  expect(res.status).toBe(400)
  expect(await res.json()).toMatchObject({ code: 'INVALID_INPUT' })
})
test('rejects malformed audio', async () => {
  const form = new FormData()
  form.set('lang', 'hi-IN')
  form.set('audio', new Blob(['not wav']), 'file.wav')
  const res = await POST(
    new Request('http://localhost/api/gnani/stt', {
      method: 'POST',
      body: form,
    }),
  )
  expect(res.status).toBe(400)
})
test.each([
  ['नमस्ते', 200, undefined],
  ['   ', 422, 'STT_EMPTY'],
])('transcript %s', async (transcript, status, code) => {
  vi.stubEnv('GNANI_API_KEY', 'secret')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ transcript })),
  )
  const res = await POST(request())
  expect(res.status).toBe(status)
  const data = await res.json()
  if (code) expect(data.code).toBe(code)
  else
    expect(data).toEqual({
      transcript: 'नमस्ते',
      confidence: null,
      durationMs: 1000,
    })
})
test.each([401, 402, 500, 503])('upstream %s is safe', async (status) => {
  vi.stubEnv('GNANI_API_KEY', 'secret')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('secret', { status })),
  )
  const res = await POST(request())
  expect(res.status).toBe(502)
  expect(await res.json()).toMatchObject({ code: 'GNANI_UPSTREAM_ERROR' })
})
test('double rate limit is returned after one retry', async () => {
  vi.stubEnv('GNANI_API_KEY', 'secret')
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response('', { status: 429 })),
      ),
  )
  const res = await POST(request())
  expect(res.status).toBe(429)
  expect(await res.json()).toMatchObject({ code: 'GNANI_RATE_LIMIT' })
  expect(fetch).toHaveBeenCalledTimes(2)
})
test('bad upstream JSON uses provider error', async () => {
  vi.stubEnv('GNANI_API_KEY', 'secret')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(Response.json({ wrong: 'field' })),
  )
  const res = await POST(request())
  expect(res.status).toBe(502)
  expect(await res.json()).toMatchObject({ code: 'GNANI_UPSTREAM_ERROR' })
})
