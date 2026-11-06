export class GnaniUpstreamError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'GnaniUpstreamError'
  }
}
export async function callGnaniWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (!(err instanceof GnaniUpstreamError) || err.statusCode !== 429)
      throw err
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return fn()
  }
}
