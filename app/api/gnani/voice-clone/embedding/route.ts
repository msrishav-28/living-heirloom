import { z } from 'zod'
import { GnaniSpeakerEmbeddingSchema } from '@/lib/product-contracts'
import { route, gnani, ApiFailure } from '@/lib/server/api'
import { readWav } from '@/lib/server/audio-input'
export const POST = route(async (req) => {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    throw new ApiFailure('INVALID_INPUT', 'Expected three audio clips', 400)
  }
  if (form.get('consent') !== 'true' || form.getAll('audio').length !== 3)
    throw new ApiFailure(
      'INVALID_INPUT',
      'Three clips and voice consent are required',
      400,
    )
  const clips = await Promise.all(form.getAll('audio').map(readWav))
  const size = clips.reduce((sum, clip) => sum + clip.pcm.length, 0)
  if (size < 160000 || size > 896000)
    throw new ApiFailure(
      'INVALID_INPUT',
      'Combined reference must last 5–28 seconds',
      400,
    )
  const bytes = new Uint8Array(44 + size)
  bytes.set(new Uint8Array(await clips[0].file.arrayBuffer()).subarray(0, 44))
  const view = new DataView(bytes.buffer)
  view.setUint32(4, 36 + size, true)
  view.setUint32(40, size, true)
  let offset = 44
  for (const clip of clips) {
    bytes.set(clip.pcm, offset)
    offset += clip.pcm.length
  }
  const upstream = new FormData()
  upstream.set(
    'audio_file',
    new Blob([bytes], { type: 'audio/wav' }),
    'calibration.wav',
  )
  const response = await gnani('/api/v1/tts/voice-clone/embeddings', upstream)
  try {
    const envelope = z
      .union([
        GnaniSpeakerEmbeddingSchema,
        z
          .object({
            data: z.object({
              voice_clone_embedding: GnaniSpeakerEmbeddingSchema,
            }),
          })
          .transform((x) => x.data.voice_clone_embedding),
      ])
      .parse(await response.json())
    return Response.json(envelope)
  } catch {
    throw new ApiFailure(
      'GNANI_UPSTREAM_ERROR',
      'Invalid voice embedding response',
      502,
    )
  }
})
