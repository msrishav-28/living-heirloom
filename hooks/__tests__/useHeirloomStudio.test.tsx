import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import type { VADRecorderOptions } from '@/lib/audio/vad-recorder'

const mocks = vi.hoisted(() => ({
  recorder: vi.fn(),
  saveAudio: vi.fn(),
  saveEmbedding: vi.fn(),
  getSession: vi.fn(),
  getEmbedding: vi.fn(),
  saveSession: vi.fn(),
  saveBundle: vi.fn(),
}))
vi.mock('@/lib/audio/vad-recorder', () => ({
  startVADRecorder: mocks.recorder,
}))
vi.mock('@/lib/storage/local-draft-store', () => ({ draftStore: mocks }))
import { useHeirloomStudio } from '../useHeirloomStudio'
let root: Root,
  container: HTMLDivElement,
  studio: ReturnType<typeof useHeirloomStudio>
function Harness() {
  studio = useHeirloomStudio('member', 'childhood_roots')
  return null
}
beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn())
  mocks.getEmbedding.mockResolvedValue(undefined)
  mocks.getSession.mockResolvedValue(undefined)
  const samples = Float32Array.from(
    { length: 128000 },
    (_, i) => 0.5 * Math.sin((2 * Math.PI * 220 * i) / 16000),
  )
  mocks.recorder.mockImplementation(
    async (options: VADRecorderOptions) => () => options.onSpeechEnd(samples),
  )
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root.render(<Harness />)
  })
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})
test('consent is checked before requesting microphone access', async () => {
  await act(async () => studio.onCalibrateVoice())
  expect(studio.state.error).toContain('consent')
  expect(mocks.recorder).not.toHaveBeenCalled()
  expect(fetch).not.toHaveBeenCalled()
})
test('duplicate calibration actions cannot create two microphone sessions', async () => {
  studio.setConsent(true)
  let first: Promise<void> = Promise.resolve()
  await act(async () => {
    first = studio.onCalibrateVoice()
    await Promise.resolve()
    void studio.onCalibrateVoice()
  })
  expect(studio.state.inFlight).toBe(true)
  expect(mocks.recorder).toHaveBeenCalledTimes(1)
  await act(async () => {
    studio.stopRecording()
    await first
  })
  expect(studio.clipCount).toBe(1)
  expect(mocks.saveAudio).toHaveBeenCalledTimes(1)
  expect(studio.state.inFlight).toBe(false)
})
test('revoked consent cancels capture without sending voice data', async () => {
  studio.setConsent(true)
  let pending: Promise<void> = Promise.resolve()
  await act(async () => {
    pending = studio.onCalibrateVoice()
    await Promise.resolve()
  })
  await act(async () => {
    studio.setConsent(false)
    await pending
  })
  expect(studio.state.error).toContain('cancelled')
  expect(fetch).not.toHaveBeenCalled()
  expect(mocks.saveAudio).not.toHaveBeenCalled()
})
test('three PCM captures produce one embedding call and persist its validated shape', async () => {
  studio.setConsent(true)
  const embedding = {
    embedding: 'real-provider-result',
    shape: [1, 768],
    dtype: 'torch.bfloat16',
  }
  vi.mocked(fetch).mockResolvedValue(Response.json(embedding))
  for (let i = 0; i < 3; i++) {
    let pending: Promise<void> = Promise.resolve()
    await act(async () => {
      pending = studio.onCalibrateVoice()
      await Promise.resolve()
    })
    await act(async () => {
      studio.stopRecording()
      await pending
    })
  }
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(mocks.saveAudio).toHaveBeenCalledTimes(3)
  expect(mocks.saveEmbedding).toHaveBeenCalledWith('member', embedding)
  expect(studio.state.embedding).toEqual(embedding)
  expect(studio.clipCount).toBe(3)
})
