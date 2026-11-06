'use client'
import { BrandWaveform } from '@/components/brand-waveform'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useHeirloomVault } from '@/lib/heirloom-vault-store'
import { FamilyArchiveWorkspace } from '@/components/vault/family-archive-workspace'
import { VoiceCloningLabWorkspace } from '@/components/vault/voice-cloning-lab-workspace'
import { BiographerInterviewWorkspace } from '@/components/vault/biographer-interview-workspace'
import { CapsuleVaultWorkspace } from '@/components/vault/capsule-vault-workspace'
import { voicePreviewEngine } from '@/lib/voice-synth'
import { BespokeSelect } from '@/components/ui/bespoke-controls'
import { HeirloomModeSchema } from '@/lib/product-contracts'
import { ThemeToggle } from '@/components/theme-toggle'

type WorkspaceTab = 'family' | 'voicelab' | 'biographer' | 'capsules'

const WORKSPACE_TABS: Array<{
  id: WorkspaceTab
  number: string
  label: string
  shortLabel: string
}> = [
  {
    id: 'family',
    number: '01',
    label: 'Family Archive',
    shortLabel: 'Family',
  },
  {
    id: 'voicelab',
    number: '02',
    label: 'Gnani Voice Lab',
    shortLabel: 'Voice Lab',
  },
  {
    id: 'biographer',
    number: '03',
    label: 'AI Biographer',
    shortLabel: 'Biographer',
  },
  {
    id: 'capsules',
    number: '04',
    label: 'Capsule Vault',
    shortLabel: 'Capsules',
  },
]

function VaultStudioContent() {
  const searchParams = useSearchParams()
  const {
    members,
    questions,
    capsules,
    addFamilyMember,
    markClipRecorded,
    updateQuestionAnswer,
    createAndSealCapsule,
    toggleCapsuleSealState,
  } = useHeirloomVault()

  const [interviewMode, setInterviewMode] = useState('childhood_roots')
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('family')
  const [focusedMemberId, setFocusedMemberId] = useState<string | undefined>(
    undefined,
  )

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (
      tabParam === 'family' ||
      tabParam === 'voicelab' ||
      tabParam === 'biographer' ||
      tabParam === 'capsules'
    ) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleSwitchTab = (tab: WorkspaceTab) => {
    voicePreviewEngine.stopAll()
    setActiveTab(tab)
  }

  return (
    <div className="hero-bloom-bg min-h-screen w-full pb-24">
      {/* Top Floating Pill Header */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-[1400px] px-4 pt-2 sm:top-6 sm:px-8">
        <nav
          aria-label="Heirloom Vault Workspace Navigation"
          className="pill-nav flex items-center justify-between gap-3 px-4 py-2.5 sm:px-7 sm:py-3.5"
        >
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 whitespace-nowrap focus:outline-none"
            >
              <BrandWaveform />
              <span className="font-louize-card text-[21px] tracking-[-0.045em] text-[var(--ink-black)] sm:text-[25px]">
                Living Heirloom
              </span>
            </Link>
            <span className="hidden rounded-[36px] border border-[#ff5924]/35 bg-[var(--canvas-blush)] px-3 py-0.5 font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--accent-ember)] uppercase md:inline-block">
              Gnani AI Studio Vault
            </span>
          </div>

          {/* Workspace Switcher Pills (Desktop) */}
          <div className="hidden items-center gap-2 xl:flex">
            {WORKSPACE_TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSwitchTab(tab.id)}
                  className={
                    active
                      ? 'btn-ember-pill bg-[var(--card)] px-4 py-2 text-[11px]'
                      : 'btn-slate-pill px-4 py-2 text-[11px]'
                  }
                >
                  <span>
                    {tab.number} · {tab.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Link Back to Editorial Story */}
          <div className="flex shrink-0 items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/"
              className="btn-slate-pill hidden sm:inline-flex px-4 py-2 text-[11px] sm:px-5"
            >
              <span>Editorial Home</span>
            </Link>
          </div>
        </nav>

        {/* Responsive 2x2 / 4-Col Workspace Switcher for Mobile & Tablet */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:hidden">
          {WORKSPACE_TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSwitchTab(tab.id)}
                className={
                  active
                    ? 'btn-ember-pill w-full bg-[var(--card)] px-3 py-2 text-[11px]'
                    : 'btn-slate-pill w-full bg-[var(--card)]/85 px-3 py-2 text-[11px]'
                }
              >
                <span>
                  {tab.number} · {tab.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="mx-auto mt-8 max-w-[1400px] px-4 sm:mt-10 sm:px-8">
        {/* Archive Telemetry Strip */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <button
            type="button"
            onClick={() => handleSwitchTab('family')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Family Profiles
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              {members.length} Members
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--accent-ember)]">
              {members.filter((m) => m.voiceCalibrated).length} Cloned Voices
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('voicelab')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Gnani AI Languages
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              10 Languages
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--ink-slate-navy)]">
              Indic & Global Neural TTS
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('biographer')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Biographer Chapters
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              {questions.filter((q) => q.completed).length} / {questions.length}
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--accent-cobalt)]">
              Prosody Empathy Active
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('capsules')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Time-Locked Vault
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              {capsules.length} Capsules
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--accent-ember)]">
              AES-256-GCM Encrypted
            </p>
          </button>
        </div>

        {/* Active Workspace Surface */}
        {activeTab === 'family' && (
          <FamilyArchiveWorkspace
            members={members}
            capsules={capsules}
            onAddMember={addFamilyMember}
            onOpenVoiceLabForMember={(memberId) => {
              setFocusedMemberId(memberId)
              handleSwitchTab('voicelab')
            }}
            onOpenCapsuleComposerForMember={(memberId) => {
              setFocusedMemberId(memberId)
              handleSwitchTab('capsules')
            }}
          />
        )}

        {activeTab === 'voicelab' && (
          <fieldset disabled>
            <VoiceCloningLabWorkspace
              members={members}
              initialMemberId={focusedMemberId}
              onMarkClipRecorded={markClipRecorded}
              onCreateCapsuleFromLab={async (payload) => {
                const recipient =
                  members.find((m) => m.role === 'recipient') || members[0]
                await createAndSealCapsule({
                  title: `Multilingual Spoken Blessing (${payload.languageName})`,
                  speakerId: payload.speakerId,
                  recipientId: recipient.id,
                  milestoneLabel: 'Future Family Milestone',
                  unlockDate: 'October 14, 2036',
                  languageCode: payload.languageCode,
                  languageName: payload.languageName,
                  tone: payload.tone,
                  toneLabel: payload.toneLabel,
                  message: payload.message,
                })
              }}
            />
          </fieldset>
        )}

        {activeTab === 'biographer' && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <BespokeSelect
                label="Interview theme"
                value={interviewMode}
                options={HeirloomModeSchema.options.map((value) => ({
                  value,
                  label: value.replaceAll('_', ' '),
                }))}
                onChange={setInterviewMode}
              />
              <Link
                className="btn-ember-pill"
                href={`/vault/interview?mode=${interviewMode}&member=${encodeURIComponent(focusedMemberId || members.find((m) => m.role !== 'recipient')?.id || 'my-voice')}`}
              >
                Start Voice Interview →
              </Link>
            </div>
            <BiographerInterviewWorkspace
              questions={questions}
              members={members}
              onSaveAnswer={updateQuestionAnswer}
              onSealDistilledLetter={async (payload) => {
                const recipient =
                  members.find((m) => m.role === 'recipient') || members[0]
                await createAndSealCapsule({
                  title: payload.title,
                  speakerId: payload.speakerId,
                  recipientId: recipient.id,
                  milestoneLabel: 'Biographer Heirloom Chapter',
                  unlockDate: 'June 04, 2032',
                  languageCode: 'en-US',
                  languageName: 'English',
                  tone: 'reflective',
                  toneLabel: 'Warm & Reflective',
                  message: payload.message,
                })
              }}
            />
          </>
        )}

        {activeTab === 'capsules' && (
          <CapsuleVaultWorkspace
            capsules={capsules}
            members={members}
            initialSpeakerId={focusedMemberId}
            onCreateCapsule={createAndSealCapsule}
            onToggleSealState={toggleCapsuleSealState}
          />
        )}
      </main>
    </div>
  )
}

export default function VaultPage() {
  return (
    <Suspense
      fallback={
        <div className="hero-bloom-bg flex min-h-screen items-center justify-center p-8">
          <div className="rounded-[16px] bg-[var(--card)] px-8 py-6 text-center">
            <p className="font-nunito-eyebrow">LIVING HEIRLOOM · GNANI AI</p>
            <p className="font-louize-card mt-2 text-[26px] text-[var(--ink-slate-navy)]">
              Opening your sunlit family archive...
            </p>
          </div>
        </div>
      }
    >
      <VaultStudioContent />
    </Suspense>
  )
}
