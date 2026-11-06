// @vitest-environment node
import { test, expect } from 'vitest'
import { encodeFloat32ToWav16kHzMono } from '../wav-encoder'
test.each([0, 16000, 448000, 480000])(
  'WAV headers and cap for %s samples',
  async (size) => {
    const blob = encodeFloat32ToWav16kHzMono(new Float32Array(size))
    const bytes = new Uint8Array(await blob.arrayBuffer()),
      v = new DataView(bytes.buffer)
    expect(Array.from(bytes.subarray(0, 4))).toEqual([82, 73, 70, 70])
    expect(Array.from(bytes.subarray(8, 12))).toEqual([87, 65, 86, 69])
    expect(bytes.length).toBe(44 + Math.min(size, 448000) * 2)
    expect(v.getUint32(4, true)).toBe(bytes.length - 8)
    expect(v.getUint32(40, true)).toBe(bytes.length - 44)
    expect(v.getUint32(24, true)).toBe(16000)
    expect(bytes.subarray(44).every((b) => b === 0)).toBe(true)
  },
)
test('clips signed PCM correctly', async () => {
  const v = new DataView(
    await encodeFloat32ToWav16kHzMono(
      new Float32Array([-2, 0, 2]),
    ).arrayBuffer(),
  )
  expect(v.getInt16(44, true)).toBe(-32768)
  expect(v.getInt16(46, true)).toBe(0)
  expect(v.getInt16(48, true)).toBe(32767)
})
test('rejects other sample rates', () =>
  expect(() =>
    encodeFloat32ToWav16kHzMono(new Float32Array(10), 44100),
  ).toThrow('16kHz'))
