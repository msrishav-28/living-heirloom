'use client'

import React, { useState, useRef, useEffect } from 'react'
import { voicePreviewEngine, type EmotionalTone } from '@/lib/voice-synth'
import { GNANI_LANGUAGES } from '@/lib/heirloom-vault-store'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

interface LanguageOption {
  code: string
  speechLang: string
  name: string
  nativeName: string
  sampleTranslation: string
}

const LANGUAGES: LanguageOption[] = GNANI_LANGUAGES.map(language => ({ ...language, sampleTranslation: language.sampleBlessing }))

const EMOTIONAL_TONES: Array<{
  id: EmotionalTone
  label: string
  desc: string
  cadenceNote: string
}> = [
  {
    id: 'reflective',
    label: 'Warm & Reflective',
    desc: 'Intimate afternoon porch cadence with soft breath pauses',
    cadenceNote: '0.91x pace · Warm 680Hz harmonic resonance',
  },
  {
    id: 'lullaby',
    label: 'Gentle Lullaby',
    desc: 'Tender, hushed bedside comfort for young children or hard nights',
    cadenceNote: '0.84x pace · Softened 520Hz acoustic envelope',
  },
  {
    id: 'joyful',
    label: 'Joyful Celebration',
    desc: 'Lifted, smiling energy for weddings, graduations, and birthdays',
    cadenceNote: '1.02x pace · Bright 940Hz overtone lift',
  },
  {
    id: 'wisdom',
    label: 'Steady Wisdom',
    desc: 'Grounded, reassuring conviction for life counsel and family history',
    cadenceNote: '0.88x pace · Deep 610Hz chest resonance',
  },
]

const CALIBRATION_CLIPS = [
  {
    number: '01',
    title: 'Natural Cadence & Warmth',
    duration: '12 sec',
    prompt:
      '“The afternoon light always came through the kitchen window right around four o’clock, and everything slowed down.”',
  },
  {
    number: '02',
    title: 'Smile & Laughter Grain',
    duration: '14 sec',
    prompt:
      '“We laughed so hard we nearly tipped the canoe right into the reeds, and neither of us cared that our boots were soaked.”',
  },
  {
    number: '03',
    title: 'Quiet Conviction',
    duration: '11 sec',
    prompt:
      '“Be kind even when you are tired, keep your promises, and never be afraid to begin again.”',
  },
]

export function VoicePreservationSection() {
  const [completedClips, setCompletedClips] = useState<number[]>([0, 1, 2])
  const [recordingClipIdx, setRecordingClipIdx] = useState<number | null>(null)
  const [selectedLangIdx, setSelectedLangIdx] = useState(0)
  const [selectedTone, setSelectedTone] = useState<EmotionalTone>('reflective')
  const [customCapsuleText, setCustomCapsuleText] = useState('')
  const [isPlayingCapsule, setIsPlayingCapsule] = useState(false)
  const [capsuleProgress, setCapsuleProgress] = useState(0)
  const recordTimerRef = useRef<number | null>(null)

  const currentLang = LANGUAGES[selectedLangIdx]
  const currentToneObj =
    EMOTIONAL_TONES.find((t) => t.id === selectedTone) || EMOTIONAL_TONES[0]
  const activeText =
    customCapsuleText.trim().length > 0
      ? customCapsuleText
      : currentLang.sampleTranslation

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current)
    }
  }, [])

  const handleSimulateRecordClip = (idx: number) => {
    if (recordingClipIdx === idx) {
      setRecordingClipIdx(null)
      if (!completedClips.includes(idx)) {
        setCompletedClips((prev) => [...prev, idx])
      }
      return
    }
    setRecordingClipIdx(idx)
    if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current)
    recordTimerRef.current = window.setTimeout(() => {
      setRecordingClipIdx(null)
      setCompletedClips((prev) => (prev.includes(idx) ? prev : [...prev, idx]))
    }, 2600)
  }

  const handlePlaySpokenCapsule = () => {
    if (isPlayingCapsule) {
      voicePreviewEngine.stopAll()
      setIsPlayingCapsule(false)
      setCapsuleProgress(0)
      return
    }
    setIsPlayingCapsule(true)
    setCapsuleProgress(0)
    voicePreviewEngine.playCapsuleAudio(
      activeText,
      selectedTone,
      currentLang.speechLang,
      (p) => setCapsuleProgress(p),
      () => {
        setIsPlayingCapsule(false)
        setCapsuleProgress(0)
      }
    )
  }

  return (
    <section
      id="voice-preservation"
      className="w-full bg-[var(--canvas-blush)] py-24 sm:py-[115px]"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        {/* Section Eyebrow + Louize Display Heading */}
        <div className="max-w-[960px]">
          <CalmReveal distance={14}>
            <p className="font-nunito-eyebrow mb-4">
              VOICE PRESERVATION · INTERACTIVE SAMPLE · BROWSER SPEECH
            </p>
          </CalmReveal>

          <h2 className="font-louize-heading-lg text-[clamp(2.55rem,5.8vw,5rem)] text-[var(--ink-black)]">
            <RevealLines
              lines={[
                <React.Fragment key="v1">
                  Three short recordings create a{' '}
                  <em className="font-normal italic tracking-[-0.036em]">
                    permanent voice
                  </em>
                </React.Fragment>,
                <React.Fragment key="v2">in nine Indian languages and English.</React.Fragment>,
              ]}
            />
          </h2>

          <CalmReveal delay={180} distance={18}>
            <p className="font-avenir-body mt-7 max-w-[740px] text-[18px] text-[var(--ink-body-slate)] sm:text-[20px]">
              You do not need hours in a studio. Reading three brief, warm
              sentences lets Gnani AI’s zero-shot acoustic engine capture the
              timbre, breath, and cadence of a voice—allowing written heirloom
              letters to be spoken aloud with authentic emotion across Indian
              and global languages.
            </p>
          </CalmReveal>
        </div>

        {/* 3 Pastel Feature Cards Row */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Step 1: 3-Clip Voice Cloning (Parchment #f3f0e7) */}
          <CalmReveal
            delay={120}
            distance={24}
            className="pastel-card-parchment flex flex-col justify-between p-8 sm:p-[50px]"
          >
            <div>
              <span className="font-nunito-eyebrow">
                01 · 3-RECORDING VOICE CLONE
              </span>
              <h3 className="font-louize-card mt-3 text-[32px] text-[var(--ink-slate-navy)]">
                Permanent vocal model from 3 short clips.
              </h3>
              <p className="font-avenir-body mt-3 text-[17px] text-[var(--ink-body-slate)]">
                Click any calibration phrase below to test the 12-second capture.
                Three samples lock in timbre, breath, and pitch contour via
                Gnani AI.
              </p>

              <div className="mt-6 space-y-3">
                {CALIBRATION_CLIPS.map((clip, idx) => {
                  const isRec = recordingClipIdx === idx
                  const isDone = completedClips.includes(idx)
                  return (
                    <div
                      key={clip.number}
                      className="rounded-[12px] bg-[var(--card)] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-inter-ui text-[14px] font-medium text-[var(--ink-slate-navy)]">
                          Clip {clip.number}: {clip.title} ({clip.duration})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSimulateRecordClip(idx)}
                          className={
                            isRec
                              ? 'btn-ember-pill px-3 py-1 text-[11px]'
                              : 'btn-slate-pill px-3 py-1 text-[11px]'
                          }
                        >
                          {isRec
                            ? 'Recording...'
                            : isDone
                              ? 'Re-record'
                              : 'Record'}
                        </button>
                      </div>
                      <p className="font-avenir-body mt-2 text-[14px] text-[var(--ink-body-slate)]">
                        {clip.prompt}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="font-nunito text-[13px] font-semibold tracking-[0.08em] text-[var(--accent-ember)] uppercase">
                {completedClips.length}/3 Clips Calibrated · Gnani Model Ready
              </span>
            </div>
          </CalmReveal>

          {/* Step 2: 10 Languages � Gnani AI (Slate Blue #e5eaf2) */}
          <CalmReveal
            delay={220}
            distance={24}
            className="pastel-card-blue flex flex-col justify-between p-8 sm:p-[50px]"
          >
            <div>
              <span className="font-nunito-eyebrow">
                02 · 10 LANGUAGES, SAME VOICE
              </span>
              <h3 className="font-louize-card mt-3 text-[32px] text-[var(--ink-slate-navy)]">
                Speak to great-grandchildren in their own tongue.
              </h3>
              <p className="font-avenir-body mt-3 text-[17px] text-[var(--ink-body-slate)]">
                Families move across oceans and generations. Preserve a voice in
                English or Hindi today, and let Gnani AI speak fluently in
                Tamil, Kannada, Telugu, Malayalam, Marathi, Bengali, Gujarati, or Punjabi decades
                from now—while keeping the exact same vocal identity.
              </p>

              {/* Language Pill Selector */}
              <div className="mt-6 flex flex-wrap gap-2">
                {LANGUAGES.map((lang, idx) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLangIdx(idx)
                      setCustomCapsuleText('')
                    }}
                    className={
                      idx === selectedLangIdx
                        ? 'btn-ember-pill bg-[var(--card)] px-3.5 py-1.5 text-[12px]'
                        : 'btn-slate-pill px-3.5 py-1.5 text-[12px]'
                    }
                  >
                    <span>
                      {lang.nativeName} · {lang.code}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-[12px] bg-[var(--card)] p-4">
                <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
                  Gnani AI Cross-Lingual Preview ({currentLang.name})
                </p>
                <p className="font-avenir-body mt-2 text-[16px] text-[var(--ink-slate-navy)]">
                  “{currentLang.sampleTranslation}”
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handlePlaySpokenCapsule}
                className="btn-ember-pill w-full"
              >
                <span>
                  {isPlayingCapsule
                    ? `Stop ${currentLang.name} Voice`
                    : `Hear Voice in ${currentLang.name}`}
                </span>
              </button>
            </div>
          </CalmReveal>

          {/* Step 3: Emotional Range & Audio Capsules (Sage #dde9d3) */}
          <CalmReveal
            delay={320}
            distance={24}
            className="pastel-card-sage flex flex-col justify-between p-8 sm:p-[50px]"
          >
            <div>
              <span className="font-nunito-eyebrow">
                03 · EMOTIONAL RANGE & CAPSULES
              </span>
              <h3 className="font-louize-card mt-3 text-[32px] text-[var(--ink-slate-navy)]">
                Tone that adapts to the weight of the moment.
              </h3>
              <p className="font-avenir-body mt-3 text-[17px] text-[var(--ink-body-slate)]">
                A bedtime blessing requires a different breath than a 30th
                birthday toast. Adjust Gnani AI’s prosody contour before
                generating spoken versions of written letters.
              </p>

              <div className="mt-6 space-y-2.5">
                {EMOTIONAL_TONES.map((tone) => {
                  const active = selectedTone === tone.id
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setSelectedTone(tone.id)}
                      className={`w-full rounded-[12px] p-3.5 text-left transition-mymind ${
                        active
                          ? 'bg-[var(--card)]'
                          : 'bg-[var(--card)]/55 hover:bg-[var(--card)]/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-inter-ui flex items-center gap-2 text-[15px] font-medium text-[var(--ink-slate-navy)]">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              active ? 'bg-[#ff5924]' : 'bg-[#afb5c1]'
                            }`}
                          />
                          {tone.label}
                        </span>
                        <span className="font-nunito text-[11px] font-semibold tracking-[0.07em] text-[var(--muted-foreground)] uppercase">
                          {active ? 'Active' : 'Select'}
                        </span>
                      </div>
                      <p className="font-inter-ui mt-1 pl-4 text-[13px] text-[var(--ink-body-slate)]">
                        {tone.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 rounded-[12px] bg-[var(--card)] px-4 py-3">
              <p className="font-inter-ui text-[13px] text-[var(--ink-slate-navy)]">
                Active profile: <strong>{currentToneObj.label}</strong> (
                {currentToneObj.cadenceNote})
              </p>
            </div>
          </CalmReveal>
        </div>

        {/* Product Demo Frame */}
        <CalmReveal delay={200} distance={22}>
          <div className="mt-10 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-[540px]">
                <span className="font-nunito-eyebrow">
                  LIVE GNANI AI SPOKEN CAPSULE GENERATOR
                </span>
                <h3 className="font-louize-card mt-2 text-[28px] text-[var(--ink-black)] sm:text-[32px]">
                  Turn any written message into a spoken heirloom right now.
                </h3>
                <p className="font-avenir-body mt-2 text-[16px] text-[var(--ink-body-slate)]">
                  Type a note below or use the selected{' '}
                  <strong className="font-normal text-[var(--ink-black)]">
                    {currentLang.name}
                  </strong>{' '}
                  passage with the{' '}
                  <strong className="font-normal text-[var(--ink-black)]">
                    {currentToneObj.label}
                  </strong>{' '}
                  emotional contour.
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <label htmlFor="live-capsule-input" className="sr-only">
                  Write a heartfelt message to synthesize into a spoken audio
                  capsule
                </label>
                <input
                  id="live-capsule-input"
                  type="text"
                  value={customCapsuleText}
                  onChange={(e) => setCustomCapsuleText(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      !e.nativeEvent.isComposing &&
                      e.keyCode !== 229
                    ) {
                      handlePlaySpokenCapsule()
                    }
                  }}
                  placeholder={`Or type your own message in ${currentLang.name}...`}
                  className="font-inter-ui flex-1 rounded-[100px] border border-[var(--border)] bg-[var(--background)] px-6 py-3.5 text-[16px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[#ff5924] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handlePlaySpokenCapsule}
                  className="btn-ember-pill shrink-0"
                >
                  <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                  <span>
                    {isPlayingCapsule
                      ? `Speaking (${Math.round(capsuleProgress * 100)}%)`
                      : 'Generate Spoken Capsule'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </CalmReveal>
      </div>
    </section>
  )
}
