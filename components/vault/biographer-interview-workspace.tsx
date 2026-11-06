'use client'

import React, { useState, useEffect } from 'react'
import { voicePreviewEngine } from '@/lib/voice-synth'
import type {
  BiographerQuestion,
  FamilyMember,
} from '@/lib/heirloom-vault-store'
import { BespokeSelect } from '@/components/ui/bespoke-controls'

interface BiographerInterviewWorkspaceProps {
  questions: BiographerQuestion[]
  members: FamilyMember[]
  onSaveAnswer: (
    questionId: string,
    spokenAnswer: string,
    distilledLetter: string
  ) => void
  onSealDistilledLetter: (payload: {
    title: string
    speakerId: string
    message: string
  }) => void
}

export function BiographerInterviewWorkspace({
  questions,
  members,
  onSaveAnswer,
  onSealDistilledLetter,
}: BiographerInterviewWorkspaceProps) {
  const speakers = members.filter((m) => m.role !== 'recipient')
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(
    speakers[0]?.id || members[0]?.id
  )
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    questions[3]?.id || questions[0]?.id
  )
  const [draftAnswer, setDraftAnswer] = useState<string>('')
  const [draftDistilled, setDraftDistilled] = useState<string>('')
  const [isListeningMic, setIsListeningMic] = useState(false)
  const [isPlayingPrompt, setIsPlayingPrompt] = useState(false)
  const [isPlayingDistilled, setIsPlayingDistilled] = useState(false)
  const [savedBanner, setSavedBanner] = useState<string | null>(null)

  const currentQuestion =
    questions.find((q) => q.id === activeQuestionId) || questions[0]
  const activeSpeaker =
    members.find((m) => m.id === selectedSpeakerId) || members[0]

  useEffect(() => {
    setDraftAnswer(currentQuestion.spokenAnswer)
    setDraftDistilled(currentQuestion.distilledLetter)
    voicePreviewEngine.stopAll()
    setIsPlayingPrompt(false)
    setIsPlayingDistilled(false)
  }, [currentQuestion])

  const handleToggleMicSimulation = () => {
    if (isListeningMic) {
      setIsListeningMic(false)
      return
    }
    setIsListeningMic(true)
    window.setTimeout(() => {
      setIsListeningMic(false)
      setSavedBanner('Sample recording animation complete — use Start Voice Interview for real speech processing')
      window.setTimeout(() => setSavedBanner(null), 3000)
    }, 2600)
  }

  const handleDistillFromAnswer = () => {
    const cleaned = draftAnswer.trim()
    if (!cleaned) return
    const sentences = cleaned.split(/(?<=[.!?])\s+/)
    const core = sentences[sentences.length - 1] || cleaned
    const crafted = `Remember this from our family table: ${core.replace(/^["“]|["”]$/g, '')}`
    setDraftDistilled(crafted)
    onSaveAnswer(currentQuestion.id, draftAnswer, crafted)
    setSavedBanner('Chapter Distilled & Saved to Archive')
    window.setTimeout(() => setSavedBanner(null), 3000)
  }

  const handlePlayDistilled = () => {
    if (isPlayingDistilled) {
      voicePreviewEngine.stopAll()
      setIsPlayingDistilled(false)
      return
    }
    setIsPlayingDistilled(true)
    voicePreviewEngine.playCapsuleAudio(
      draftDistilled,
      'reflective',
      'en-US',
      undefined,
      () => setIsPlayingDistilled(false)
    )
  }

  const handlePlayBiographerPrompt = () => {
    if (isPlayingPrompt) {
      voicePreviewEngine.stopAll()
      setIsPlayingPrompt(false)
      return
    }
    setIsPlayingPrompt(true)
    voicePreviewEngine.playCapsuleAudio(
      currentQuestion.prompt,
      'wisdom',
      'en-US',
      undefined,
      () => setIsPlayingPrompt(false)
    )
  }

  return (
    <div className="space-y-8"><p>Sample interview preview. Use “Start Voice Interview” above to record and transcribe real answers.</p>
      {/* Top Studio Header */}
      <div className="flex flex-col justify-between gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--card)] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="font-nunito-eyebrow">
            WORKSPACE 03 · GNANI AI EMPATHETIC BIOGRAPHER ROOM
          </span>
          <h2 className="font-louize-card mt-1.5 text-[28px] text-[var(--ink-black)] sm:text-[34px]">
            Unhurried kitchen-table conversations that write your heirloom
            letters.
          </h2>
          <p className="font-avenir-body mt-1.5 max-w-[700px] text-[16px] text-[var(--ink-body-slate)]">
            Gnani AI listens for hesitation, laughter, and tenderness—adapting
            each follow-up question in real time and distilling spoken answers
            into timeless blessings.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <BespokeSelect
            id="biographer-speaker-select"
            label="Storyteller in Session"
            value={activeSpeaker.id}
            options={speakers.map((s) => ({
              value: s.id,
              label: s.name,
              sublabel: s.relation,
              badge: `${questions.filter((q) => q.completed).length}/7 Chapters`,
            }))}
            onChange={setSelectedSpeakerId}
          />
        </div>
      </div>

      {/* 12-Column Split: Left 4 Cols 7-Question Chapter List, Right 8 Cols Active Conversation Studio */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 4 Cols: 7-Question Curriculum */}
        <div className="pastel-card-parchment flex flex-col justify-between p-6 sm:p-8 lg:col-span-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-nunito-eyebrow">
                7-CHAPTER TEA SESSION
              </span>
              <span className="font-inter-ui text-[13px] text-[var(--muted-foreground)]">
                {questions.filter((q) => q.completed).length} of{' '}
                {questions.length} Captured
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              {questions.map((q) => {
                const isCurrent = q.id === currentQuestion.id
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`flex w-full items-start gap-3 rounded-[12px] p-3.5 text-left transition-all ${
                      isCurrent
                        ? 'bg-[var(--card)] ring-2 ring-[#ff5924]'
                        : 'bg-[var(--card)]/60 hover:bg-[var(--card)]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-nunito text-[11px] font-bold ${
                        q.completed
                          ? 'bg-[#ff5924] text-[#ffffff]'
                          : 'border border-[#748297] text-[var(--ink-slate-navy)]'
                      }`}
                    >
                      0{q.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-inter-ui truncate text-[14px] font-medium text-[var(--ink-black)]">
                        {q.chapter}
                      </p>
                      <p className="font-inter-ui mt-0.5 text-[12px] text-[var(--muted-foreground)]">
                        {q.completed ? `Captured (${q.durationLabel})` : 'Ready to record'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 rounded-[12px] bg-[var(--card)] p-4">
            <p className="font-nunito text-[11px] font-semibold tracking-[0.08em] text-[var(--accent-ember)] uppercase">
              Gnani AI Prosody Telemetry
            </p>
            <p className="font-inter-ui mt-1 text-[13px] text-[var(--ink-slate-navy)]">
              Real-time pause detection and emotional cadence softening active.
            </p>
          </div>
        </div>

        {/* Right 8 Cols: Active Empathetic Interview Room */}
        <div className="pastel-card-blue flex flex-col justify-between p-7 sm:p-10 lg:col-span-8">
          <div>
            {/* Status Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-[36px] border border-[#ff5924] bg-[var(--card)] px-3.5 py-1 font-nunito text-[12px] font-semibold tracking-[0.07em] text-[var(--accent-ember)] uppercase">
                {currentQuestion.detectedProsody}
              </span>
              <span className="rounded-[36px] border border-[#1573dd] bg-[var(--card)] px-3.5 py-1 font-inter-ui text-[13px] text-[var(--accent-cobalt)]">
                Chapter 0{currentQuestion.number} · {currentQuestion.chapter}
              </span>
            </div>

            {/* Biographer Prompt Card */}
            <div className="mt-5 rounded-[14px] bg-[var(--card)] p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
                  Gnani AI Biographer Prompt
                </span>
                <button
                  type="button"
                  onClick={handlePlayBiographerPrompt}
                  className="font-inter-ui text-[13px] text-[var(--accent-cobalt)] underline underline-offset-4"
                >
                  {isPlayingPrompt
                    ? 'Stop Biographer Voice'
                    : 'Hear Question Aloud'}
                </button>
              </div>

              <h3 className="font-louize-card mt-2 text-[26px] text-[var(--ink-black)] sm:text-[32px]">
                {currentQuestion.prompt}
              </h3>

              <p className="font-inter-ui mt-3 text-[13px] text-[var(--accent-cobalt)]">
                Empathy Adaptation: {currentQuestion.gnaniAdaptationNote}
              </p>
            </div>

            {/* Spoken Response Input + Live Mic Bar */}
            <div className="mt-5 rounded-[14px] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="biographer-spoken-answer"
                  className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase"
                >
                  {activeSpeaker.name}’s Spoken Transcript
                </label>

                <button
                  type="button"
                  onClick={handleToggleMicSimulation}
                  className={
                    isListeningMic
                      ? 'btn-ember-pill px-3.5 py-1 text-[11px]'
                      : 'btn-slate-pill px-3.5 py-1 text-[11px]'
                  }
                >
                  <span
                    className={`h-2 w-2 rounded-full bg-[#ff5924] ${
                      isListeningMic ? 'animate-ping' : ''
                    }`}
                  />
                  <span>
                    {isListeningMic
                      ? 'Listening via Gnani ASR...'
                      : 'Speak Answer with Mic'}
                  </span>
                </button>
              </div>

              <textarea
                id="biographer-spoken-answer"
                rows={3}
                value={draftAnswer}
                onChange={(e) => setDraftAnswer(e.target.value)}
                className="font-avenir-body mt-2.5 w-full rounded-[10px] bg-[var(--background)] p-4 text-[17px] text-[var(--foreground)] focus:outline-1 focus:outline-[#ff5924]"
              />
            </div>

            {/* Distilled Heirloom Letter Output */}
            <div className="mt-5 rounded-[14px] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--accent-ember)] uppercase">
                  Distilled Spoken Heirloom Letter
                </span>
                <button
                  type="button"
                  onClick={handleDistillFromAnswer}
                  className="font-inter-ui text-[13px] text-[var(--accent-cobalt)] underline underline-offset-4"
                >
                  Re-distill from transcript
                </button>
              </div>

              <textarea
                aria-label="Distilled heirloom blessing"
                rows={2}
                value={draftDistilled}
                onChange={(e) => setDraftDistilled(e.target.value)}
                className="font-louize-card mt-2 w-full rounded-[10px] bg-[var(--card-parchment)]/65 p-4 text-[22px] text-[var(--ink-black)] focus:outline-1 focus:outline-[#ff5924]"
              />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePlayDistilled}
                className="btn-ember-pill bg-[var(--card)]"
              >
                <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                <span>
                  {isPlayingDistilled
                    ? 'Stop Cloned Voice'
                    : `Hear in ${activeSpeaker.name.split(' ')[0]}’s Voice`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSaveAnswer(currentQuestion.id, draftAnswer, draftDistilled)
                  onSealDistilledLetter({
                    title: `${currentQuestion.chapter} — Spoken Blessing`,
                    speakerId: activeSpeaker.id,
                    message: draftDistilled,
                  })
                  setSavedBanner('Sealed as AES-256 Time-Lock Capsule')
                  window.setTimeout(() => setSavedBanner(null), 3500)
                }}
                className="btn-slate-pill bg-[var(--card)]"
              >
                <span>Seal Chapter as Time-Lock Capsule</span>
              </button>
            </div>

            {savedBanner && (
              <span className="rounded-[36px] border border-[#ff5924] bg-[var(--card)] px-3.5 py-1 font-nunito text-[12px] font-semibold tracking-[0.07em] text-[var(--accent-ember)] uppercase">
                {savedBanner}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
