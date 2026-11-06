export function GET() {
  return Response.json(
    {
      ok: true,
      gnaniConfigured: !!process.env.GNANI_API_KEY,
      geminiConfigured: !!process.env.REASONING_API_KEY,
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
