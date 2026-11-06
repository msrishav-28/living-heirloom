'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { ProblemNarrativeSection } from '@/components/problem-narrative-section'
import { VoicePreservationSection } from '@/components/voice-preservation-section'
import { AdaptiveInterviewSection } from '@/components/adaptive-interview-section'
import { DarkManifestoSection } from '@/components/dark-manifesto-section'
import { TimelockCapsuleSection } from '@/components/timelock-capsule-section'
import { FooterSection } from '@/components/footer-section'
import { RecordingStudioModal } from '@/components/recording-studio-modal'

export default function Page() {
  const [studioOpen, setStudioOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink-black)]">
      <Navbar onOpenStudio={() => setStudioOpen(true)} />
      <main>
        <p className="mx-auto max-w-[1440px] px-5 pt-6 text-sm text-[var(--muted-foreground)]">
          The previews below illustrate the experience. Your real recordings and
          private archive live in the{' '}
          <a href="/vault" className="underline">
            Heirloom Vault
          </a>
          .
        </p>
        <HeroSection onOpenStudio={() => setStudioOpen(true)} />
        <ProblemNarrativeSection />
        <VoicePreservationSection />
        <AdaptiveInterviewSection />
        <DarkManifestoSection />
        <TimelockCapsuleSection />
      </main>
      <FooterSection onOpenStudio={() => setStudioOpen(true)} />
      <RecordingStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
      />
    </div>
  )
}
