'use client'

import React, { useState } from 'react'

import { voicePreviewEngine, type EmotionalTone } from '@/lib/voice-synth'
import {
  GNANI_LANGUAGES,
  type FamilyMember,
  type HeirloomCapsule,
} from '@/lib/heirloom-vault-store'
import { BespokeSelect, WaxSealBadge } from '@/components/ui/bespoke-controls'

interface CapsuleVaultWorkspaceProps {
  capsules: HeirloomCapsule[]
  members: FamilyMember[]
  initialSpeakerId?: string
  onCreateCapsule: (input: {
    title: string
    speakerId: string
    recipientId: string
    milestoneLabel: string
    unlockDate: string
    languageCode: string
    languageName: string
    tone: EmotionalTone
    toneLabel: string
    message: string
    passphrase?: string
  }) => Promise<HeirloomCapsule>
  onToggleSealState: (capsuleId: string, forceState?: boolean) => void
}

const MILESTONE_DATE_OPTIONS = [
  {
    value: 'October 14, 2036',
    label: 'Daughter’s Wedding Morning · Oct 14, 2036',
    sublabel: 'Time-locked 10-year horizon',
    badge: '2036',
  },
  {
    value: 'June 04, 2032',
    label: '18th Birthday Morning · Jun 04, 2032',
    sublabel: 'Stepping into adulthood',
    badge: '2032',
  },
  {
    value: 'January 15, 2040',
    label: 'First Grandchild’s Naming Ceremony · Jan 15, 2040',
    sublabel: 'Cross-generational blessing',
    badge: '2040',
  },
  {
    value: 'May 22, 2045',
    label: '25th Family Anniversary · May 22, 2045',
    sublabel: 'Quarter-century time capsule',
    badge: '2045',
  },
]

const TONE_OPTIONS = [
  {
    value: 'reflective',
    label: 'Warm & Reflective',
    sublabel: 'Afternoon porch cadence',
  },
  {
    value: 'lullaby',
    label: 'Gentle Lullaby',
    sublabel: 'Hushed bedside tenderness',
  },
  {
    value: 'joyful',
    label: 'Joyful Celebration',
    sublabel: 'Lifted wedding & birthday warmth',
  },
  {
    value: 'wisdom',
    label: 'Steady Wisdom',
    sublabel: 'Grounded life counsel',
  },
]

export function CapsuleVaultWorkspace({
  capsules,
  members,
  initialSpeakerId,
  onCreateCapsule,
  onToggleSealState,
}: CapsuleVaultWorkspaceProps) {
  const [filter, setFilter] = useState<'all' | 'sealed' | 'unsealed'>('all')
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<string>(
    capsules[0]?.id || '',
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [playProgress, setPlayProgress] = useState(0)
  const [showComposer, setShowComposer] = useState(false)

  // Composer states
  const speakers = members.filter((m) => m.role !== 'recipient')
  const [compTitle, setCompTitle] = useState(
    'For a Quiet Morning When You Need Courage',
  )
  const [compSpeakerId, setCompSpeakerId] = useState(
    initialSpeakerId || speakers[0]?.id || members[0]?.id,
  )
  const [compRecipientId, setCompRecipientId] = useState(
    members.find((m) => m.role === 'recipient')?.id || members[0]?.id,
  )
  const [compUnlockDate, setCompUnlockDate] = useState('October 14, 2036')
  const [compLangCode, setCompLangCode] = useState('EN')
  const [compTone, setCompTone] = useState<EmotionalTone>('reflective')
  const [compMessage, setCompMessage] = useState(
    'Whenever the road ahead feels steep, pause for a breath and remember that our family’s love was built for long journeys.',
  )
  const [compPassphrase, setCompPassphrase] = useState(
    'camden-porch-sunlight-1998',
  )

  const filteredCapsules = capsules.filter((c) => {
    if (filter === 'sealed') return c.isSealed
    if (filter === 'unsealed') return !c.isSealed
    return true
  })

  const activeCapsule =
    filteredCapsules.find((c) => c.id === selectedCapsuleId) ||
    filteredCapsules[0] ||
    capsules[0]

  const handlePlayCapsule = (cap: HeirloomCapsule) => {
    if (isPlaying) {
      voicePreviewEngine.stopAll()
      setIsPlaying(false)
      setPlayProgress(0)
      return
    }
    setIsPlaying(true)
    setPlayProgress(0)
    voicePreviewEngine.playCapsuleAudio(
      cap.message,
      cap.tone,
      cap.languageCode,
      (p) => setPlayProgress(p),
      () => {
        setIsPlaying(false)
        setPlayProgress(0)
      },
    )
  }

  const handleExportCapsuleJson = (cap: HeirloomCapsule) => {
    const exportPayload = {
      schema: 'living-heirloom-gnani-vault-v1',
      capsuleId: cap.id,
      title: cap.title,
      speaker: cap.speakerName,
      recipient: cap.recipientName,
      milestone: cap.milestoneLabel,
      unlockDate: cap.unlockDate,
      language: cap.languageName,
      emotionalTone: cap.toneLabel,
      encryption: cap.encryption,
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cap.id}.sample.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCreateAndSeal = async (e: React.FormEvent) => {
    e.preventDefault()
    const langObj =
      GNANI_LANGUAGES.find((l) => l.code === compLangCode) || GNANI_LANGUAGES[0]
    const toneObj =
      TONE_OPTIONS.find((t) => t.value === compTone) || TONE_OPTIONS[0]
    const milestoneObj =
      MILESTONE_DATE_OPTIONS.find((m) => m.value === compUnlockDate) ||
      MILESTONE_DATE_OPTIONS[0]

    const created = await onCreateCapsule({
      title: compTitle,
      speakerId: compSpeakerId,
      recipientId: compRecipientId,
      milestoneLabel: milestoneObj.label.split('·')[0].trim(),
      unlockDate: compUnlockDate,
      languageCode: langObj.speechLang,
      languageName: `${langObj.nativeName} (${langObj.name})`,
      tone: compTone,
      toneLabel: toneObj.label,
      message: compMessage,
      passphrase: compPassphrase,
    })

    setSelectedCapsuleId(created.id)
    setShowComposer(false)
  }

  return (
    <div className="space-y-8">
      <p role="note">
        The archive below contains prototype examples. Its seal switch and
        browser voice previews demonstrate the design; use the recorded heirloom
        controls above for real timelock encryption.
      </p>
      {/* Top Workspace Header */}
      <div className="flex flex-col justify-between gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="font-nunito-eyebrow">
            WORKSPACE 04 · TIME-LOCK CAPSULE VAULT & UNSEALING CEREMONY
          </span>
          <h2 className="font-louize-card mt-1.5 text-[28px] text-[var(--ink-black)] sm:text-[34px]">
            Spoken letters sealed with AES-256-GCM for future milestones.
          </h2>
          <p className="font-avenir-body mt-1.5 max-w-[680px] text-[16px] text-[var(--ink-body-slate)]">
            Browse your family’s time-locked capsules, run the future unsealing
            ceremony, or export self-contained archival packages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowComposer((prev) => !prev)}
            className="btn-ember-pill"
          >
            <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
            <span>
              {showComposer ? 'Close Capsule Composer' : 'Seal New Capsule'}
            </span>
          </button>
        </div>
      </div>

      {/* Bespoke New Capsule Composer Drawer */}
      {showComposer && (
        <form
          onSubmit={handleCreateAndSeal}
          className="pastel-card-parchment p-6 sm:p-10"
        >
          <span className="font-nunito-eyebrow">
            NEW AES-256 TIME-LOCK CAPSULE COMPOSER
          </span>
          <h3 className="font-louize-card mt-2 text-[28px] text-[var(--ink-slate-navy)]">
            Compose and cryptographically seal a future spoken heirloom.
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label
                htmlFor="comp-title"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Capsule Title
              </label>
              <input
                id="comp-title"
                type="text"
                required
                value={compTitle}
                onChange={(e) => setCompTitle(e.target.value)}
                className="font-inter-ui w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[15px] text-[var(--foreground)] focus:border-[#ff5924] focus:outline-none"
              />
            </div>

            <BespokeSelect
              id="comp-speaker"
              label="Preserved Voice (Gnani AI)"
              value={compSpeakerId}
              options={speakers.map((s) => ({
                value: s.id,
                label: s.name,
                sublabel: s.relation,
                badge: `${s.harmonicFidelity}%`,
              }))}
              onChange={setCompSpeakerId}
            />

            <BespokeSelect
              id="comp-recipient"
              label="Future Recipient"
              value={compRecipientId}
              options={members.map((m) => ({
                value: m.id,
                label: m.name,
                sublabel: m.relation,
              }))}
              onChange={setCompRecipientId}
            />

            <BespokeSelect
              id="comp-milestone"
              label="Time-Lock Unlock Milestone"
              value={compUnlockDate}
              options={MILESTONE_DATE_OPTIONS}
              onChange={setCompUnlockDate}
            />

            <BespokeSelect
              id="comp-lang"
              label="Spoken Language (Gnani AI — 10 Languages)"
              value={compLangCode}
              options={GNANI_LANGUAGES.map((l) => ({
                value: l.code,
                label: `${l.nativeName} · ${l.name}`,
                sublabel: l.region,
              }))}
              onChange={setCompLangCode}
            />

            <BespokeSelect
              id="comp-tone"
              label="Emotional Inflection"
              value={compTone}
              options={TONE_OPTIONS}
              onChange={(v) => setCompTone(v as EmotionalTone)}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <label
                htmlFor="comp-message"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Spoken Heirloom Letter
              </label>
              <textarea
                id="comp-message"
                rows={3}
                value={compMessage}
                onChange={(e) => setCompMessage(e.target.value)}
                className="font-louize-card w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-4 text-[22px] text-[var(--ink-slate-navy)] focus:border-[#ff5924] focus:outline-none"
              />
            </div>

            <div className="lg:col-span-4">
              <label
                htmlFor="comp-passphrase"
                className="font-nunito mb-1.5 block text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
              >
                Family PBKDF2-SHA256 Passphrase
              </label>
              <input
                id="comp-passphrase"
                type="text"
                value={compPassphrase}
                onChange={(e) => setCompPassphrase(e.target.value)}
                className="font-mono w-full rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] text-[var(--foreground)] focus:border-[#ff5924] focus:outline-none"
              />
              <p className="font-inter-ui mt-2 text-[12px] text-[var(--muted-foreground)]">
                Derives a 256-bit AES-GCM key via 100,000 PBKDF2 iterations.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-ember-pill bg-[var(--card)]">
              <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
              <span>Encrypt & Seal Time-Lock Capsule</span>
            </button>
            <button
              type="button"
              onClick={() => setShowComposer(false)}
              className="btn-slate-pill bg-[var(--card)]"
            >
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: `All Capsules (${capsules.length})` },
              {
                id: 'sealed',
                label: `Time-Locked (${capsules.filter((c) => c.isSealed).length})`,
              },
              {
                id: 'unsealed',
                label: `Unsealed & Playable (${capsules.filter((c) => !c.isSealed).length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={
                filter === tab.id
                  ? 'btn-ember-pill bg-[var(--card)] px-4 py-2 text-[12px]'
                  : 'btn-slate-pill bg-[var(--card)] px-4 py-2 text-[12px]'
              }
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <span className="font-inter-ui text-[13px] text-[var(--muted-foreground)]">
          All capsules verified with WebCrypto AES-256-GCM
        </span>
      </div>

      {/* 12-Column Split: Left 5 Cols Capsule List, Right 7 Cols Unsealing Ceremony & Player */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 Cols: Capsule Timeline */}
        <div className="space-y-3.5 lg:col-span-5">
          {filteredCapsules.map((cap, idx) => {
            const isSelected = cap.id === activeCapsule?.id
            const toneBg =
              idx % 3 === 0
                ? 'pastel-card-parchment'
                : idx % 3 === 1
                  ? 'pastel-card-sage'
                  : 'pastel-card-blue'

            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => {
                  voicePreviewEngine.stopAll()
                  setIsPlaying(false)
                  setSelectedCapsuleId(cap.id)
                }}
                className={`${toneBg} flex w-full items-start gap-4 p-5 text-left transition-all sm:p-6 ${
                  isSelected
                    ? 'ring-2 ring-[#ff5924]'
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                <WaxSealBadge
                  crest={cap.isSealed ? 'star' : 'olive'}
                  sealed={cap.isSealed}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--accent-ember)] uppercase">
                      {cap.milestoneLabel} · {cap.unlockDate}
                    </span>
                    <span
                      className={`rounded-[36px] px-2.5 py-0.5 font-nunito text-[10px] font-semibold tracking-[0.07em] uppercase ${
                        cap.isSealed
                          ? 'border border-[#ff5924] bg-[var(--card)] text-[var(--accent-ember)]'
                          : 'border border-[#1573dd] bg-[var(--card)] text-[var(--accent-cobalt)]'
                      }`}
                    >
                      {cap.isSealed ? 'Sealed' : 'Unsealed'}
                    </span>
                  </div>

                  <h3 className="font-louize-card mt-1.5 text-[23px] text-[var(--ink-black)]">
                    {cap.title}
                  </h3>

                  <p className="font-inter-ui mt-1 text-[13px] text-[var(--ink-slate-navy)]">
                    Voice: <strong>{cap.speakerName}</strong> → To:{' '}
                    <strong>{cap.recipientName}</strong> · {cap.languageName}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right 7 Cols: Active Capsule Unsealing Ceremony */}
        {activeCapsule && (
          <div className="pastel-card-sage flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-nunito-eyebrow">
                  {activeCapsule.isSealed
                    ? 'TIME-LOCKED AES-256-GCM CAPSULE'
                    : 'UNSEALED SPOKEN HEIRLOOM'}
                </span>
                <span className="rounded-[36px] border border-[#ff5924] bg-[var(--card)] px-3.5 py-1 font-nunito text-[12px] font-semibold tracking-[0.07em] text-[var(--accent-ember)] uppercase">
                  Unlocks: {activeCapsule.unlockDate}
                </span>
              </div>

              <h3 className="font-louize-card mt-3 text-[32px] text-[var(--ink-black)] sm:text-[38px]">
                {activeCapsule.title}
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[var(--ink-slate-navy)]">
                <span>
                  Preserved Voice: <strong>{activeCapsule.speakerName}</strong>{' '}
                  ({activeCapsule.speakerRelation})
                </span>
                <span>·</span>
                <span>
                  Recipient: <strong>{activeCapsule.recipientName}</strong>
                </span>
                <span>·</span>
                <span>{activeCapsule.languageName}</span>
              </div>

              {/* Sealed vs Unsealed View */}
              {activeCapsule.isSealed ? (
                <div className="mt-6 rounded-[14px] bg-[var(--card)] p-6">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--accent-ember)] uppercase">
                        Cryptographic Seal Intact
                      </p>
                      <p className="font-inter-ui mt-0.5 text-[14px] text-[var(--ink-body-slate)]">
                        Scheduled for{' '}
                        <strong>{activeCapsule.milestoneLabel}</strong> on{' '}
                        {activeCapsule.unlockDate}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleSealState(activeCapsule.id, false)}
                      className="btn-ember-pill shrink-0"
                    >
                      <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                      <span>Break Wax Seal & Unseal Now</span>
                    </button>
                  </div>

                  <div className="mt-5 rounded-[10px] bg-[var(--background)] p-4 font-mono text-[12px] text-[var(--ink-body-slate)]">
                    <div className="flex flex-wrap justify-between gap-2 text-[11px] text-[var(--muted-foreground)]">
                      <span>
                        {activeCapsule.encryption.algorithm} · IV:{' '}
                        {activeCapsule.encryption.ivHex}
                      </span>
                      <span>
                        Salt: {activeCapsule.encryption.saltHex.slice(0, 16)}...
                      </span>
                    </div>
                    <p className="mt-2 break-all leading-relaxed text-[var(--ink-slate-navy)]">
                      {activeCapsule.encryption.ciphertextHex}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[14px] bg-[var(--card)] p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--accent-cobalt)] uppercase">
                      Unsealed Spoken Letter · {activeCapsule.toneLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSealState(activeCapsule.id, true)}
                      className="font-inter-ui text-[13px] text-[var(--muted-foreground)] underline"
                    >
                      Re-seal capsule
                    </button>
                  </div>

                  <blockquote className="font-louize-card mt-4 text-[26px] text-[var(--ink-black)] sm:text-[30px]">
                    “{activeCapsule.message}”
                  </blockquote>

                  {/* Acoustic Waveform Player */}
                  <div className="mt-6 flex h-14 items-end gap-1.5 py-2">
                    {activeCapsule.waveform.map((h, i) => {
                      const ratio = i / activeCapsule.waveform.length
                      const active = isPlaying && ratio <= playProgress
                      return (
                        <span
                          key={i}
                          className="flex-1 rounded-full transition-all duration-300"
                          style={{
                            height: `${h}%`,
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
              )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCapsule.isSealed) {
                      onToggleSealState(activeCapsule.id, false)
                    }
                    handlePlayCapsule(activeCapsule)
                  }}
                  className="btn-ember-pill bg-[var(--card)]"
                >
                  <span
                    className={`h-2 w-2 rounded-full bg-[#ff5924] ${
                      isPlaying ? 'animate-ping' : ''
                    }`}
                  />
                  <span>
                    {isPlaying
                      ? `Stop Spoken Playback (${Math.round(playProgress * 100)}%)`
                      : `Play in ${activeCapsule.speakerName.split(' ')[0]}’s Voice`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportCapsuleJson(activeCapsule)}
                  className="btn-slate-pill bg-[var(--card)]"
                >
                  <span>Export sample metadata</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
