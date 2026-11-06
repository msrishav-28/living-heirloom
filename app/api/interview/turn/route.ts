import {
  NextTurnRequestSchema,
  NextTurnResponseSchema,
} from '@/lib/product-contracts'
import { route, jsonInput, reasoning } from '@/lib/server/api'
export const POST = route(async (req) => {
  const input = await jsonInput(req, NextTurnRequestSchema)
  return Response.json(
    await reasoning(
      input,
      NextTurnResponseSchema,
      `You are a gentle family biographer. Interview mode: ${input.mode}. Acoustic state: ${input.telemetry.acousticState}. Ask one sensitive follow-up in ${input.lang}, adapting pacing to the measured state without diagnosing emotion. Return {nextQuestion, distilledExcerpt}; the excerpt is one or two sentences faithfully distilling latestTranscript. Do not invent events.`,
    ),
  )
})
