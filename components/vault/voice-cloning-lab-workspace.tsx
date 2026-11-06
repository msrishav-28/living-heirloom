'use client'

import React, { useState, useEffect } from 'react'
import { voicePreviewEngine, type EmotionalTone } from '@/lib/voice-synth'
import {
  GNANI_LANGUAGES,
  type FamilyMember,
} from '@/lib/heirloom-vault-store'
import { useHeirloomStudio } from '@/hooks/useHeirloomStudio'
import { SupportedLanguageSchema } from '@/lib/product-contracts'
import { VoiceConsent } from './voice-consent'
import { BespokeSelect } from '@/components/ui/bespoke-controls'

interface VoiceCloningLabWorkspaceProps {
  members: FamilyMember[]
  initialMemberId?: string
  onMarkClipRecorded: (memberId: string, clipIndex: number) => void
  onCreateCapsuleFromLab: (payload: {
    speakerId: string
    languageCode: string
    languageName: string
    tone: EmotionalTone
    toneLabel: string
    message: string
  }) => void
}

const TONE_PROFILES: Array<{
  id: EmotionalTone
  label: string
  desc: string
  acousticSpec: string
}> = [
  {
    id: 'reflective',
    label: 'Warm & Reflective',
    desc: 'Unhurried afternoon porch cadence with gentle breath pauses',
    acousticSpec: '0.91x pace · 680Hz warm formant resonance',
  },
  {
    id: 'lullaby',
    label: 'Gentle Lullaby',
    desc: 'Softened bedside comfort for young children or quiet evenings',
    acousticSpec: '0.84x pace · 520Hz hushed acoustic envelope',
  },
  {
    id: 'joyful',
    label: 'Joyful Celebration',
    desc: 'Bright, smiling inflection for weddings, birthdays, and milestones',
    acousticSpec: '1.02x pace · 940Hz overtone warmth lift',
  },
  {
    id: 'wisdom',
    label: 'Steady Wisdom',
    desc: 'Grounded, reassuring conviction for life counsel and lineage stories',
    acousticSpec: '0.88x pace · 610Hz chest resonance',
  },
]

export function VoiceCloningLabWorkspace({
  members,
  initialMemberId,
}: VoiceCloningLabWorkspaceProps) {
  const speakers = members.filter((m) => m.role !== 'recipient')
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(
    initialMemberId && speakers.some((s) => s.id === initialMemberId)
      ? initialMemberId
      : speakers[0]?.id || members[0]?.id
  )
  const studio = useHeirloomStudio(selectedSpeakerId, 'childhood_roots')
  const [consent, setConsent] = useState(false)
  const [recordingClipIdx, setRecordingClipIdx] = useState<number | null>(null)
  const [selectedLangCode, setSelectedLangCode] = useState<string>('HI')
  const [selectedTone, setSelectedTone] = useState<EmotionalTone>('reflective')
  const [customScript, setCustomScript] = useState<string>('')
  const isPlaying = studio.state.inFlight && !studio.recording
  const playProgress = 0

  useEffect(() => {
    if (initialMemberId && speakers.some((s) => s.id === initialMemberId)) {
      setSelectedSpeakerId(initialMemberId)
    }
  }, [initialMemberId, speakers])

  useEffect(() => {
    return () => {
      voicePreviewEngine.stopAll()
    }
  }, [])

  const activeSpeaker =
    members.find((m) => m.id === selectedSpeakerId) || members[0]
  const activeLang =
    GNANI_LANGUAGES.find((l) => l.code === selectedLangCode) ||
    GNANI_LANGUAGES[0]
  const activeToneObj =
    TONE_PROFILES.find((t) => t.id === selectedTone) || TONE_PROFILES[0]

  const spokenText =
    customScript.trim().length > 0 ? customScript : activeLang.sampleBlessing

  const handleRecordCalibrationClip = async (idx: number) => {
    if (studio.recording) { studio.stopRecording(); return }
    setRecordingClipIdx(idx)
    await studio.onCalibrateVoice()
    setRecordingClipIdx(null)
  }
  const handleSynthesizePreview = () => studio.onSynthesize(spokenText, SupportedLanguageSchema.parse(activeLang.speechLang))

  const speakerOptions = speakers.map((s) => ({
    value: s.id,
    label: s.name,
    sublabel: `${s.relation} · ${s.fundamentalHz}`,
    badge: `${s.harmonicFidelity}% Cloned`,
  }))

  const langOptions = GNANI_LANGUAGES.map((l) => ({
    value: l.code,
    label: `${l.nativeName} · ${l.name}`,
    sublabel: l.region,
    badge: l.code,
  }))

  return (
    <div className="space-y-8">
      <VoiceConsent checked={consent} onChange={value => { setConsent(value); studio.setConsent(value) }} />
      <p role="status">Real calibration: {studio.clipCount}/3 clips {studio.state.embedding ? '· [1 × 768] voice embedding saved' : '· read each passage for about eight seconds'}</p>
      {studio.state.error && <p role="alert" className="text-red-700">{studio.state.error}</p>}
      {studio.playbackUrl && <audio src={studio.playbackUrl} controls />}
      <p>Profile fidelity and historical clip badges below are sample data. Real calibration status is shown above.</p>
      {/* Top Studio Header */}
      <div className="flex flex-col justify-between gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="font-nunito-eyebrow">
            WORKSPACE 02 · GNANI AI VOICE CLONING & MULTILINGUAL LAB
          </span>
          <h2 className="font-louize-card mt-1.5 text-[28px] text-[var(--ink-black)] sm:text-[34px]">
            Three short clips preserve a voice across nine Indian languages and English
            languages.
          </h2>
          <p className="font-avenir-body mt-1.5 max-w-[700px] text-[16px] text-[var(--ink-body-slate)]">
            Calibrate vocal timbre from three 12-second sentences, then test
            cross-lingual speech synthesis in Hindi, Tamil, Kannada, Telugu,
            Malayalam, Marathi, Bengali, Gujarati, Punjabi, and English.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <BespokeSelect
            id="lab-speaker-select"
            label="Active Voice Profile"
            value={activeSpeaker.id}
            options={speakerOptions}
            onChange={setSelectedSpeakerId}
          />
        </div>
      </div>

      {/* Main 12-Column Studio Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 Cols: 3-Clip Acoustic Calibration Deck */}
        <div className="pastel-card-parchment flex flex-col justify-between p-7 sm:p-9 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-nunito-eyebrow">
                STEP 1 · 3-CLIP CALIBRATION
              </span>
              <span className="rounded-[36px] border border-[#ff5924] bg-[var(--card)] px-3 py-0.5 font-nunito text-[11px] font-semibold tracking-[0.07em] text-[var(--accent-ember)] uppercase">
                {activeSpeaker.harmonicFidelity}% Timbre Lock
              </span>
            </div>

            <h3 className="font-louize-card mt-3 text-[28px] text-[var(--ink-slate-navy)]">
              {activeSpeaker.name}’s Acoustic Fingerprint
            </h3>
            <p className="font-avenir-body mt-2 text-[16px] text-[var(--ink-body-slate)]">
              Gnani AI extracts fundamental pitch ({activeSpeaker.fundamentalHz}
              ), breath micro-pauses, and vowel warmth from these three short
              phrases:
            </p>

            <div className="mt-6 space-y-3.5">
              {activeSpeaker.clips.map((clip, idx) => {
                const isRec = recordingClipIdx === idx
                return (
                  <div
                    key={clip.id}
                    className="rounded-[12px] bg-[var(--card)] p-4 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-inter-ui text-[14px] font-medium text-[var(--ink-black)]">
                          Clip {clip.number}: {clip.title}
                        </span>
                        <span className="font-inter-ui ml-2 text-[12px] text-[var(--muted-foreground)]">
                          ({clip.durationSec}s · SNR {clip.snrDb} dB)
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!consent || (studio.state.inFlight && !studio.recording)}
                        onClick={() => void handleRecordCalibrationClip(idx)}
                        className={
                          isRec
                            ? 'btn-ember-pill px-3.5 py-1 text-[11px]'
                            : 'btn-slate-pill px-3.5 py-1 text-[11px]'
                        }
                      >
                        {isRec
                          ? 'Capturing...'
                          : clip.captured
                            ? 'Re-Calibrate'
                            : 'Record Clip'}
                      </button>
                    </div>

                    <p className="font-avenir-body mt-2 text-[15px] text-[var(--ink-slate-navy)]">
                      {clip.prompt}
                    </p>

                    {isRec && (
                      <div className="mt-3 flex h-6 items-center gap-1">
                        {Array.from({ length: 24 }).map((_, barIdx) => (
                          <span
                            key={barIdx}
                            className="flex-1 animate-pulse rounded-full bg-[#ff5924]"
                            style={{
                              height: `${30 + ((barIdx * 19) % 70)}%`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 rounded-[12px] bg-[var(--card)] p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-inter-ui text-[var(--ink-slate-navy)]">
                Gnani AI Zero-Shot Voice ID:
              </span>
              <span className="font-mono text-[var(--accent-ember)]">
                {activeSpeaker.gnaniModelId}
              </span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Cross-Lingual & Emotional Prosody Synthesizer */}
        <div className="pastel-card-blue flex flex-col justify-between p-7 sm:p-9 lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-nunito-eyebrow">
                STEP 2 · CROSS-LINGUAL & PROSODY SYNTHESIS
              </span>
              <span className="rounded-[36px] border border-[#1573dd] bg-[var(--card)] px-3 py-0.5 font-inter-ui text-[12px] text-[var(--accent-cobalt)]">
                Gnani Indic & Global Neural Engine
              </span>
            </div>

            <h3 className="font-louize-card mt-3 text-[30px] text-[var(--ink-slate-navy)]">
              Speak in {activeLang.nativeName} ({activeLang.name}) with{' '}
              {activeSpeaker.name.split(' ')[0]}’s exact voice.
            </h3>

            {/* Bespoke Language Selector + Quick Language Pills */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <BespokeSelect
                id="lab-language-select"
                label="Target Heritage Language (Gnani AI — Nine Indian Languages + English)"
                value={selectedLangCode}
                options={langOptions}
                onChange={(code) => {
                  setSelectedLangCode(code)
                  setCustomScript('')
                }}
              />

              <BespokeSelect
                id="lab-tone-select"
                label="Emotional Prosody Contour"
                value={selectedTone}
                options={TONE_PROFILES.map((t) => ({
                  value: t.id,
                  label: t.label,
                  sublabel: t.acousticSpec,
                }))}
                onChange={(val) => setSelectedTone(val as EmotionalTone)}
              />
            </div>

            {/* Quick-Switch Language Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {GNANI_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLangCode(lang.code)
                    setCustomScript('')
                  }}
                  className={
                    selectedLangCode === lang.code
                      ? 'btn-ember-pill bg-[var(--card)] px-3 py-1 text-[11px]'
                      : 'btn-slate-pill bg-[var(--card)]/70 px-3 py-1 text-[11px]'
                  }
                >
                  <span>
                    {lang.nativeName} · {lang.code}
                  </span>
                </button>
              ))}
            </div>

            {/* Editable Spoken Heirloom Script */}
            <div className="mt-6 rounded-[14px] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="lab-script-textarea"
                  className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
                >
                  Spoken Heirloom Passage ({activeLang.name} ·{' '}
                  {activeToneObj.label})
                </label>
                {customScript && (
                  <button
                    type="button"
                    onClick={() => setCustomScript('')}
                    className="font-inter-ui text-[12px] text-[var(--accent-cobalt)] underline"
                  >
                    Restore translated blessing
                  </button>
                )}
              </div>

              <textarea
                id="lab-script-textarea"
                rows={3}
                value={spokenText}
                onChange={(e) => setCustomScript(e.target.value)}
                className="font-louize-card mt-2 w-full rounded-[10px] bg-[var(--background)] p-4 text-[23px] text-[var(--ink-black)] focus:outline-1 focus:outline-[#ff5924]"
              />

              {/* Live Waveform Visualizer */}
              <div className="mt-4 flex h-12 items-end gap-1.5 pt-2">
                {Array.from({ length: 32 }).map((_, i) => {
                  const ratio = i / 32
                  const active = isPlaying && ratio <= playProgress
                  const barHeight = 26 + ((i * 23 + 11) % 68)
                  return (
                    <span
                      key={i}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        height: `${barHeight}%`,
                        backgroundColor: active
                          ? '#ff5924'
                          : i % 3 === 0
                            ? '#3a475a'
                            : '#afb5c1',
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={studio.state.inFlight || !consent || !studio.state.embedding}
                onClick={() => void handleSynthesizePreview()}
                className="btn-ember-pill bg-[var(--card)]"
              >
                <span
                  className={`h-2 w-2 rounded-full bg-[#ff5924] ${
                    isPlaying ? 'animate-ping' : ''
                  }`}
                />
                <span>
                  {isPlaying
                    ? `Playing ${activeLang.name} (${Math.round(playProgress * 100)}%)`
                    : `Audition ${activeSpeaker.name.split(' ')[0]} in ${activeLang.name}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/vault?tab=capsules' }}
                className="btn-slate-pill bg-[var(--card)]"
              >
                <span>Seal into Time-Lock Vault</span>
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}
