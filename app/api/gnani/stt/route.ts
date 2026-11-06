export const runtime = 'nodejs'
export const maxDuration = 60
import { z } from 'zod'
import { SupportedLanguageSchema } from '@/lib/product-contracts'
import { route, gnani, ApiFailure } from '@/lib/server/api'
import { readWav } from '@/lib/server/audio-input'
export const POST = route(async (req) => {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    throw new ApiFailure('INVALID_INPUT', 'Expected audio form data', 400)
  }
  const lang = SupportedLanguageSchema.parse(form.get('lang'))
  const wav = await readWav(form.get('audio'))
  if (form.get('consent') !== 'true')
    throw new ApiFailure(
      'INVALID_INPUT',
      'Voice processing consent is required',
      400,
    )
  const upstream = new FormData()
  upstream.set('audio_file', wav.file)
  upstream.set('model', 'prisma-v3.0')
  upstream.set('language_code', lang)
  upstream.set('format', 'transcribe')
  const res = await gnani('/stt/v3', upstream)
  let data: {
    transcript: string
    confidence?: number
  }
  try {
    data = z
      .object({
        transcript: z.string(),
        confidence: z.number().min(0).max(1).optional(),
      })
      .parse(await res.json())
  } catch {
    throw new ApiFailure(
      'GNANI_UPSTREAM_ERROR',
      'Invalid transcription response',
      502,
    )
  }
  if (!data.transcript.trim())
    throw new ApiFailure(
      'STT_EMPTY',
      'No speech was recognized. Please record again.',
      422,
    )
  return Response.json({
    transcript: data.transcript.trim(),
    confidence: data.confidence ?? null,
    durationMs: wav.durationMs,
  })
})
