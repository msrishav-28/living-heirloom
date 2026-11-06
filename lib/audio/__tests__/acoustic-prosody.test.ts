import { test, expect } from 'vitest'
import { analyzePcm16kHzTurn } from '../acoustic-prosody'
const tone = (count: number) =>
  Float32Array.from(
    { length: count },
    (_, i) => 0.5 * Math.sin((2 * Math.PI * 440 * i) / 16000),
  )
test('silence is hesitant at the noise floor', () => {
  const result = analyzePcm16kHzTurn(new Float32Array(16000))
  expect(result.acousticState).toBe('hesitant_vulnerable')
  expect(result.rmsDb).toBe(-60)
  expect(result.silenceRatio).toBe(1)
})
test('stable 440Hz tone is calm', () => {
  const result = analyzePcm16kHzTurn(tone(16000))
  expect(result.rmsDb).toBeGreaterThan(-20)
  expect(result.acousticState).toBe('calm_reflective')
  expect(result.pitchJitterPct).toBeLessThan(1)
})
test('measures internal silence within one frame', () => {
  const samples = new Float32Array(64000)
  samples.set(tone(16000))
  samples.set(tone(16000), 48000)
  expect(
    Math.abs(analyzePcm16kHzTurn(samples).maxPauseMs - 2000),
  ).toBeLessThanOrEqual(30)
})
test('three-second pause flags hesitation', () => {
  const samples = new Float32Array(80000)
  samples.set(tone(16000))
  samples.set(tone(16000), 64000)
  expect(analyzePcm16kHzTurn(samples).acousticState).toBe('hesitant_vulnerable')
})
