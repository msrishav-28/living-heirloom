'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { voicePreviewEngine, type EmotionalTone } from '@/lib/voice-synth'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

interface HeroSectionProps {
  onOpenStudio: () => void
}

interface ArchiveSample {
  id: string
  speaker: string
  relation: string
  recordedDate: string
  unlockLabel: string
  language: string
  langCode: string
  tone: EmotionalTone
  toneLabel: string
  quote: string
  waveform: number[]
}

const HERO_SAMPLES: ArchiveSample[] = [
  {
    id: 'arthur-1998',
    speaker: 'Arthur Pendelton',
    relation: 'Grandfather · Cloned from 3 tape snippets via Gnani AI',
    recordedDate: 'Preserved Oct 2026',
    unlockLabel: 'Time-Locked for Maya’s Wedding (2034)',
    language: 'English (Original Timbre)',
    langCode: 'en-US',
    tone: 'reflective',
    toneLabel: 'Warm & Reflective',
    quote:
      'Maya, if you are listening to this on the morning of your wedding, remember what I told you on the porch when you were seven: choose the person who makes a quiet room feel warm.',
    waveform: [
      24, 38, 52, 68, 44, 76, 88, 62, 48, 82, 94, 71, 56, 39, 64, 86, 92, 67,
      54, 78, 84, 59, 42, 73, 90, 68, 50, 36, 60, 74, 48, 32,
    ],
  },
  {
    id: 'hindi-family',
    speaker: 'Arthur Pendelton',
    relation: 'Same Voice Model · Gnani AI Multilingual Synthesis',
    recordedDate: '10 Languages · Gnani AI',
    unlockLabel: 'For Arjun (Hindi Heritage Capsule)',
    language: 'Hindi (Cross-Lingual Sample)',
    langCode: 'hi-IN',
    tone: 'lullaby',
    toneLabel: 'Gentle Lullaby',
    quote: 'हमारी कहानियाँ और हमारा प्यार हमेशा तुम्हारे साथ रहेंगे।',
    waveform: [
      30, 45, 62, 54, 78, 85, 60, 42, 68, 90, 76, 52, 48, 72, 88, 64, 50, 74,
      82, 58, 40, 66, 84, 70, 46, 38, 62, 76, 54, 40, 30, 22,
    ],
  },
  {
    id: 'claire-wisdom',
    speaker: 'Clara Lin-Vance',
    relation: 'Mother · Gnani AI Biographer Session #4',
    recordedDate: 'AES-256 Sealed Vault',
    unlockLabel: 'Unlocks on Leo’s 30th Birthday (2039)',
    language: 'English · Steady Wisdom',
    langCode: 'en-US',
    tone: 'wisdom',
    toneLabel: 'Steady Wisdom',
    quote:
      'Writing this down on paper always made me cry too hard to finish. Talking to the biographer while the kettle boiled finally let me tell you how proud I am of the man you became.',
    waveform: [
      28, 50, 72, 64, 48, 84, 96, 78, 56, 44, 70, 88, 92, 68, 52, 76, 82, 60,
      46, 80, 90, 74, 58, 42, 66, 78, 62, 48, 38, 54, 40, 26,
    ],
  },
]

export function HeroSection({ onOpenStudio }: HeroSectionProps) {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)

  const currentSample = HERO_SAMPLES[activeSampleIndex]

  const handleTogglePlay = (index?: number) => {
    const targetIdx = index !== undefined ? index : activeSampleIndex
    const sample = HERO_SAMPLES[targetIdx]

    if (isPlaying && targetIdx === activeSampleIndex) {
      voicePreviewEngine.stopAll()
      setIsPlaying(false)
      setPlayProgress(0)
      return
    }

    setActiveSampleIndex(targetIdx)
    setIsPlaying(true)
    setPlayProgress(0)

    voicePreviewEngine.playCapsuleAudio(
      sample.quote,
      sample.tone,
      sample.langCode,
      (progress) => setPlayProgress(progress),
      () => {
        setIsPlaying(false)
        setPlayProgress(0)
      },
    )
  }

  return (
    <section className="hero-bloom-bg relative w-full pt-24 pb-24 sm:pt-32 sm:pb-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        {/* Centered Editorial Headline over Warm Bloom Atmosphere */}
        <div className="mx-auto flex max-w-[1080px] flex-col items-center text-center">
          <CalmReveal delay={20} distance={14}>
            <p className="mb-6 inline-flex items-center gap-2 rounded-[36px] bg-[var(--card)]/80 px-4 py-1.5 font-nunito text-[13px] font-semibold tracking-[0.125em] text-[var(--accent-ember)] uppercase backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5924]" />
              VOICE ARCHIVE · GNANI AI · SAMPLE PLAYBACK USES BROWSER SPEECH
            </p>
          </CalmReveal>

          <h1 className="font-louize-display text-[clamp(3.35rem,9.2vw,8.75rem)] text-[var(--ink-black)]">
            <RevealLines
              baseDelayMs={90}
              staggerMs={135}
              lines={[
                <React.Fragment key="line-1">Keep the voices</React.Fragment>,
                <React.Fragment key="line-2">
                  <em className="font-normal italic tracking-[-0.036em]">
                    you cannot bear
                  </em>{' '}
                  to lose.
                </React.Fragment>,
              ]}
            />
          </h1>

          {/* Prose paragraph with inline Content Category Tags */}
          <CalmReveal delay={280} distance={18}>
            <p className="font-avenir-body mt-9 max-w-[790px] text-[18px] text-[var(--ink-body-slate)] sm:text-[22px] sm:leading-[1.55]">
              75% of us wish we had just one more recording of someone we loved.
              Living Heirloom conducts{' '}
              <a href="#adaptive-interviews" className="tag-inline-cobalt">
                empathetic AI interviews
              </a>
              , preserves real vocal warmth from 3 short clips into{' '}
              <a href="#voice-preservation" className="tag-inline-ember">
                permanent voice clones
              </a>
              , speaks across{' '}
              <a href="#voice-preservation" className="tag-inline-cobalt">
                nine Indian languages and English
              </a>{' '}
              with Gnani AI, and seals{' '}
              <a href="#time-lock-studio" className="tag-inline-ember">
                time-locked audio capsules
              </a>{' '}
              with{' '}
              <a href="#privacy-manifesto" className="tag-inline-cobalt">
                zero-knowledge AES-256 encryption
              </a>{' '}
              — keeping every spoken memory sovereign to your family.
            </p>
          </CalmReveal>

          {/* Outlined Pill Buttons */}
          <CalmReveal delay={400} distance={16}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/vault" className="btn-ember-pill">
                <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                <span>Enter Heirloom Vault Studio</span>
              </Link>

              <button
                type="button"
                onClick={onOpenStudio}
                className="btn-slate-pill"
              >
                <span>Quick 3-Clip Voice Capture</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePlay(activeSampleIndex)}
                className="btn-slate-pill"
              >
                <span>
                  {isPlaying ? 'Pause Heirloom Audio' : 'Hear Sample Capsule'}
                </span>
              </button>
            </div>
          </CalmReveal>
        </div>

        {/* Hero White Elevated Card — the ONLY card on the page with the signature warm orange-glow shadow */}
        <CalmReveal delay={480} distance={28} duration={960}>
          <div className="hero-elevated-card mx-auto mt-16 max-w-[1280px] px-5 pt-10 pb-8 sm:mt-20 sm:px-[30px] sm:pt-[76px] sm:pb-[30px]">
            {/* Top Subtle Archive Bar inside Elevated Card */}
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5924]" />
                <span className="font-inter-ui text-[15px] text-[var(--ink-slate-navy)]">
                  Afternoon Archive — Curated Without Folders
                </span>
                <span className="hidden rounded-[36px] border border-[var(--border)] px-3 py-0.5 font-inter-ui text-[13px] text-[var(--muted-foreground)] sm:inline-block">
                  Gnani AI Voice Engine · AES-256-GCM Sealed
                </span>
              </div>

              {/* Ambient status */}
              <div className="flex items-center gap-2.5 rounded-[36px] bg-[var(--canvas-blush)] px-4 py-1.5">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full bg-[#ff5924] ${
                    isPlaying ? 'animate-ping' : ''
                  }`}
                />
                <span className="font-nunito text-[13px] font-semibold tracking-[0.08em] text-[var(--accent-ember)] uppercase">
                  {isPlaying
                    ? 'Playing browser speech sample...'
                    : 'Illustrative sample · Browser speech'}
                </span>
              </div>
            </div>

            {/* 3-Column Tinted Artifact Grid inside the Hero Preview Card */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Left Column (7 cols): Interactive Voice Capsule Player on Parchment (#f3f0e7) */}
              <div className="pastel-card-parchment flex flex-col justify-between p-7 sm:p-[42px] lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-nunito-eyebrow">
                      SPOKEN HEIRLOOM CAPSULE
                    </span>
                    <span className="rounded-[36px] border border-[#ff5924] px-3 py-0.5 font-nunito text-[12px] font-semibold tracking-[0.06em] text-[var(--accent-ember)] uppercase">
                      {currentSample.unlockLabel}
                    </span>
                  </div>

                  <h2 className="font-louize-card mt-4 text-[28px] text-[var(--ink-slate-navy)] sm:text-[36px]">
                    “{currentSample.quote}”
                  </h2>
                </div>

                {/* Acoustic Waveform Visualizer + Controls */}
                <div className="mt-8">
                  <div
                    role="region"
                    aria-label="Audio capsule waveform visualizer"
                    className="flex h-16 items-end gap-1.5 py-2"
                  >
                    {currentSample.waveform.map((height, idx) => {
                      const barRatio = idx / currentSample.waveform.length
                      const isActiveBar = isPlaying && barRatio <= playProgress
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTogglePlay(activeSampleIndex)}
                          aria-label={`Play from segment ${idx + 1}`}
                          className="group relative flex-1 focus:outline-none"
                          style={{ height: '100%' }}
                        >
                          <span
                            className="block w-full rounded-full transition-all duration-300"
                            style={{
                              height: `${height}%`,
                              backgroundColor: isActiveBar
                                ? '#ff5924'
                                : idx % 3 === 0
                                  ? '#3a475a'
                                  : '#afb5c1',
                              transform:
                                isPlaying &&
                                Math.abs(barRatio - playProgress) < 0.08
                                  ? 'scaleY(1.22)'
                                  : 'scaleY(1)',
                            }}
                          />
                        </button>
                      )
                    })}
                  </div>

                  {/* Speaker switcher pills & Play button */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-inter-ui text-[16px] font-medium text-[var(--ink-slate-navy)]">
                        {currentSample.speaker}
                      </p>
                      <p className="font-inter-ui text-[14px] text-[var(--muted-foreground)]">
                        {currentSample.relation} · {currentSample.language}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {HERO_SAMPLES.map((sample, idx) => (
                        <button
                          key={sample.id}
                          type="button"
                          onClick={() => handleTogglePlay(idx)}
                          className={
                            idx === activeSampleIndex
                              ? 'btn-ember-pill px-4 py-2 text-[13px]'
                              : 'btn-slate-pill px-4 py-2 text-[13px]'
                          }
                        >
                          <span>
                            {idx === activeSampleIndex && isPlaying
                              ? 'Stop'
                              : idx === 0
                                ? '1998 Clone'
                                : idx === 1
                                  ? 'Hindi'
                                  : 'Mother’s Note'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Two stacked cards in Slate Blue (#e5eaf2) and Sage (#dde9d3) */}
              <div className="flex flex-col gap-5 lg:col-span-5">
                {/* Slate Blue Card (#e5eaf2) — Adaptive AI Empathy Status */}
                <div className="pastel-card-blue flex flex-1 flex-col justify-between p-7 sm:p-[36px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-nunito-eyebrow">
                        GNANI AI ADAPTIVE BIOGRAPHER
                      </span>
                      <span className="font-inter-ui text-[13px] text-[var(--muted-foreground)]">
                        Question 4 of 7
                      </span>
                    </div>
                    <h3 className="font-louize-card mt-3 text-[26px] text-[var(--ink-slate-navy)] sm:text-[30px]">
                      “You paused when mentioning the boat in Maine. What did
                      the harbor smell like that morning?”
                    </h3>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-[36px] border border-[#1573dd] px-3 py-1 font-inter-ui text-[13px] text-[var(--accent-cobalt)]">
                      Vulnerability Recognized · Softened Tone
                    </span>
                    <Link
                      href="/vault?tab=biographer"
                      className="font-inter-ui text-[14px] text-[var(--accent-cobalt)] underline underline-offset-4"
                    >
                      Open Biographer Room
                    </Link>
                  </div>
                </div>

                {/* Sage Card (#dde9d3) — Voice Preservation */}
                <div className="pastel-card-sage p-7 sm:p-[36px]">
                  <span className="font-nunito-eyebrow">
                    3 CLIPS · PERMANENT VOICE
                  </span>
                  <h3 className="font-louize-card mt-2 text-[26px] text-[var(--ink-slate-navy)]">
                    45 seconds of speech preserves a lifetime of cadence.
                  </h3>
                  <p className="font-avenir-body mt-2 text-[15px] text-[var(--ink-body-slate)]">
                    Cloned with Gnani AI acoustic modeling and sealed with your
                    family’s private AES-256 key.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CalmReveal>
      </div>
    </section>
  )
}
