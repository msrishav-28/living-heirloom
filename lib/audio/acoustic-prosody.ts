import type { AcousticTelemetry } from '@/lib/product-contracts'
export function analyzePcm16kHzTurn(samples: Float32Array): AcousticTelemetry {
  if (samples.length > 448000) throw new Error('Audio exceeds 28 seconds')
  let sum = 0,
    silent = 0,
    pause = 0,
    maxPause = 0,
    frames = 0
  const pitches: number[] = []
  for (let start = 0; start < samples.length; start += 480) {
    const size = Math.min(480, samples.length - start)
    let squares = 0
    for (let i = 0; i < size; i++) {
      const n = samples[start + i]
      if (!Number.isFinite(n)) throw new Error('Invalid PCM sample')
      squares += n * n
    }
    sum += squares
    frames++
    const db = 20 * Math.log10(Math.max(0.001, Math.sqrt(squares / size)))
    if (db < -40) {
      silent++
      pause += size / 16
      maxPause = Math.max(maxPause, pause)
      continue
    }
    pause = 0
    let best = 0,
      bestLag = 0
    // Normalized autocorrelation, first strong local peak avoids octave multiples.
    const correlations: number[] = []
    for (let lag = 32; lag <= Math.min(213, size - 1); lag++) {
      let cross = 0,
        left = 0,
        right = 0
      for (let i = 0; i < size - lag; i++) {
        const a = samples[start + i],
          b = samples[start + i + lag]
        cross += a * b
        left += a * a
        right += b * b
      }
      correlations[lag] = cross / Math.sqrt(left * right || 1)
    }
    for (let lag = 33; lag < correlations.length - 1; lag++)
      if (
        correlations[lag] > 0.8 &&
        correlations[lag] >= correlations[lag - 1] &&
        correlations[lag] > correlations[lag + 1]
      ) {
        best = correlations[lag]
        bestLag = lag
        break
      }
    if (best > 0 && bestLag) pitches.push(16000 / bestLag)
  }
  const mean = pitches.reduce((a, b) => a + b, 0) / (pitches.length || 1)
  const jitter = mean
    ? (Math.sqrt(
        pitches.reduce((sum, f) => sum + (f - mean) ** 2, 0) / pitches.length,
      ) /
        mean) *
      100
    : 0
  const ratio = frames ? silent / frames : 1
  return {
    rmsDb: Math.min(
      0,
      Math.max(-60, 20 * Math.log10(Math.sqrt(sum / (samples.length || 1)))),
    ),
    maxPauseMs: maxPause,
    silenceRatio: ratio,
    pitchJitterPct: jitter,
    durationSeconds: samples.length / 16000,
    acousticState:
      maxPause > 2000 || ratio > 0.45
        ? 'hesitant_vulnerable'
        : jitter > 15 && ratio < 0.25
          ? 'animated_engaged'
          : 'calm_reflective',
  }
}
