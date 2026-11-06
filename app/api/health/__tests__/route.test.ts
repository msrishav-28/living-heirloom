// @vitest-environment node
import { test, expect, vi, afterEach } from 'vitest'
import { GET } from '../route'
afterEach(() => vi.unstubAllEnvs())
test('reports configuration without upstream calls or secrets', async () => {
  vi.stubEnv('GNANI_API_KEY', 'private-key')
  vi.stubEnv('REASONING_API_KEY', '')
  const spy = vi.spyOn(globalThis, 'fetch')
  const res = GET()
  expect(res.status).toBe(200)
  expect(res.headers.get('Cache-Control')).toBe('private, no-store')
  const text = await res.text()
  expect(text).not.toContain('private-key')
  expect(JSON.parse(text)).toMatchObject({
    ok: true,
    gnaniConfigured: true,
    geminiConfigured: false,
  })
  expect(spy).not.toHaveBeenCalled()
  spy.mockRestore()
})
