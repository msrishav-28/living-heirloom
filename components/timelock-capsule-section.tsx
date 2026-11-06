'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { voicePreviewEngine, type EmotionalTone } from '@/lib/voice-synth'
import {
  encryptHeirloomInBrowser,
  type EncryptedHeirloomPacket,
} from '@/lib/local-crypto'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

interface MilestonePreset {
  id: string
  label: string
  unlockYear: string
  recipient: string
  tone: EmotionalTone
  langCode: string
  langName: string
  defaultMessage: string
}

const MILESTONE_PRESETS: MilestonePreset[] = [
  {
    id: 'wedding-2036',
    label: 'Daughter’s Wedding Morning',
    unlockYear: 'October 14, 2036',
    recipient: 'For Maya',
    tone: 'reflective',
    langCode: 'en-US',
    langName: 'English',
    defaultMessage:
      'Maya, take a slow breath before you walk through those doors. Marriage is built in the quiet mornings—making coffee, forgiving quickly, and laughing when plans fall apart.',
  },
  {
    id: 'birthday-2032',
    label: 'Son’s 18th Birthday',
    unlockYear: 'June 04, 2032',
    recipient: 'For Leo',
    tone: 'wisdom',
    langCode: 'en-US',
    langName: 'English',
    defaultMessage:
      'Leo, today you step into your own life. Measure your success by the kindness you show when nobody is watching, and never be afraid to ask for help.',
  },
  {
    id: 'grandchild-hi',
    label: 'Future Grandchild (Hindi)',
    unlockYear: 'First Grandchild’s 10th Birthday',
    recipient: 'For my grandchild',
    tone: 'lullaby',
    langCode: 'hi-IN',
    langName: 'Hindi',
    defaultMessage:
      'मेरे प्यारे बच्चे, हमारी कहानियाँ और हमारा प्यार हमेशा तुम्हारे साथ रहेंगे।',
  },
]

export function TimelockCapsuleSection() {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0)
  const [recipientName, setRecipientName] = useState(
    MILESTONE_PRESETS[0].recipient,
  )
  const [unlockDateLabel, setUnlockDateLabel] = useState(
    MILESTONE_PRESETS[0].unlockYear,
  )
  const [messageText, setMessageText] = useState(
    MILESTONE_PRESETS[0].defaultMessage,
  )
  const [tone, setTone] = useState<EmotionalTone>(MILESTONE_PRESETS[0].tone)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sealedPacket, setSealedPacket] =
    useState<EncryptedHeirloomPacket | null>(null)
  const [unsealedPreview, setUnsealedPreview] = useState(false)

  const currentPreset = MILESTONE_PRESETS[selectedPresetIdx]

  const handleSelectPreset = (idx: number) => {
    const p = MILESTONE_PRESETS[idx]
    setSelectedPresetIdx(idx)
    setRecipientName(p.recipient)
    setUnlockDateLabel(p.unlockYear)
    setMessageText(p.defaultMessage)
    setTone(p.tone)
    setSealedPacket(null)
    setUnsealedPreview(false)
    voicePreviewEngine.stopAll()
    setIsPlaying(false)
  }

  const handleListenPreview = () => {
    if (isPlaying) {
      voicePreviewEngine.stopAll()
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    voicePreviewEngine.playCapsuleAudio(
      messageText,
      tone,
      currentPreset.langCode,
      undefined,
      () => setIsPlaying(false),
    )
  }

  const handleSealCapsule = async () => {
    const payload = JSON.stringify({
      recipient: recipientName,
      unlockDate: unlockDateLabel,
      tone,
      language: currentPreset.langName,
      message: messageText,
    })
    const encrypted = await encryptHeirloomInBrowser(payload)
    setSealedPacket(encrypted)
    setUnsealedPreview(false)
  }

  const handleDownloadCapsule = () => {
    if (!sealedPacket) return
    const exportObj = {
      type: 'living-heirloom-time-locked-capsule-v1',
      recipient: recipientName,
      timeLockUnlockCondition: unlockDateLabel,
      voiceModel: '3-Clip Gnani AI Timbre Profile',
      emotionalTone: tone,
      encryption: sealedPacket,
    }
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recipientName.toLowerCase().replace(/\s+/g, '-')}-living-heirloom.capsule.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section
      id="time-lock-studio"
      className="w-full bg-[var(--canvas-blush)] py-24 sm:py-[115px]"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <p className="mb-4 text-sm">
          Interactive sample: browser speech and an encryption preview. For a
          real dated timelock and playable recordings, open the Capsule Vault.
        </p>
        {/* Section Eyebrow + Louize Display Heading */}
        <div className="max-w-[960px]">
          <CalmReveal distance={14}>
            <p className="font-nunito-eyebrow mb-4">
              TIME-LOCKED HEIRLOOM DELIVERY
            </p>
          </CalmReveal>

          <h2 className="font-louize-heading-lg text-[clamp(2.55rem,5.8vw,5rem)] text-[var(--ink-black)]">
            <RevealLines
              lines={[
                <React.Fragment key="t1">
                  Seal a spoken letter today.
                </React.Fragment>,
                <React.Fragment key="t2">
                  <em className="font-normal italic tracking-[-0.036em]">
                    Deliver it decades from now.
                  </em>
                </React.Fragment>,
              ]}
            />
          </h2>

          <CalmReveal delay={180} distance={18}>
            <p className="font-avenir-body mt-7 max-w-[720px] text-[18px] text-[var(--ink-body-slate)] sm:text-[20px]">
              Compose an heirloom capsule below, audition it in a Gnani AI
              preserved voice, and time-lock it for a future milestone—a wedding
              morning, an 18th birthday, or a quiet afternoon twenty years
              ahead.
            </p>
          </CalmReveal>
        </div>

        {/* Interactive Capsule Builder Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Parchment Card (#f3f0e7) Studio Composer */}
          <CalmReveal
            delay={120}
            distance={24}
            className="pastel-card-parchment p-8 sm:p-[50px] lg:col-span-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-nunito-eyebrow">
                COMPOSE TIME-LOCKED CAPSULE
              </span>
              <div className="flex flex-wrap gap-2">
                {MILESTONE_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={
                      idx === selectedPresetIdx
                        ? 'btn-ember-pill bg-[var(--card)] px-3.5 py-1.5 text-[12px]'
                        : 'btn-slate-pill px-3.5 py-1.5 text-[12px]'
                    }
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="capsule-recipient"
                  className="font-nunito block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
                >
                  Recipient
                </label>
                <input
                  id="capsule-recipient"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="font-inter-ui mt-1.5 w-full rounded-[12px] bg-[var(--card)] px-4 py-3 text-[16px] text-[var(--foreground)] focus:outline-1 focus:outline-[#ff5924]"
                />
              </div>

              <div>
                <label
                  htmlFor="capsule-unlock-date"
                  className="font-nunito block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
                >
                  Time-Lock Milestone Date
                </label>
                <input
                  id="capsule-unlock-date"
                  type="text"
                  value={unlockDateLabel}
                  onChange={(e) => setUnlockDateLabel(e.target.value)}
                  className="font-inter-ui mt-1.5 w-full rounded-[12px] bg-[var(--card)] px-4 py-3 text-[16px] text-[var(--foreground)] focus:outline-1 focus:outline-[#ff5924]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="capsule-message-textarea"
                className="font-nunito block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Heirloom Message (Spoken in Preserved Voice & Sealed with
                AES-256)
              </label>
              <textarea
                id="capsule-message-textarea"
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="font-louize-card mt-1.5 w-full rounded-[12px] bg-[var(--card)] p-5 text-[24px] text-[var(--ink-slate-navy)] focus:outline-1 focus:outline-[#ff5924]"
              />
            </div>

            {/* Action Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={handleListenPreview}
                className="btn-slate-pill bg-[var(--card)]"
              >
                <span>
                  {isPlaying
                    ? 'Stop Voice Preview'
                    : 'Audition in Cloned Voice'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSealCapsule}
                className="btn-ember-pill bg-[var(--card)]"
              >
                <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                <span>Seal Time-Lock Capsule (AES-256)</span>
              </button>

              <Link
                href="/vault?tab=capsules"
                className="font-inter-ui text-[14px] text-[var(--accent-cobalt)] underline underline-offset-4"
              >
                Manage all capsules in Vault →
              </Link>
            </div>
          </CalmReveal>

          {/* Right 5 Cols: Sage Card (#dde9d3) Capsule Preview */}
          <CalmReveal
            delay={220}
            distance={24}
            className="pastel-card-sage flex flex-col justify-between p-8 sm:p-[50px] lg:col-span-5"
          >
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-nunito-eyebrow">
                  {sealedPacket
                    ? 'CAPSULE CRYPTOGRAPHICALLY SEALED'
                    : 'HEIRLOOM WAX SEAL PREVIEW'}
                </span>
                <span className="rounded-[36px] border border-[#ff5924] bg-[var(--card)] px-3 py-0.5 font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--accent-ember)] uppercase">
                  {unlockDateLabel}
                </span>
              </div>

              <div className="mt-6 rounded-[12px] bg-[var(--card)] p-4">
                <h3 className="font-louize-card text-[24px] text-[var(--ink-slate-navy)]">
                  {recipientName}
                </h3>
                <p className="font-inter-ui text-[14px] text-[var(--muted-foreground)]">
                  Milestone: {unlockDateLabel} · Voice: {currentPreset.langName}
                </p>
              </div>

              {sealedPacket ? (
                <div className="mt-5 rounded-[12px] bg-[var(--card)] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--accent-ember)] uppercase">
                      Time-Lock Ciphertext Active
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnsealedPreview(!unsealedPreview)}
                      className="font-inter-ui text-[13px] text-[var(--accent-cobalt)] underline underline-offset-4"
                    >
                      {unsealedPreview
                        ? 'Show Encrypted Lock'
                        : 'Simulate Future Unsealing'}
                    </button>
                  </div>

                  {unsealedPreview ? (
                    <div className="mt-3">
                      <p className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--muted-foreground)] uppercase">
                        Unsealed on {unlockDateLabel}:
                      </p>
                      <p className="font-louize-card mt-2 text-[22px] text-[var(--ink-black)]">
                        “{messageText}”
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 break-all font-mono text-[12px] leading-relaxed text-[var(--ink-body-slate)]">
                      {sealedPacket.ciphertextHex.slice(0, 180)}...
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadCapsule}
                      className="btn-ember-pill w-full text-[13px]"
                    >
                      <span>Download .heirloom.json Capsule</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[12px] bg-[var(--card)]/80 p-5">
                  <p className="font-avenir-body text-[17px] text-[var(--ink-slate-navy)]">
                    Click <strong>“Seal Time-Lock Capsule”</strong> to encrypt
                    your spoken and written heirloom with AES-256-GCM and
                    generate a portable archival file for your family vault.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-[13px] text-[var(--ink-body-slate)]">
              <span>Self-contained HTML/JSON Heirloom Format</span>
              <span>Works 50+ years from now</span>
            </div>
          </CalmReveal>
        </div>
      </div>
    </section>
  )
}
