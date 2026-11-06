import { test, expect, vi, afterEach } from 'vitest'
const mocks = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock('@ricky0123/vad-web', () => ({ MicVAD: { new: mocks.create } }))
import { startVADRecorder } from '../vad-recorder'
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  mocks.create.mockReset()
})
test('stops microphone tracks and emits one recording on manual stop', async () => {
  const track = vi.fn(),
    destroy = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi
        .fn()
        .mockResolvedValue({ getTracks: () => [{ stop: track }] }),
    },
  })
  mocks.create.mockImplementation(async (options) => {
    await options.getStream()
    return { start: vi.fn().mockResolvedValue(undefined), destroy }
  })
  const onSpeechEnd = vi.fn(),
    onError = vi.fn(),
    stop = await startVADRecorder({ onSpeechEnd, onError })
  const options = mocks.create.mock.calls[0][0]
  options.onFrameProcessed({}, new Float32Array([0.2, 0.3]))
  stop()
  stop()
  expect(track).toHaveBeenCalledOnce()
  expect(destroy).toHaveBeenCalledOnce()
  expect(onSpeechEnd).toHaveBeenCalledOnce()
  expect(onSpeechEnd.mock.calls[0][0]).toEqual(new Float32Array([0.2, 0.3]))
  expect(onError).not.toHaveBeenCalled()
})
test('hard cap submits even if speech end never fires', async () => {
  vi.useFakeTimers()
  mocks.create.mockResolvedValue({
    start: vi.fn(),
    destroy: vi.fn().mockResolvedValue(undefined),
  })
  const onSpeechEnd = vi.fn()
  await startVADRecorder({ onSpeechEnd, onError: vi.fn(), hardCapSeconds: 2 })
  await vi.advanceTimersByTimeAsync(1999)
  expect(onSpeechEnd).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(1)
  expect(onSpeechEnd).toHaveBeenCalledOnce()
})
test('releases tracks if VAD initialization fails after acquiring the mic', async () => {
  const track = vi.fn()
  vi.stubGlobal('navigator', {
    mediaDevices: {
      getUserMedia: vi
        .fn()
        .mockResolvedValue({ getTracks: () => [{ stop: track }] }),
    },
  })
  mocks.create.mockImplementation(async (options) => {
    await options.getStream()
    throw new Error('model failed')
  })
  await expect(
    startVADRecorder({ onSpeechEnd: vi.fn(), onError: vi.fn() }),
  ).rejects.toThrow('model failed')
  expect(track).toHaveBeenCalledOnce()
})
