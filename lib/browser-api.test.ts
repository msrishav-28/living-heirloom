import { test, expect, vi, afterEach } from 'vitest'
import { withVoiceFlight } from './browser-api'
afterEach(() => vi.restoreAllMocks())
test('blocks simultaneous actions and releases after success', async () => {
  let release: () => void = () => {}
  const work = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        release = resolve
      }),
  )
  const first = withVoiceFlight(work)
  await expect(withVoiceFlight(work)).rejects.toThrow('already running')
  expect(work).toHaveBeenCalledTimes(1)
  release()
  await first
  expect(await withVoiceFlight(async () => 42)).toBe(42)
})
test('releases the lock on errors', async () => {
  await expect(
    withVoiceFlight(async () => {
      throw new Error('failed')
    }),
  ).rejects.toThrow('failed')
  expect(await withVoiceFlight(async () => 1)).toBe(1)
})
