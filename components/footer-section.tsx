'use client'
import { BrandWaveform } from '@/components/brand-waveform'

import React from 'react'
import Link from 'next/link'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

interface FooterSectionProps {
  onOpenStudio: () => void
}

export function FooterSection({ onOpenStudio }: FooterSectionProps) {
  return (
    <footer className="w-full bg-[var(--background)] pt-24 pb-20 sm:pt-[120px] sm:pb-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        {/* Centered Editorial Invitation */}
        <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
          <CalmReveal distance={14}>
            <p className="font-nunito-eyebrow mb-5">
              WHILE THE AFTERNOON IS STILL WARM
            </p>
          </CalmReveal>

          <h2 className="font-louize-display text-[clamp(2.9rem,7vw,6.5rem)] text-[var(--ink-black)]">
            <RevealLines
              lines={[
                <React.Fragment key="f1">
                  Do not wait until a voice
                </React.Fragment>,
                <React.Fragment key="f2">
                  <em className="font-normal italic tracking-[-0.036em]">
                    is only a memory.
                  </em>
                </React.Fragment>,
              ]}
            />
          </h2>

          <CalmReveal delay={180} distance={18}>
            <p className="font-avenir-body mt-8 max-w-[650px] text-[18px] text-[var(--ink-body-slate)] sm:text-[20px]">
              Three short recordings and seven gentle questions over tea are all
              it takes to leave your children and grandchildren the sound of
              your love—powered by Gnani AI and sealed with your family’s
              private key.
            </p>
          </CalmReveal>

          <CalmReveal delay={280} distance={16}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/vault" className="btn-ember-pill">
                <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                <span>Open Full Heirloom Vault</span>
              </Link>
              <button
                type="button"
                onClick={onOpenStudio}
                className="btn-slate-pill"
              >
                <span>Quick 3-Clip Voice Session</span>
              </button>
              <a href="#voice-preservation" className="btn-slate-pill">
                <span>Explore 10 Languages</span>
              </a>
            </div>
          </CalmReveal>
        </div>

        {/* Bottom Minimal Footer Bar */}
        <div className="mt-24 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <BrandWaveform/>
            <span className="font-louize-card text-[24px] tracking-[-0.05em] text-[var(--ink-black)]">
              Living Heirloom
            </span>
            <span className="font-inter-ui ml-2 text-[14px] text-[var(--muted-foreground)]">
              Sunlit Private Voice & Heirloom Archive · Powered by Gnani AI
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span className="font-inter-ui flex items-center gap-2 text-[14px] text-[var(--muted-foreground)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5924]" />
              Gnani AI Voice & Empathy Engine
            </span>
            <span className="font-inter-ui flex items-center gap-2 text-[14px] text-[var(--muted-foreground)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5924]" />
              AES-256 Zero-Knowledge Vault
            </span>
            <span className="font-inter-ui flex items-center gap-2 text-[14px] text-[var(--muted-foreground)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff5924]" />
              Nine Indian Languages and English
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
