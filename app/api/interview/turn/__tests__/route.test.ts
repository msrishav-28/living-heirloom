// @vitest-environment node
import { test, expect, vi, afterEach } from 'vitest'
import { POST } from '../route'
const body = {
  id: 'session',
  memberId: 'speaker',
  mode: 'childhood_roots',
  lang: 'en-IN',
  recipientName: 'Arjun',
  question: 'Where did you grow up?',
  turns: [],
  latestTranscript: 'In Chennai, beside the sea.',
  telemetry: {
    rmsDb: -20,
    maxPauseMs: 3000,
    silenceRatio: 0.5,
    pitchJitterPct: 2,
    durationSeconds: 8,
    acousticState: 'hesitant_vulnerable',
  },
}
const req = (value: unknown) =>
  new Request('http://localhost/api/interview/turn', {
    method: 'POST',
    body: JSON.stringify(value),
  })
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
test('validates before configuration', async () => {
  vi.stubEnv('REASONING_API_KEY', '')
  const res = await POST(req({}))
  expect(res.status).toBe(400)
  expect(await res.json()).toMatchObject({ code: 'INVALID_INPUT' })
})
test('missing key is configuration error', async () => {
  vi.stubEnv('REASONING_API_KEY', '')
  const res = await POST(req(body))
  expect(res.status).toBe(503)
  expect(await res.json()).toMatchObject({ code: 'CONFIG_MISSING' })
})
test('passes mode and measured state to interviewer', async () => {
  vi.stubEnv('REASONING_API_KEY', 'secret')
  const output = {
    nextQuestion: 'What do you remember about the sea?',
    distilledExcerpt: 'I grew up beside the sea in Chennai.',
  }
  const fn = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        choices: [{ message: { content: JSON.stringify(output) } }],
      }),
    )
  vi.stubGlobal('fetch', fn)
  const res = await POST(req(body))
  expect(await res.json()).toEqual(output)
  const sent = JSON.parse(fn.mock.calls[0][1].body)
  expect(sent.messages[0].content).toContain('hesitant_vulnerable')
  expect(sent.messages[0].content).toContain('childhood_roots')
  expect(res.headers.get('Cache-Control')).toBe('private, no-store')
})
test.each([
  new Response('secret', { status: 500 }),
  Response.json({ choices: [] }),
])('invalid reasoning response fails closed', async (response) => {
  vi.stubEnv('REASONING_API_KEY', 'secret')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  const res = await POST(req(body))
  expect(res.status).toBe(502)
  expect(await res.json()).toMatchObject({ code: 'GEMINI_UPSTREAM_ERROR' })
})
