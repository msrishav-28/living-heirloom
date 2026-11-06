'use client'
import { BrandWaveform } from '@/components/brand-waveform'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavbarProps {
  onOpenStudio: () => void
}

export function Navbar({ onOpenStudio }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-4 z-40 mx-auto w-full max-w-[1360px] px-4 sm:top-6 sm:px-8">
      <nav
        aria-label="Primary navigation"
        className={`pill-nav flex items-center justify-between gap-4 px-4 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] sm:px-7 sm:py-3.5 ${
          scrolled ? 'bg-[var(--card)]/94' : 'bg-[var(--card)]/86'
        }`}
      >
        {/* Brand Identity — single line, no "local pwa" badge */}
        <a
          href="#"
          className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap focus:outline-none"
        >
          <BrandWaveform/>
          <span className="font-louize-card text-[21px] tracking-[-0.045em] text-[var(--ink-black)] sm:text-[25px]">
            Living Heirloom
          </span>
        </a>

        {/* Navigation Links (Desktop) */}
        <div className="hidden items-center gap-6 xl:flex">
          <a
            href="#why"
            className="font-inter-ui whitespace-nowrap text-[14px] text-[var(--ink-slate-navy)] transition-colors hover:text-[var(--accent-ember)]"
          >
            Why Voices Fade
          </a>
          <a
            href="#voice-preservation"
            className="font-inter-ui whitespace-nowrap text-[14px] text-[var(--ink-slate-navy)] transition-colors hover:text-[var(--accent-ember)]"
          >
            3-Clip Voice Clone
          </a>
          <a
            href="#adaptive-interviews"
            className="font-inter-ui whitespace-nowrap text-[14px] text-[var(--ink-slate-navy)] transition-colors hover:text-[var(--accent-ember)]"
          >
            AI Biographer
          </a>
          <a
            href="#privacy-manifesto"
            className="font-inter-ui whitespace-nowrap text-[14px] text-[var(--ink-slate-navy)] transition-colors hover:text-[var(--accent-ember)]"
          >
            Privacy Vow
          </a>
          <a
            href="#time-lock-studio"
            className="font-inter-ui whitespace-nowrap text-[14px] text-[var(--ink-slate-navy)] transition-colors hover:text-[var(--accent-ember)]"
          >
            Time-Lock Capsules
          </a>
        </div>

        {/* Right Actions: Theme Toggle + Product UI Route (/vault) + Quick Studio */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <Link
            href="/vault"
            className="btn-slate-pill hidden px-5 py-2 text-[11px] md:inline-flex"
          >
            <span>Open Vault</span>
          </Link>

          <button
            type="button"
            onClick={onOpenStudio}
            className="btn-ember-pill px-4 py-2 text-[11px] sm:px-5 sm:py-2.5 sm:text-[12px]"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff5924]" />
            <span>Preserve a Voice</span>
          </button>

          {/* Custom Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--ink-slate-navy)] transition-colors hover:border-[#ff5924] hover:text-[var(--accent-ember)] xl:hidden"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 5.25H13.5M2.5 10.75H13.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Bespoke Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="mt-2 rounded-[20px] border border-[var(--border)] bg-[var(--card)]/96 p-5 shadow-[0_20px_40px_rgba(0,0,0,0.06)] backdrop-blur-md xl:hidden">
          <div className="flex flex-col gap-2">
            <a
              href="#why"
              onClick={() => setMobileMenuOpen(false)}
              className="font-inter-ui rounded-[12px] px-3.5 py-2.5 text-[15px] text-[var(--ink-slate-navy)] hover:bg-[var(--card-parchment)]"
            >
              Why Voices Fade
            </a>
            <a
              href="#voice-preservation"
              onClick={() => setMobileMenuOpen(false)}
              className="font-inter-ui rounded-[12px] px-3.5 py-2.5 text-[15px] text-[var(--ink-slate-navy)] hover:bg-[var(--card-parchment)]"
            >
              3-Clip Voice Clone · Gnani AI
            </a>
            <a
              href="#adaptive-interviews"
              onClick={() => setMobileMenuOpen(false)}
              className="font-inter-ui rounded-[12px] px-3.5 py-2.5 text-[15px] text-[var(--ink-slate-navy)] hover:bg-[var(--card-parchment)]"
            >
              AI Biographer
            </a>
            <a
              href="#privacy-manifesto"
              onClick={() => setMobileMenuOpen(false)}
              className="font-inter-ui rounded-[12px] px-3.5 py-2.5 text-[15px] text-[var(--ink-slate-navy)] hover:bg-[var(--card-parchment)]"
            >
              Zero-Knowledge Privacy Vow
            </a>
            <a
              href="#time-lock-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="font-inter-ui rounded-[12px] px-3.5 py-2.5 text-[15px] text-[var(--ink-slate-navy)] hover:bg-[var(--card-parchment)]"
            >
              Time-Lock Capsules
            </a>
            <div className="mt-2 flex flex-col gap-2.5 pt-2">
              <div className="flex items-center justify-between rounded-[12px] bg-[var(--card-parchment)] px-3.5 py-2">
                <span className="font-inter-ui text-[14px] text-[var(--ink-slate-navy)]">
                  Archive Atmosphere
                </span>
                <ThemeToggle />
              </div>
              <Link
                href="/vault"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-ember-pill w-full text-center"
              >
                <span className="h-2 w-2 rounded-full bg-[#ff5924]" />
                <span>Enter Full Heirloom Vault UI</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
