import { z } from 'zod'
// The user approved correcting the brief: nine Indic languages plus English.
export const SupportedLanguageSchema = z.enum([
  'en-IN',
  'hi-IN',
  'ta-IN',
  'kn-IN',
  'te-IN',
  'ml-IN',
  'mr-IN',
  'bn-IN',
  'gu-IN',
  'pa-IN',
])
export const HeirloomModeSchema = z.enum([
  'childhood_roots',
  'life_wisdom',
  'turning_point',
  'love_and_family',
  'cross_lingual_bridge',
  'milestone_letter',
  'gratitude_unsaid',
])
export const AcousticStateSchema = z.enum([
  'hesitant_vulnerable',
  'calm_reflective',
  'animated_engaged',
])
export const SttResponseSchema = z.object({
  transcript: z.string().trim().min(1).max(8000),
  confidence: z.number().min(0).max(1).nullable(),
  durationMs: z.number().min(0).max(28000),
})
export const AcousticTelemetrySchema = z.object({
  rmsDb: z.number().min(-60).max(0),
  maxPauseMs: z.number().min(0).max(28000),
  silenceRatio: z.number().min(0).max(1),
  pitchJitterPct: z.number().min(0),
  durationSeconds: z.number().min(0).max(28),
  acousticState: AcousticStateSchema,
})
export const GnaniSpeakerEmbeddingSchema = z.object({
  embedding: z.string().min(1).max(100000),
  shape: z.tuple([z.literal(1), z.literal(768)]),
  dtype: z.literal('torch.bfloat16'),
})
export const InterviewTurnRecordSchema = z.object({
  question: z.string().min(1).max(2000),
  transcript: z.string().min(1).max(8000),
  telemetry: AcousticTelemetrySchema,
  distilledExcerpt: z.string().max(2000),
  audioWavBase64: z.string().max(1200000),
})
export const InterviewSessionSchema = z.object({
  id: z.string().min(1),
  memberId: z.string().min(1),
  mode: HeirloomModeSchema,
  lang: SupportedLanguageSchema,
  recipientName: z.string().min(1).max(120),
  question: z.string().min(1).max(2000),
  turns: z.array(InterviewTurnRecordSchema).max(5),
})
export const NextTurnRequestSchema = InterviewSessionSchema.extend({
  latestTranscript: z.string().trim().min(1).max(8000),
  telemetry: AcousticTelemetrySchema,
})
export const NextTurnResponseSchema = z.object({
  nextQuestion: z.string().min(1).max(2000),
  distilledExcerpt: z.string().min(1).max(2000),
})
export const CompileChapterRequestSchema = InterviewSessionSchema.extend({
  turns: z.array(InterviewTurnRecordSchema).length(5),
})
export const CompiledHeirloomChapterSchema = z.object({
  title: z.string().min(1).max(160),
  letter: z.string().min(20).max(10000),
  language: SupportedLanguageSchema,
})
export const ErrorCodeSchema = z.enum([
  'CONFIG_MISSING',
  'INVALID_INPUT',
  'GNANI_UPSTREAM_ERROR',
  'GNANI_RATE_LIMIT',
  'GEMINI_UPSTREAM_ERROR',
  'TIMELOCK_FUTURE',
  'CRYPTO_FAILURE',
  'STT_EMPTY',
  'INTERNAL_ERROR',
])
export const ApiErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  code: ErrorCodeSchema,
  message: z.string(),
})
export const HeirloomCapsuleBundleSchema = z.object({
  session: InterviewSessionSchema,
  chapter: CompiledHeirloomChapterSchema,
  embedding: GnaniSpeakerEmbeddingSchema.nullable(),
  clonedAudioWavBase64: z.string().max(20000000).nullable(),
  aiDisclosure: z.string(),
})
const hex = (length: number) =>
  z.string().regex(new RegExp(`^[a-f0-9]{${length}}$`))
export const HeirloomCapsuleFileSchema = z.object({
  version: z.literal(1),
  algorithm: z.literal('AES-256-GCM'),
  iterations: z.literal(210000),
  unlockAtUtc: z.string().datetime(),
  round: z.number().int().positive(),
  chainHash: z.literal(
    '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971',
  ),
  ivHex: hex(24),
  saltHex: hex(32),
  authTagHex: hex(32),
  timelock: z.string().min(1).max(40000000),
})
export const TtsRequestSchema = z.object({
  text: z.string().trim().min(1).max(6000),
  lang: SupportedLanguageSchema,
  tone: AcousticStateSchema.optional(),
})
export const CloneRequestSchema = TtsRequestSchema.extend({
  embedding: GnaniSpeakerEmbeddingSchema,
  consent: z.literal(true),
})
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>
export type HeirloomMode = z.infer<typeof HeirloomModeSchema>
export type AcousticTelemetry = z.infer<typeof AcousticTelemetrySchema>
export type GnaniSpeakerEmbedding = z.infer<typeof GnaniSpeakerEmbeddingSchema>
export type InterviewSession = z.infer<typeof InterviewSessionSchema>
export type CompiledHeirloomChapter = z.infer<
  typeof CompiledHeirloomChapterSchema
>
export type HeirloomCapsuleBundle = z.infer<typeof HeirloomCapsuleBundleSchema>
export type HeirloomCapsuleFile = z.infer<typeof HeirloomCapsuleFileSchema>
export type ErrorCode = z.infer<typeof ErrorCodeSchema>
