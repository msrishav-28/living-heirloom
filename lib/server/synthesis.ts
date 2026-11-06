import { ApiFailure, gnani } from './api'
import { normalizeTextForGnaniTTS } from '@/lib/gnani/text-normalizer'
import type { GnaniSpeakerEmbedding } from '@/lib/product-contracts'
import { wavResponse } from './wav-response'
export async function synthesize(input: {
  text: string
  lang: string
  tone?: string
  embedding?: GnaniSpeakerEmbedding
}) {
  let text: string
  try {
    text = normalizeTextForGnaniTTS(input.text, input.lang)
  } catch (err) {
    throw new ApiFailure(
      'INVALID_INPUT',
      err instanceof Error ? err.message : 'Invalid spoken text',
      400,
    )
  }
  const body = {
    text,
    audio_config: {
      sample_rate: 44100,
      num_channels: 1,
      sample_width: 2,
      encoding: 'linear_pcm',
      container: 'wav',
    },
    ...(input.embedding
      ? { model: 'vachana-vc-v1', speaker_embedding: input.embedding }
      : {
          model: 'timbre-v3.0',
          voice: 'Avinash',
          language: input.lang,
          speed: input.tone === 'hesitant_vulnerable' ? 0.9 : 1,
        }),
  }
  const response = await gnani(
    '/api/v1/tts/inference',
    JSON.stringify(body),
    true,
  )
  return wavResponse(response)
}
