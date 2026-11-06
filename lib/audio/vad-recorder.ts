export interface VADRecorderOptions {
  onSpeechEnd: (samples: Float32Array) => void
  onError: (err: Error) => void
  onFrame?: (samples: Float32Array) => void
  hardCapSeconds?: number
}
export async function startVADRecorder(
  opts: VADRecorderOptions,
): Promise<() => void> {
  const { MicVAD } = await import('@ricky0123/vad-web')
  let stream: MediaStream | undefined,
    vad: Awaited<ReturnType<typeof MicVAD.new>> | undefined
  let finished = false,
    timer: ReturnType<typeof setTimeout> | undefined
  const chunks: Float32Array[] = []
  let count = 0
  const release = () => {
    if (timer) clearTimeout(timer)
    stream?.getTracks().forEach((t) => t.stop())
    if (vad)
      void vad
        .destroy()
        .catch(() => opts.onError(new Error('Could not close audio recorder')))
  }
  const finish = (speech?: Float32Array) => {
    if (finished) return
    finished = true
    const data =
      speech ||
      (() => {
        const result = new Float32Array(Math.min(count, 448000))
        let at = 0
        for (const frame of chunks) {
          const n = Math.min(frame.length, result.length - at)
          if (n <= 0) break
          result.set(frame.subarray(0, n), at)
          at += n
        }
        return result
      })()
    release()
    opts.onSpeechEnd(data.subarray(0, 448000))
  }
  try {
    vad = await MicVAD.new({
      model: 'v5',
      baseAssetPath: '/vad/',
      onnxWASMBasePath: '/vad/',
      startOnLoad: false,
      redemptionMs: 4000,
      getStream: async () => {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        return stream
      },
      pauseStream: async (s) => s.getTracks().forEach((t) => t.stop()),
      onSpeechEnd: finish,
      onFrameProcessed: (_, frame) => {
        if (finished) return
        const copy = new Float32Array(frame)
        if (count < 448000) {
          chunks.push(copy)
          count += copy.length
          opts.onFrame?.(copy)
        }
      },
      onVADMisfire: () => {},
    })
    await vad.start()
    timer = setTimeout(
      () => finish(),
      Math.min(28, Math.max(1, opts.hardCapSeconds ?? 28)) * 1000,
    )
    return () => finish()
  } catch (err) {
    finished = true
    release()
    throw err
  }
}
