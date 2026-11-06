export const runtime = 'nodejs'
export const maxDuration = 60
import { CloneRequestSchema } from '@/lib/product-contracts'
import { route, jsonInput } from '@/lib/server/api'
import { synthesize } from '@/lib/server/synthesis'
export const POST = route(async (req) =>
  synthesize(await jsonInput(req, CloneRequestSchema)),
)
