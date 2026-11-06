'use client'

import React, { useState } from 'react'
import { voicePreviewEngine } from '@/lib/voice-synth'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

interface InterviewTurn {
  questionNumber: string
  detectedState: string
  empathySignal: string
  aiPrompt: string
  userResponse: string
  followUpAdaptation: string
  generatedHeirloomExcerpt: string
}

const INTERVIEW_TURNS: InterviewTurn[] = [
  {
    questionNumber: 'Question 3 of 7 · Sensory Childhood Memory',
    detectedState: 'Nostalgic Warmth · Soft Laugh Detected',
    empathySignal:
      'Gnani AI speech emotion engine sensed vocal cadence slowing by 18% on “Sunday mornings.” Deepening into sensory detail rather than changing topic.',
    aiPrompt:
      '“I heard a smile in your voice when you mentioned your father’s Sunday pancakes. What was the one small ritual in that kitchen you hope your grandchildren still do?”',
    userResponse:
      '“He always made the first small, misshapen pancake for the dog, and he’d wink at us and say a house isn’t a home until the smallest creature is fed first.”',
    followUpAdaptation:
      'Captures family philosophy naturally without asking an abstract “what are your values?” question.',
    generatedHeirloomExcerpt:
      'Never forget your grandfather’s rule on Sunday mornings: a house only becomes a home when the smallest creature in the room is cared for first.',
  },
  {
    questionNumber: 'Question 5 of 7 · Navigating Vulnerability',
    detectedState: 'Emotional Tremor · 3.1s Hesitation Recognized',
    empathySignal:
      'Vulnerability recognized by Gnani AI prosody analysis. Removing time pressure, offering gentle reassurance before inviting reflection.',
    aiPrompt:
      '“Take all the time you need—there is no rush at all. When that year felt overwhelming, what quiet truth kept you anchored?”',
    userResponse:
      '“Honestly, I was terrified we wouldn’t make the mortgage that winter. What saved me was walking by the river at dusk with your mother and realizing we still had each other’s hands.”',
    followUpAdaptation:
      'Responds to vulnerability with warmth first, transforming a painful memory into resilient wisdom for a child facing hardship.',
    generatedHeirloomExcerpt:
      'If you ever face a winter where the weight feels too heavy, remember that your mother and I stood there too. Hold the hand beside you; the storm always passes.',
  },
  {
    questionNumber: 'Question 7 of 7 · Future Blessing',
    detectedState: 'Steady Conviction · Full Vocal Resonance',
    empathySignal:
      'Session reaching natural emotional closure (Question 7 of 7). Inviting a final timeless blessing.',
    aiPrompt:
      '“We only have one last question for today’s afternoon session. Imagine your daughter is listening to this twenty years from now in a quiet room. What do you want your voice to leave with her?”',
    userResponse:
      '“That she never has to earn my pride—she already has all of it, on her brightest days and her most ordinary ones.”',
    followUpAdaptation:
      'Distills spoken cadence into a time-locked audio & written heirloom ready for AES-256 sealing.',
    generatedHeirloomExcerpt:
      'You never have to earn my pride, my love. You already have all of it—on your grandest triumphs and on the quietest Tuesday afternoon.',
  },
]

const SESSION_CHECKLIST = [
  {
    id: 1,
    text: 'Question 1: The house where you first felt completely safe',
    completed: true,
  },
  {
    id: 2,
    text: 'Question 2: How you knew you had found the love of your life',
    completed: true,
  },
  {
    id: 3,
    text: 'Question 3: The Sunday morning kitchen ritual worth keeping',
    completed: true,
  },
  {
    id: 4,
    text: 'Question 4: A mistake that taught you gentleness with yourself',
    completed: true,
  },
  {
    id: 5,
    text: 'Question 5: What anchored you during your hardest winter',
    completed: false,
  },
  {
    id: 6,
    text: 'Question 6: The family story nobody else remembers to tell',
    completed: false,
  },
  {
    id: 7,
    text: 'Question 7: A blessing for your children twenty years from today',
    completed: false,
  },
]

export function AdaptiveInterviewSection() {
  const [activeTurnIdx, setActiveTurnIdx] = useState(1)
  const [checklist, setChecklist] = useState(SESSION_CHECKLIST)
  const [isPlayingExcerpt, setIsPlayingExcerpt] = useState(false)

  const currentTurn = INTERVIEW_TURNS[activeTurnIdx]

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const handlePlayHeirloomExcerpt = () => {
    if (isPlayingExcerpt) {
      voicePreviewEngine.stopAll()
      setIsPlayingExcerpt(false)
      return
    }
    setIsPlayingExcerpt(true)
    voicePreviewEngine.playCapsuleAudio(
      currentTurn.generatedHeirloomExcerpt,
      activeTurnIdx === 1 ? 'reflective' : 'wisdom',
      'en-US',
      undefined,
      () => setIsPlayingExcerpt(false)
    )
  }

  return (
    <section
      id="adaptive-interviews"
      className="w-full bg-[var(--background)] py-24 sm:py-[115px]"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        {/* Section Eyebrow + Louize Display Heading */}
        <div className="max-w-[960px]">
          <CalmReveal distance={14}>
            <p className="font-nunito-eyebrow mb-4">
              GNANI AI CONVERSATIONAL BIOGRAPHER
            </p>
          </CalmReveal>

          <h2 className="font-louize-heading-lg text-[clamp(2.55rem,5.8vw,5rem)] text-[var(--ink-black)]">
            <RevealLines
              lines={[
                <React.Fragment key="a1">
                  An interviewer that listens for
                </React.Fragment>,
                <React.Fragment key="a2">
                  <em className="font-normal italic tracking-[-0.036em]">
                    the catch in your throat.
                  </em>
                </React.Fragment>,
              ]}
            />
          </h2>

          <CalmReveal delay={180} distance={18}>
            <p className="font-avenir-body mt-7 max-w-[720px] text-[18px] text-[var(--ink-body-slate)] sm:text-[20px]">
              Rigid questionnaires feel like tax forms. Powered by Gnani AI’s
              conversational speech intelligence, our biographer conducts
              unhurried 5-to-10 question sessions—sensing hesitation, laughter,
              or tenderness in real time, responding with genuine empathy, and
              weaving your spoken answers into timeless heirloom messages.
            </p>
          </CalmReveal>
        </div>

        {/* 2-Column Feature Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Adaptive Empathy Session Demo on Slate Blue (#e5eaf2) */}
          <CalmReveal
            delay={120}
            distance={24}
            className="pastel-card-blue flex flex-col justify-between p-8 sm:p-[50px] lg:col-span-7"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-nunito-eyebrow">
                  GNANI AI EMPATHY ADAPTATION ENGINE
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TURNS.map((turn, idx) => (
                    <button
                      key={turn.questionNumber}
                      type="button"
                      onClick={() => {
                        voicePreviewEngine.stopAll()
                        setIsPlayingExcerpt(false)
                        setActiveTurnIdx(idx)
                      }}
                      className={
                        idx === activeTurnIdx
                          ? 'btn-ember-pill bg-[var(--card)] px-3.5 py-1.5 text-[12px]'
                          : 'btn-slate-pill px-3.5 py-1.5 text-[12px]'
                      }
                    >
                      {idx === 0
                        ? 'Nostalgia'
                        : idx === 1
                          ? 'Vulnerability'
                          : 'Blessing'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotional State Pill */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <span className="rounded-[36px] border border-[#ff5924] bg-[var(--card)] px-3.5 py-1 font-nunito text-[12px] font-semibold tracking-[0.07em] text-[var(--accent-ember)] uppercase">
                  {currentTurn.detectedState}
                </span>
                <span className="rounded-[36px] border border-[#1573dd] bg-[var(--card)] px-3.5 py-1 font-inter-ui text-[13px] text-[var(--accent-cobalt)]">
                  {currentTurn.questionNumber}
                </span>
              </div>

              {/* AI Empathetic Question */}
              <div className="mt-6 rounded-[12px] bg-[var(--card)] p-6">
                <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
                  Gnani AI Biographer · Adaptive Follow-Up
                </p>
                <h3 className="font-louize-card mt-2 text-[28px] text-[var(--ink-black)] sm:text-[32px]">
                  {currentTurn.aiPrompt}
                </h3>
                <p className="font-inter-ui mt-3 text-[14px] text-[var(--accent-cobalt)]">
                  Why it adapted: {currentTurn.empathySignal}
                </p>
              </div>

              {/* Spoken Response -> Heirloom Transformation */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[12px] bg-[var(--card)]/75 p-5">
                  <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
                    Raw Spoken Answer
                  </p>
                  <p className="font-avenir-body mt-2 text-[16px] text-[var(--ink-body-slate)]">
                    {currentTurn.userResponse}
                  </p>
                </div>

                <div className="rounded-[12px] bg-[var(--card)] p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-nunito text-[12px] font-semibold tracking-[0.09em] text-[var(--accent-ember)] uppercase">
                      Distilled Heirloom Capsule
                    </p>
                  </div>
                  <p className="font-louize-card mt-2 text-[21px] text-[var(--ink-slate-navy)]">
                    “{currentTurn.generatedHeirloomExcerpt}”
                  </p>
                  <button
                    type="button"
                    onClick={handlePlayHeirloomExcerpt}
                    className="btn-ember-pill mt-4 px-4 py-1.5 text-[12px]"
                  >
                    <span>
                      {isPlayingExcerpt
                        ? 'Stop Audio'
                        : 'Hear Cloned Voice Read This'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </CalmReveal>

          {/* Right 5 Cols: Inline Checklist Card */}
          <CalmReveal
            delay={220}
            distance={24}
            className="pastel-card-parchment flex flex-col justify-between p-8 sm:p-[50px] lg:col-span-5"
          >
            <div>
              <span className="font-nunito-eyebrow">
                5–10 QUESTIONS PER SESSION
              </span>
              <h3 className="font-louize-card mt-3 text-[32px] text-[var(--ink-slate-navy)]">
                Afternoon Session #4 — Life Stories Curated Without Folders
              </h3>
              <p className="font-avenir-body mt-3 text-[17px] text-[var(--ink-body-slate)]">
                Each conversation lasts just 12 minutes over a cup of tea. Click
                any question below to mark or revisit a memory chapter:
              </p>

              <ul className="mt-7 space-y-3.5">
                {checklist.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      className="font-inter-ui flex w-full items-start gap-3.5 text-left text-[16px] leading-[1.45] transition-colors sm:text-[17px]"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          item.completed
                            ? 'border-[#a6a8aa] bg-[#a6a8aa]/25'
                            : 'border-[#3a475a] bg-transparent'
                        }`}
                      >
                        {item.completed && (
                          <span className="h-2 w-2 rounded-full bg-[#a6a8aa]" />
                        )}
                      </span>
                      <span
                        className={
                          item.completed
                            ? 'text-[#a6a8aa] line-through'
                            : 'text-[var(--ink-slate-navy)]'
                        }
                      >
                        {item.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-[12px] bg-[var(--card)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-inter-ui text-[14px] text-[var(--ink-slate-navy)]">
                  Session Pace: Unhurried (7 Questions)
                </span>
                <span className="font-nunito text-[12px] font-semibold tracking-[0.08em] text-[var(--accent-ember)] uppercase">
                  {checklist.filter((c) => c.completed).length} of{' '}
                  {checklist.length} Captured
                </span>
              </div>
            </div>
          </CalmReveal>
        </div>
      </div>
    </section>
  )
}
