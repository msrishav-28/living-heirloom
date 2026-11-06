'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { RealVoiceLab } from '@/components/vault/real-voice-lab'
import { BrandWaveform } from './brand-waveform'
export function RecordingStudioModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement
    panel.current?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const controls = panel.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), textarea, [tabindex="0"]',
        )
        if (!controls?.length) return
        const first = controls[0],
          last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('keydown', key)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [isOpen, onClose])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/55 p-4 backdrop-blur-xs">
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-studio-title"
        className="relative max-h-[90dvh] w-full max-w-[780px] overflow-y-auto rounded-[16px] bg-[var(--card)] p-6 sm:p-10"
      >
        <header className="flex items-center justify-between gap-4">
          <h2
            id="quick-studio-title"
            className="flex items-center gap-3 font-louize-card text-2xl"
          >
            <BrandWaveform />
            Your voice studio
          </h2>
          <button className="btn-slate-pill" onClick={onClose}>
            Close
          </button>
        </header>
        <RealVoiceLab memberId="my-voice" />
        <Link
          className="btn-ember-pill mt-6"
          href="/vault/interview?mode=childhood_roots&member=my-voice"
          onClick={onClose}
        >
          Continue to voice interview →
        </Link>
      </div>
    </div>
  )
}
