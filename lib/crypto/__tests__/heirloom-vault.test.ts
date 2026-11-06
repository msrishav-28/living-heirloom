// @vitest-environment node
import { test, expect, vi, afterEach } from 'vitest'
import {
  sealHeirloom,
  openHeirloom,
  WrongPassphraseError,
  TimelockFutureError,
} from '../heirloom-vault'
import type { HeirloomCapsuleBundle } from '@/lib/product-contracts'
import chain from './fixtures/chain.json'
import beacon from './fixtures/beacon.json'
const bundle: HeirloomCapsuleBundle = {
  session: {
    id: 's',
    memberId: 'm',
    mode: 'childhood_roots',
    lang: 'en-IN',
    recipientName: 'Priya',
    question: 'What do you remember?',
    turns: [],
  },
  chapter: {
    title: 'Our courtyard',
    letter: 'Remember the warm mornings in our family courtyard.',
    language: 'en-IN',
  },
  embedding: null,
  clonedAudioWavBase64: null,
  aiDisclosure: 'AI-assisted letter; original voice recordings are human.',
}
const unlock = new Date((chain.genesis_time + 999 * 3) * 1000)
function network() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.endsWith('/info')) return Response.json(chain)
      if (url.endsWith('/public/1000')) return Response.json(beacon)
      throw new Error('Unexpected drand request: ' + url)
    }),
  )
}
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
test('actual AES and timelock round trip against a historical verified beacon', async () => {
  network()
  const file = await sealHeirloom(bundle, 'a-long-family-passphrase', unlock)
  expect(file.round).toBe(1000)
  expect(file.timelock).not.toContain(bundle.chapter.letter)
  expect(file.saltHex).toMatch(/^[a-f0-9]{32}$/)
  expect(await openHeirloom(file, 'a-long-family-passphrase')).toEqual(bundle)
})
test('wrong passphrase fails AES authentication', async () => {
  network()
  const file = await sealHeirloom(bundle, 'a-long-family-passphrase', unlock)
  await expect(openHeirloom(file, 'incorrect-password')).rejects.toBeInstanceOf(
    WrongPassphraseError,
  )
})
test('future unlock fails before any beacon request', async () => {
  network()
  const file = await sealHeirloom(
    bundle,
    'a-long-family-passphrase',
    new Date(Date.now() + 60000),
  )
  const spy = vi.mocked(fetch)
  spy.mockClear()
  await expect(
    openHeirloom(file, 'a-long-family-passphrase'),
  ).rejects.toBeInstanceOf(TimelockFutureError)
  expect(spy).not.toHaveBeenCalled()
})
test('rounding never chooses a beacon before selected time', async () => {
  network()
  const time = new Date(unlock.getTime() + 1)
  const file = await sealHeirloom(bundle, 'a-long-family-passphrase', time)
  expect(
    chain.genesis_time * 1000 + (file.round - 1) * 3000,
  ).toBeGreaterThanOrEqual(time.getTime())
})
test('changing public metadata invalidates authentication', async () => {
  network()
  const file = await sealHeirloom(bundle, 'a-long-family-passphrase', unlock)
  await expect(
    openHeirloom(
      { ...file, unlockAtUtc: new Date(unlock.getTime() - 1000).toISOString() },
      'a-long-family-passphrase',
    ),
  ).rejects.toBeInstanceOf(WrongPassphraseError)
})
test('weak passphrases are rejected', async () => {
  await expect(sealHeirloom(bundle, 'short', unlock)).rejects.toThrow(
    '12 characters',
  )
})
