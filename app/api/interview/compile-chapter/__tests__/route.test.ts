// @vitest-environment node
import { test, expect, vi, afterEach } from 'vitest'
import { POST } from '../route'
const telemetry = {
  rmsDb: -20,
  maxPauseMs: 0,
  silenceRatio: 0,
  pitchJitterPct: 1,
  durationSeconds: 10,
  acousticState: 'calm_reflective',
}
const body = {
  id: 's',
  memberId: 'm',
  mode: 'life_wisdom',
  lang: 'en-IN',
  recipientName: 'Arjun',
  question: 'What matters?',
  turns: Array.from({ length: 5 }, () => ({
    question: 'What matters?',
    transcript: 'Kindness matters every day.',
    telemetry,
    distilledExcerpt: 'Kindness matters.',
    audioWavBase64: '',
  })),
}
const request = (input: unknown) =>
  new Request('http://localhost/api/interview/compile-chapter', {
    method: 'POST',
    body: JSON.stringify(input),
  })
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
test('requires exactly five turns', async () => {
  const res = await POST(request({ ...body, turns: body.turns.slice(0, 4) }))
  expect(res.status).toBe(400)
})
test.each([
  ['en-IN', 160, 200],
  ['hi-IN', 160, 502],
  ['en-IN', 20, 502],
  ['en-IN', 260, 502],
])(
  'validates letter language %s and length %s',
  async (language, count, status) => {
    vi.stubEnv('REASONING_API_KEY', 'secret')
    const output = {
      title: 'Kindness',
      letter: Array.from({ length: count }, () => 'kindness').join(' '),
      language,
    }
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            choices: [{ message: { content: JSON.stringify(output) } }],
          }),
        ),
    )
    const res = await POST(request(body))
    expect(res.status).toBe(status)
    if (status === 200) expect(await res.json()).toEqual(output)
    else
      expect(await res.json()).toMatchObject({ code: 'GEMINI_UPSTREAM_ERROR' })
  },
)
