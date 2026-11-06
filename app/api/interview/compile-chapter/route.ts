export const runtime = 'nodejs'
export const maxDuration = 60
import {
  CompileChapterRequestSchema,
  CompiledHeirloomChapterSchema,
} from '@/lib/product-contracts'
import { route, jsonInput, reasoning, ApiFailure } from '@/lib/server/api'
export const POST = route(async (req) => {
  const input = await jsonInput(req, CompileChapterRequestSchema)
  const result = await reasoning(
    input,
    CompiledHeirloomChapterSchema,
    `Compile these five answers into a first-person heirloom letter addressed to ${input.recipientName}, in ${input.lang}, 150–250 words. Use only facts from the answers. Return {title, letter, language}.`,
  )
  if (result.language !== input.lang)
    throw new ApiFailure(
      'GEMINI_UPSTREAM_ERROR',
      'Interview service returned the wrong language',
      502,
    )
  const count = Array.from(
    new Intl.Segmenter(input.lang, { granularity: 'word' }).segment(
      result.letter,
    ),
  ).filter((part) => part.isWordLike).length
  if (count < 150 || count > 250)
    throw new ApiFailure(
      'GEMINI_UPSTREAM_ERROR',
      'The generated letter did not meet the required length. Please retry.',
      502,
    )
  return Response.json(result)
})
