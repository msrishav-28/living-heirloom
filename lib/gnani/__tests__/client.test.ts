import { test, expect, vi, afterEach } from 'vitest'
import { callGnaniWithRetry, GnaniUpstreamError } from '../client'
afterEach(() => vi.useRealTimers())
test('success calls once', async () => {
  const fn = vi.fn().mockResolvedValue('ok')
  expect(await callGnaniWithRetry(fn)).toBe('ok')
  expect(fn).toHaveBeenCalledTimes(1)
})
test('429 waits exactly 1500ms then retries once', async () => {
  vi.useFakeTimers()
  const fn = vi
    .fn()
    .mockRejectedValueOnce(new GnaniUpstreamError(429, 'busy'))
    .mockResolvedValue('second')
  const p = callGnaniWithRetry(fn)
  await vi.advanceTimersByTimeAsync(1499)
  expect(fn).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(1)
  expect(await p).toBe('second')
  expect(fn).toHaveBeenCalledTimes(2)
})
test.each([401, 402, 422, 500, 503])('does not retry %s', async (status) => {
  const err = new GnaniUpstreamError(status, 'failed')
  const fn = vi.fn().mockRejectedValue(err)
  await expect(callGnaniWithRetry(fn)).rejects.toBe(err)
  expect(fn).toHaveBeenCalledTimes(1)
})
test('second 429 propagates', async () => {
  vi.useFakeTimers()
  const err = new GnaniUpstreamError(429, 'busy')
  const fn = vi.fn().mockRejectedValue(err)
  const assertion = expect(callGnaniWithRetry(fn)).rejects.toBe(err)
  await vi.advanceTimersByTimeAsync(1500)
  await assertion
  expect(fn).toHaveBeenCalledTimes(2)
})
