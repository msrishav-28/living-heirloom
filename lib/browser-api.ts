import { ApiErrorEnvelopeSchema } from '@/lib/product-contracts'
let busy = false
export async function withVoiceFlight<T>(fn: () => Promise<T>): Promise<T> {
  if (busy)
    throw new Error('Another voice action is already running. Please wait.')
  busy = true
  try {
    return await fn()
  } finally {
    busy = false
  }
}
export async function studioFetch(
  path: string,
  body: FormData | object,
): Promise<Response> {
  const response = await fetch(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
    headers:
      body instanceof FormData
        ? undefined
        : { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(65000),
  })
  if (!response.ok) {
    const error = ApiErrorEnvelopeSchema.safeParse(await response.json())
    throw new Error(
      error.success ? error.data.message : 'The request failed. Please retry.',
    )
  }
  return response
}
export function blobBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read recording'))
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.readAsDataURL(blob)
  })
}
export function audioBlob(base64: string): Blob {
  return new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], {
    type: 'audio/wav',
  })
}
export function downloadCapsule(value: unknown, name: string) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value)], { type: 'application/json' }),
  )
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
