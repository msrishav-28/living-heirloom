'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useHeirloomStudio } from '@/hooks/useHeirloomStudio'
import {
  SupportedLanguageSchema,
  type HeirloomMode,
  type SupportedLanguage,
} from '@/lib/product-contracts'
import { studioFetch, withVoiceFlight } from '@/lib/browser-api'
import { BespokeSelect } from '@/components/ui/bespoke-controls'
import { ThemeToggle } from '@/components/theme-toggle'
import { VoiceConsent } from './voice-consent'
export function InterviewRoom({
  memberId,
  mode,
}: {
  memberId: string
  mode: HeirloomMode
}) {
  const studio = useHeirloomStudio(memberId, mode),
    { state } = studio,
    router = useRouter(),
    canvas = useRef<HTMLCanvasElement>(null),
    samples = useRef(studio.pcm)
  const [consent, setConsent] = useState(false),
    [lang, setLang] = useState<SupportedLanguage>('en-IN'),
    [recipient, setRecipient] = useState(''),
    [playing, setPlaying] = useState(false),
    [questionAudio, setQuestionAudio] = useState<string | null>(null),
    [audioError, setAudioError] = useState<string | null>(null)
  samples.current = studio.pcm
  useEffect(() => {
    let id = 0
    const draw = () => {
      const el = canvas.current,
        ctx = el?.getContext('2d')
      if (el && ctx) {
        ctx.clearRect(0, 0, el.width, el.height)
        ctx.strokeStyle = '#ff5924'
        ctx.beginPath()
        for (let i = 0; i < el.width; i++) {
          const value =
            samples.current[
              Math.floor((i / el.width) * samples.current.length)
            ] || 0
          const y = el.height / 2 + (value * el.height) / 2
          i ? ctx.lineTo(i, y) : ctx.moveTo(i, y)
        }
        ctx.stroke()
      }
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => {
    if (state.compiledChapter) router.push('/vault?tab=capsules')
  }, [state.compiledChapter, router])
  useEffect(() => {
    if (!state.session || state.session.turns.length >= 5 || !consent) return
    let cancelled = false,
      url: string | undefined
    setPlaying(true)
    setAudioError(null)
    void withVoiceFlight(async () => {
      const wav = await (
        await studioFetch('/api/gnani/tts', {
          text: state.session!.question,
          lang: state.session!.lang,
          tone: studio.telemetry?.acousticState,
        })
      ).blob()
      if (cancelled) return
      url = URL.createObjectURL(wav)
      setQuestionAudio(url)
    })
      .catch((err) => {
        if (!cancelled)
          setAudioError(
            err instanceof Error
              ? err.message
              : 'Question playback unavailable',
          )
      })
      .finally(() => {
        if (!cancelled) setPlaying(false)
      })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      setQuestionAudio(null)
    }
  }, [state.session?.question, consent])
  return (
    <main className="hero-bloom-bg min-h-screen px-5 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <ThemeToggle />
        <Link href="/vault?tab=biographer" className="underline">
          Back to vault
        </Link>
        <p className="font-nunito-eyebrow">
          AI INTERVIEWER · GNANI AI VOICE · {mode.replaceAll('_', ' ')}
        </p>
        <h1 className="font-louize-card text-4xl">
          A memory for someone you love.
        </h1>
        <VoiceConsent
          checked={consent}
          onChange={(value) => {
            setConsent(value)
            studio.setConsent(value)
          }}
        />
        {!state.session && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void studio.startSession(lang, recipient)
            }}
            className="space-y-4"
          >
            <label className="block">
              Recipient name
              <input
                required
                maxLength={120}
                className="ml-3 border p-2"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </label>
            <BespokeSelect
              label="Interview language"
              value={lang}
              options={SupportedLanguageSchema.options.map((value) => ({
                value,
                label:
                  new Intl.DisplayNames(['en'], { type: 'language' }).of(
                    value.split('-')[0],
                  ) || value,
              }))}
              onChange={(value) =>
                setLang(SupportedLanguageSchema.parse(value))
              }
            />
            <button
              disabled={!consent || state.inFlight}
              className="btn-ember-pill"
            >
              Begin interview
            </button>
          </form>
        )}
        {state.session && (
          <>
            <p>Turn {Math.min(5, state.session.turns.length + 1)} of 5</p>
            <h2 className="font-louize-card text-3xl">
              {state.session.turns.length < 5
                ? state.session.question
                : 'Your five memories are recorded.'}
            </h2>
            {questionAudio && (
              <audio
                key={questionAudio}
                src={questionAudio}
                controls
                autoPlay
                onPlay={() => setPlaying(true)}
                onEnded={() => setPlaying(false)}
                onPause={() => setPlaying(false)}
                onError={() => {
                  setPlaying(false)
                  setAudioError(
                    'Playback unavailable; read the question above.',
                  )
                }}
              />
            )}
            {audioError && (
              <p role="status">
                {audioError} You can read the question and continue.
              </p>
            )}
            <canvas
              ref={canvas}
              width={700}
              height={100}
              className="w-full"
              aria-label="Live microphone waveform"
            />
            {studio.telemetry && (
              <p role="status">
                {studio.telemetry.acousticState} ·{' '}
                {studio.telemetry.rmsDb.toFixed(1)} dB · longest pause{' '}
                {Math.round(studio.telemetry.maxPauseMs)} ms
              </p>
            )}
            {state.session.turns.length < 5 ? (
              <button
                className="btn-ember-pill"
                disabled={
                  (!studio.recording && state.inFlight) || !consent || playing
                }
                onClick={() =>
                  studio.recording
                    ? studio.stopRecording()
                    : void studio.onCompleteSpokenTurn()
                }
              >
                {studio.recording
                  ? 'Stop & complete turn'
                  : state.inFlight
                    ? 'Processing…'
                    : 'Record answer'}
              </button>
            ) : (
              <button
                disabled={state.inFlight}
                className="btn-ember-pill"
                onClick={() => void studio.onGenerateHeirloomCapsule()}
              >
                {state.inFlight ? 'Compiling…' : 'Compile heirloom letter'}
              </button>
            )}
            {state.session.turns.map((turn, i) => (
              <blockquote key={i} className="border-l-2 p-4">
                <p className="italic text-[var(--muted-foreground)]">
                  {turn.transcript}
                </p>
                <p>{turn.distilledExcerpt}</p>
              </blockquote>
            ))}
          </>
        )}
        {state.error && (
          <>
            <p role="alert" className="text-red-700">
              {state.error}
            </p>
            {state.session && state.session.turns.length < 5 && (
              <button
                className="btn-slate-pill"
                disabled={state.inFlight || !consent}
                onClick={() => void studio.onCompleteSpokenTurn(true)}
              >
                Retry saved answer
              </button>
            )}
          </>
        )}
        <p className="text-sm">
          Recordings and working drafts stay in this browser. Speech and
          interview requests use external AI services. Keep this device private.
        </p>
      </div>
    </main>
  )
}
