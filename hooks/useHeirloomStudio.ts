'use client'
import { useState, useEffect, useRef } from 'react'
import {
  GnaniSpeakerEmbeddingSchema,
  SttResponseSchema,
  NextTurnResponseSchema,
  CompiledHeirloomChapterSchema,
  type AcousticTelemetry,
  type GnaniSpeakerEmbedding,
  type HeirloomMode,
  type InterviewSession,
  type CompiledHeirloomChapter,
  type HeirloomCapsuleFile,
  type SupportedLanguage,
} from '@/lib/product-contracts'
import { draftStore } from '@/lib/storage/local-draft-store'
import { startVADRecorder } from '@/lib/audio/vad-recorder'
import { encodeFloat32ToWav16kHzMono } from '@/lib/audio/wav-encoder'
import { analyzePcm16kHzTurn } from '@/lib/audio/acoustic-prosody'
import { sealHeirloom } from '@/lib/crypto/heirloom-vault'
import {
  studioFetch,
  withVoiceFlight,
  blobBase64,
  downloadCapsule,
} from '@/lib/browser-api'
const openingQuestions: Record<SupportedLanguage, string> = {
  'en-IN': 'Tell me about a memory you would like your family to keep.',
  'hi-IN': 'अपने परिवार के लिए आप कौन सी याद संजोकर रखना चाहेंगे?',
  'ta-IN': 'உங்கள் குடும்பத்திற்காக எந்த நினைவைப் பாதுகாக்க விரும்புகிறீர்கள்?',
  'kn-IN': 'ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕಾಗಿ ಯಾವ ನೆನಪನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?',
  'te-IN': 'మీ కుటుంబం కోసం ఏ జ్ఞాపకాన్ని భద్రపరచాలని అనుకుంటున్నారు?',
  'ml-IN':
    'നിങ്ങളുടെ കുടുംബത്തിനായി ഏത് ഓർമ്മയാണ് സൂക്ഷിക്കാൻ ആഗ്രഹിക്കുന്നത്?',
  'mr-IN': 'तुमच्या कुटुंबासाठी कोणती आठवण जपून ठेवायला आवडेल?',
  'bn-IN': 'আপনার পরিবারের জন্য কোন স্মৃতি ধরে রাখতে চান?',
  'gu-IN': 'તમારા પરિવાર માટે કઈ યાદ સાચવી રાખવા માંગો છો?',
  'pa-IN': 'ਤੁਸੀਂ ਆਪਣੇ ਪਰਿਵਾਰ ਲਈ ਕਿਹੜੀ ਯਾਦ ਸੰਭਾਲ ਕੇ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
}
export interface HeirloomStudioState {
  phase:
    'idle' | 'calibrating' | 'interviewing' | 'compiling' | 'sealing' | 'done'
  inFlight: boolean
  error: string | null
  embedding: GnaniSpeakerEmbedding | null
  session: InterviewSession | null
  compiledChapter: CompiledHeirloomChapter | null
  capsule: HeirloomCapsuleFile | null
}
export function useHeirloomStudio(memberId: string, mode: HeirloomMode) {
  const [state, setState] = useState<HeirloomStudioState>({
    phase: 'idle',
    inFlight: false,
    error: null,
    embedding: null,
    session: null,
    compiledChapter: null,
    capsule: null,
  })
  const [telemetry, setTelemetry] = useState<AcousticTelemetry | null>(null),
    [pcm, setPcm] = useState<Float32Array>(new Float32Array()),
    [clipCount, setClipCount] = useState(0),
    [recording, setRecording] = useState(false),
    [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const clips = useRef<Blob[]>([]),
    stop = useRef<(() => void) | null>(null),
    locked = useRef(false),
    mounted = useRef(true),
    consent = useRef(false),
    current = useRef(state),
    cloned = useRef<string | null>(null),
    scope = useRef('')
  current.current = state
  const patch = (update: Partial<HeirloomStudioState>) => {
    if (mounted.current) setState((prev) => ({ ...prev, ...update }))
  }
  useEffect(() => {
    mounted.current = true
    const key = `${memberId}:${mode}`
    scope.current = key
    clips.current = []
    setClipCount(0)
    setState({
      phase: 'idle',
      inFlight: false,
      error: null,
      embedding: null,
      session: null,
      compiledChapter: null,
      capsule: null,
    })
    void Promise.all([
      draftStore.getEmbedding(memberId),
      draftStore.getSession(key),
    ])
      .then(([embedding, session]) => {
        if (mounted.current && scope.current === key)
          patch({ embedding: embedding ?? null, session: session ?? null })
      })
      .catch(() =>
        patch({ error: 'Unable to restore this device’s saved draft.' }),
      )
    return () => {
      mounted.current = false
      stop.current?.()
    }
  }, [memberId, mode])
  useEffect(
    () => () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl)
    },
    [playbackUrl],
  )
  async function action(
    phase: HeirloomStudioState['phase'],
    fn: () => Promise<void>,
  ) {
    if (locked.current) return
    locked.current = true
    patch({ inFlight: true, error: null, phase })
    try {
      await withVoiceFlight(fn)
    } catch (err) {
      patch({ error: err instanceof Error ? err.message : 'Action failed' })
    } finally {
      locked.current = false
      patch({ inFlight: false })
      if (mounted.current) setRecording(false)
    }
  }
  async function record(seconds: number): Promise<Float32Array> {
    if (!consent.current)
      throw new Error('Please consent to voice recording and processing first.')
    setRecording(true)
    return new Promise((resolve, reject) => {
      const frames: Float32Array[] = []
      let count = 0,
        last = 0
      void startVADRecorder({
        hardCapSeconds: seconds,
        onSpeechEnd: (data) => {
          stop.current = null
          if (mounted.current) setRecording(false)
          resolve(data)
        },
        onError: reject,
        onFrame: (frame) => {
          count += frame.length
          frames.push(frame)
          setPcm(frame)
          if (count - last < 4800) return
          last = count
          const data = new Float32Array(Math.min(count, 448000))
          let at = 0
          for (const f of frames) {
            const len = Math.min(f.length, data.length - at)
            if (len <= 0) break
            data.set(f.subarray(0, len), at)
            at += len
          }
          setTelemetry(analyzePcm16kHzTurn(data))
        },
      })
        .then((fn) => {
          stop.current = fn
          if (!mounted.current) fn()
        })
        .catch(reject)
    })
  }
  const onCalibrateVoice = () =>
    action('calibrating', async () => {
      if (!consent.current) throw new Error('Please consent first.')
      if (clips.current.length === 3 && current.current.embedding) {
        clips.current = []
        setClipCount(0)
      }
      if (clips.current.length < 3) {
        const samples = await record(8),
          metrics = analyzePcm16kHzTurn(samples)
        if (
          !mounted.current ||
          !consent.current ||
          scope.current !== `${memberId}:${mode}`
        )
          throw new Error('Recording cancelled')
        if (metrics.silenceRatio > 0.65 || metrics.durationSeconds < 1.7)
          throw new Error('Please record at least two seconds of clear speech.')
        const wav = encodeFloat32ToWav16kHzMono(samples)
        await draftStore.saveAudio(
          `${memberId}:calibration:${clips.current.length}`,
          wav,
        )
        clips.current.push(wav)
        setClipCount(clips.current.length)
      }
      if (clips.current.length !== 3) return
      const form = new FormData()
      clips.current.forEach((blob) => form.append('audio', blob, 'clip.wav'))
      form.set('consent', 'true')
      const embedding = GnaniSpeakerEmbeddingSchema.parse(
        await (
          await studioFetch('/api/gnani/voice-clone/embedding', form)
        ).json(),
      )
      await draftStore.saveEmbedding(memberId, embedding)
      patch({ embedding, phase: 'idle' })
    })
  const startSession = (lang: SupportedLanguage, recipientName: string) =>
    action('interviewing', async () => {
      if (!recipientName.trim()) throw new Error('Enter a recipient name.')
      const session: InterviewSession = {
        id: `${memberId}:${mode}`,
        memberId,
        mode,
        lang,
        recipientName,
        question: openingQuestions[lang],
        turns: [],
      }
      await draftStore.saveSession(session.id, session)
      patch({ session })
    })
  const onCompleteSpokenTurn = (retry = false) =>
    action('interviewing', async () => {
      const session = current.current.session
      if (!session || session.turns.length >= 5)
        throw new Error('Start an interview first.')
      if (!consent.current) throw new Error('Please consent first.')
      let wav: Blob, metrics: AcousticTelemetry
      if (retry) {
        const saved = await draftStore.getAudio(
          session.id + ':pending:' + session.turns.length,
        )
        if (!saved)
          throw new Error('No saved recording is available for this turn.')
        wav = saved
        const view = new DataView(await wav.arrayBuffer())
        const samples = new Float32Array((view.byteLength - 44) / 2)
        for (let i = 0; i < samples.length; i++)
          samples[i] = view.getInt16(44 + i * 2, true) / 32768
        metrics = analyzePcm16kHzTurn(samples)
      } else {
        const samples = await record(28)
        metrics = analyzePcm16kHzTurn(samples)
        wav = encodeFloat32ToWav16kHzMono(samples)
        if (
          !mounted.current ||
          !consent.current ||
          scope.current !== session.id
        )
          throw new Error('Recording cancelled')
        await draftStore.saveAudio(
          session.id + ':pending:' + session.turns.length,
          wav,
        )
      }
      const form = new FormData()
      form.set('audio', wav, 'turn.wav')
      form.set('lang', session.lang)
      form.set('consent', 'true')
      const stt = SttResponseSchema.parse(
        await (await studioFetch('/api/gnani/stt', form)).json(),
      )
      const turn = NextTurnResponseSchema.parse(
        await (
          await studioFetch('/api/interview/turn', {
            ...session,
            turns: session.turns.map((turn) => ({
              ...turn,
              audioWavBase64: '',
            })),
            latestTranscript: stt.transcript,
            telemetry: metrics,
          })
        ).json(),
      )
      const next = {
        ...session,
        question: turn.nextQuestion,
        turns: [
          ...session.turns,
          {
            question: session.question,
            transcript: stt.transcript,
            telemetry: metrics,
            distilledExcerpt: turn.distilledExcerpt,
            audioWavBase64: await blobBase64(wav),
          },
        ],
      }
      await draftStore.saveSession(next.id, next)
      patch({ session: next })
    })
  const onGenerateHeirloomCapsule = () =>
    action('compiling', async () => {
      const session = current.current.session
      if (!session || session.turns.length !== 5)
        throw new Error('Complete five answers before compiling.')
      const chapter = CompiledHeirloomChapterSchema.parse(
        await (
          await studioFetch('/api/interview/compile-chapter', {
            ...session,
            turns: session.turns.map((turn) => ({
              ...turn,
              audioWavBase64: '',
            })),
          })
        ).json(),
      )
      await draftStore.saveBundle({
        session,
        chapter,
        embedding: current.current.embedding,
        clonedAudioWavBase64: null,
        aiDisclosure:
          'AI-assisted interview and letter. Original recordings are authentic human speech; cloned narration, when present, is synthesized by Gnani AI.',
      })
      patch({ compiledChapter: chapter, phase: 'done' })
    })
  const onSynthesize = (text: string, lang: SupportedLanguage) =>
    action('compiling', async () => {
      if (!consent.current || !current.current.embedding)
        throw new Error('Consent and a real voice calibration are required.')
      const wav = await (
        await studioFetch('/api/gnani/voice-clone/synthesize', {
          text,
          lang,
          embedding: current.current.embedding,
          consent: true,
        })
      ).blob()
      cloned.current = await blobBase64(wav)
      setPlaybackUrl(URL.createObjectURL(wav))
      const bundle = await draftStore.getBundle()
      if (bundle && bundle.session.memberId === memberId)
        await draftStore.saveBundle({
          ...bundle,
          clonedAudioWavBase64: cloned.current,
          embedding: current.current.embedding,
        })
    })
  const onSealTimeCapsule = (passphrase: string, date: Date) =>
    action('sealing', async () => {
      const bundle = await draftStore.getBundle()
      if (!bundle) throw new Error('Complete and compile an interview first.')
      const capsule = await sealHeirloom(bundle, passphrase, date)
      await draftStore.saveAudio(
        'latest-sealed',
        new Blob([JSON.stringify(capsule)], { type: 'application/json' }),
      )
      patch({ capsule, phase: 'done' })
    })
  const onTranslateChapter = (lang: SupportedLanguage) =>
    action('compiling', async () => {
      const bundle = await draftStore.getBundle()
      if (!bundle) throw new Error('Compile an interview first.')
      const chapter = CompiledHeirloomChapterSchema.parse(
        await (
          await studioFetch('/api/interview/compile-chapter', {
            ...bundle.session,
            lang,
            turns: bundle.session.turns.map((turn) => ({
              ...turn,
              audioWavBase64: '',
            })),
          })
        ).json(),
      )
      await draftStore.saveBundle({
        ...bundle,
        chapter,
        clonedAudioWavBase64: null,
      })
      setPlaybackUrl(null)
      patch({ compiledChapter: chapter, capsule: null, phase: 'done' })
    })
  return {
    state,
    telemetry,
    pcm,
    clipCount,
    recording,
    playbackUrl,
    setConsent: (value: boolean) => {
      consent.current = value
      if (!value) stop.current?.()
    },
    stopRecording: () => stop.current?.(),
    startSession,
    onCalibrateVoice,
    onCompleteSpokenTurn,
    onGenerateHeirloomCapsule,
    onTranslateChapter,
    onSynthesize,
    onSealTimeCapsule,
    onDownloadCapsule: () => {
      if (state.capsule)
        downloadCapsule(state.capsule, 'family-memory.heirloom')
    },
  }
}
