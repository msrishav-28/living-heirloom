'use client'

import React, { useState } from 'react'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

const MEMORY_YEARS = [
  {
    year: 'Year 1',
    yearsPassed: 1,
    unrecordedClarity: 78,
    preservedClarity: 100,
    unrecordedNote:
      'You still remember the warmth of their laugh, though the exact rhythm of how they said your name at the doorway is beginning to blur.',
    preservedNote:
      'Every intake of breath, gentle chuckle, and cadence from 3 short recordings remains crystal-clear and playable in nine Indian languages and English.',
  },
  {
    year: 'Year 5',
    yearsPassed: 5,
    unrecordedClarity: 42,
    preservedClarity: 100,
    unrecordedNote:
      '75% of people say that by year five, they can picture a loved one’s face clearly in photographs, but struggle to summon the sound of their voice in a quiet room.',
    preservedNote:
      'Your child opens their 18th-birthday time-locked capsule and hears their grandparent’s unmistakable voice speaking directly to them.',
  },
  {
    year: 'Year 25',
    yearsPassed: 25,
    unrecordedClarity: 14,
    preservedClarity: 100,
    unrecordedNote:
      'Without recordings, stories become second-hand summaries. Future grandchildren know their ancestor’s name, but never hear their counsel or humor.',
    preservedNote:
      'Decades later, your Living Heirloom vault unlocks a spoken letter in your grandchild’s native language—with your exact vocal timbre intact.',
  },
]

export function ProblemNarrativeSection() {
  const [selectedYearIdx, setSelectedYearIdx] = useState(1)
  const activeStage = MEMORY_YEARS[selectedYearIdx]

  return (
    <section id="why" className="w-full bg-[var(--background)] py-24 sm:py-[110px]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        {/* Section Eyebrow + Headline */}
        <div className="max-w-[920px]">
          <CalmReveal distance={14}>
            <p className="font-nunito-eyebrow mb-4">
              THE SILENT LOSS WE RARELY NAME
            </p>
          </CalmReveal>

          <h2 className="font-louize-heading-lg text-[clamp(2.55rem,5.8vw,5rem)] text-[var(--ink-black)]">
            <RevealLines
              lines={[
                <React.Fragment key="l1">
                  75% of us wish we had{' '}
                  <em className="font-normal italic tracking-[-0.036em]">
                    just one more recording
                  </em>
                </React.Fragment>,
                <React.Fragment key="l2">
                  of someone who passed.
                </React.Fragment>,
              ]}
            />
          </h2>

          <CalmReveal delay={180} distance={18}>
            <p className="font-avenir-body mt-7 max-w-[680px] text-[18px] text-[var(--ink-body-slate)] sm:text-[20px]">
              When someone we love dies, we keep their coat, their wristwatch,
              and thousands of silent photographs. Yet the very first thing that
              fades from human memory is the acoustic grain of their voice—and
              with it, the stories they never wrote down.
            </p>
          </CalmReveal>
        </div>

        {/* Interactive Acoustic Memory Timeline inside a 2-Column Editorial Layout */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Parchment Card (#f3f0e7) with Interactive Memory Fade Comparison */}
          <CalmReveal
            delay={120}
            distance={24}
            className="pastel-card-parchment flex flex-col justify-between p-8 sm:p-[50px] lg:col-span-7"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-nunito-eyebrow">
                  INTERACTIVE TIMBRE HORIZON
                </span>
                <div className="flex items-center gap-2">
                  {MEMORY_YEARS.map((item, idx) => (
                    <button
                      key={item.year}
                      type="button"
                      onClick={() => setSelectedYearIdx(idx)}
                      className={
                        idx === selectedYearIdx
                          ? 'btn-ember-pill px-4 py-1.5 text-[13px]'
                          : 'btn-slate-pill px-4 py-1.5 text-[13px]'
                      }
                    >
                      {item.year}
                    </button>
                  ))}
                </div>
              </div>

              <h3 className="font-louize-card mt-6 text-[32px] text-[var(--ink-slate-navy)]">
                What happens to a voice after {activeStage.yearsPassed}{' '}
                {activeStage.yearsPassed === 1 ? 'year' : 'years'}?
              </h3>

              {/* Visual Comparison Bars */}
              <div className="mt-8 space-y-6">
                {/* Unrecorded Memory */}
                <div className="rounded-[12px] bg-[var(--card)] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-inter-ui text-[15px] font-medium text-[var(--muted-foreground)]">
                      Unrecorded Vocal Memory ({activeStage.year})
                    </span>
                    <span className="font-nunito text-[14px] font-semibold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
                      {activeStage.unrecordedClarity}% Recall
                    </span>
                  </div>
                  <div className="mt-3 flex h-8 items-center gap-1">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const active =
                        (i / 28) * 100 < activeStage.unrecordedClarity
                      return (
                        <span
                          key={i}
                          className="flex-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                          style={{
                            height: active
                              ? `${28 + ((i * 17) % 55)}%`
                              : '18%',
                            backgroundColor: active ? '#748297' : '#e2e2e2',
                            opacity: active ? 0.65 : 0.35,
                          }}
                        />
                      )
                    })}
                  </div>
                  <p className="font-avenir-body mt-3 text-[16px] text-[var(--ink-body-slate)]">
                    {activeStage.unrecordedNote}
                  </p>
                </div>

                {/* Preserved Living Heirloom */}
                <div className="rounded-[12px] bg-[var(--card)] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-inter-ui text-[15px] font-medium text-[var(--ink-black)]">
                      Living Heirloom · Gnani AI Voice Clone ({activeStage.year})
                    </span>
                    <span className="font-nunito text-[14px] font-semibold tracking-[0.06em] text-[var(--accent-ember)] uppercase">
                      {activeStage.preservedClarity}% Timbre Intact
                    </span>
                  </div>
                  <div className="mt-3 flex h-8 items-center gap-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
                        style={{
                          height: `${35 + ((i * 23) % 65)}%`,
                          backgroundColor: '#ff5924',
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-avenir-body mt-3 text-[16px] text-[var(--ink-slate-navy)]">
                    {activeStage.preservedNote}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <span className="font-inter-ui text-[14px] text-[var(--muted-foreground)]">
                Select a decade horizon to compare acoustic retention
              </span>
              <a
                href="#voice-preservation"
                className="font-inter-ui text-[15px] text-[var(--accent-cobalt)] underline underline-offset-4"
              >
                See how 3 recordings preserve a voice
              </a>
            </div>
          </CalmReveal>

          {/* Right 5 Cols: Two Pastel Feature Cards (Slate Blue #e5eaf2 & Sage #dde9d3) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <CalmReveal
              delay={220}
              distance={24}
              className="pastel-card-blue flex-1 p-8 sm:p-[50px]"
            >
              <p className="font-nunito-eyebrow mb-3">
                THE BLANK PAGE PARALYSIS
              </p>
              <h3 className="font-louize-card text-[32px] text-[var(--ink-slate-navy)]">
                Writing heartfelt farewell or milestone letters is emotionally
                overwhelming.
              </h3>
              <p className="font-avenir-body mt-4 text-[18px] text-[var(--ink-body-slate)]">
                Sitting down with a blank sheet of paper to write for your
                child’s future wedding or a loved one’s hard day feels heavy and
                unnatural. Most people close the notebook after a single line.
              </p>
              <p className="font-avenir-body mt-3 text-[18px] text-[var(--ink-slate-navy)]">
                Our Gnani AI empathetic biographer replaces the blank page with
                a warm, 5-to-10 question conversation—listening to your natural
                stories and turning them into heirloom letters automatically.
              </p>
            </CalmReveal>

            <CalmReveal
              delay={320}
              distance={24}
              className="pastel-card-sage flex-1 p-8 sm:p-[50px]"
            >
              <p className="font-nunito-eyebrow mb-3">
                WISDOM LOST BETWEEN GENERATIONS
              </p>
              <h3 className="font-louize-card text-[32px] text-[var(--ink-slate-navy)]">
                When a person passes, an entire library of lived experience
                vanishes.
              </h3>
              <p className="font-avenir-body mt-4 text-[18px] text-[var(--ink-body-slate)]">
                How your grandmother survived her hardest winter, how your
                father knew he was in love, the recipes and quiet philosophies
                that shaped your family—all preserved in their own living voice,
                ready to speak in nine Indian languages and English.
              </p>
            </CalmReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
