'use client'

export type EmotionalTone = 'reflective' | 'lullaby' | 'joyful' | 'wisdom'

interface SynthConfig {
  baseFreq: number
  tempoMs: number
  warmthFilterHz: number
  vibratoHz: number
  vibratoDepth: number
  syllablePattern: number[]
}

const TONE_CONFIGS: Record<EmotionalTone, SynthConfig> = {
  reflective: {
    baseFreq: 196, // G3 warm baritone/alto resonance
    tempoMs: 240,
    warmthFilterHz: 680,
    vibratoHz: 4.8,
    vibratoDepth: 3.2,
    syllablePattern: [1, 1.12, 1.06, 0.94, 1.18, 1.0, 0.89, 1.05, 0.98],
  },
  lullaby: {
    baseFreq: 220, // A3 gentle intimate cadence
    tempoMs: 310,
    warmthFilterHz: 520,
    vibratoHz: 4.2,
    vibratoDepth: 4.0,
    syllablePattern: [1, 1.25, 1.12, 1.0, 0.88, 0.94, 0.84, 1.0],
  },
  joyful: {
    baseFreq: 246.94, // B3 lifted bright warmth
    tempoMs: 185,
    warmthFilterHz: 940,
    vibratoHz: 5.6,
    vibratoDepth: 2.8,
    syllablePattern: [1, 1.18, 1.25, 1.12, 1.33, 1.18, 1.06, 1.25, 1.12],
  },
  wisdom: {
    baseFreq: 164.81, // E3 grounded steady cadence
    tempoMs: 265,
    warmthFilterHz: 610,
    vibratoHz: 4.4,
    vibratoDepth: 2.2,
    syllablePattern: [1, 1.05, 1.0, 0.94, 1.12, 1.05, 0.94, 0.89, 1.0],
  },
}

class BrowserVoicePreviewEngine {
  private ctx: AudioContext | null = null
  private stopFns: Array<() => void> = []

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public stopAll() {
    this.stopFns.forEach((fn) => {
      try {
        fn()
      } catch {
        // ignore already stopped nodes
      }
    })
    this.stopFns = []
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      window.dispatchEvent(
        new CustomEvent('living-heirloom:voice-energy', {
          detail: { active: false, energy: 0, tone: 'reflective' },
        })
      )
    }
  }

  /**
   * Plays an intimate, sunlit acoustic voice-form resonance combined with optional browser speech synthesis
   * so the visitor hears an immediate, tactile audio artifact without any external server call.
   */
  public playCapsuleAudio(
    text: string,
    tone: EmotionalTone = 'reflective',
    langCode: string = 'en-US',
    onProgress?: (progress: number) => void,
    onEnd?: () => void
  ): () => void {
    this.stopAll()
    const ctx = this.ensureContext()
    const config = TONE_CONFIGS[tone]

    let cancelled = false
    const totalDurationMs = Math.min(Math.max(text.length * 52, 3400), 6800)
    const startTime = performance.now()

    // Schedule warm analog tape harmonic pads + vocal formant pulses
    if (ctx) {
      const now = ctx.currentTime
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.001, now)
      masterGain.gain.exponentialRampToValueAtTime(0.14, now + 0.25)
      masterGain.gain.setValueAtTime(0.14, now + totalDurationMs / 1000 - 0.5)
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDurationMs / 1000)

      const lowpass = ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.setValueAtTime(config.warmthFilterHz, now)
      lowpass.Q.setValueAtTime(1.8, now)

      masterGain.connect(lowpass)
      lowpass.connect(ctx.destination)

      const stepSec = config.tempoMs / 1000
      const steps = Math.floor(totalDurationMs / config.tempoMs)

      for (let i = 0; i < steps; i++) {
        const ratio = config.syllablePattern[i % config.syllablePattern.length]
        const noteStart = now + i * stepSec
        const noteDur = stepSec * 0.85

        const osc = ctx.createOscillator()
        const subOsc = ctx.createOscillator()
        const noteGain = ctx.createGain()

        osc.type = 'triangle'
        subOsc.type = 'sine'

        osc.frequency.setValueAtTime(config.baseFreq * ratio, noteStart)
        subOsc.frequency.setValueAtTime(config.baseFreq * ratio * 0.5, noteStart)

        noteGain.gain.setValueAtTime(0.001, noteStart)
        noteGain.gain.linearRampToValueAtTime(0.45, noteStart + noteDur * 0.25)
        noteGain.gain.exponentialRampToValueAtTime(0.01, noteStart + noteDur)

        osc.connect(noteGain)
        subOsc.connect(noteGain)
        noteGain.connect(masterGain)

        osc.start(noteStart)
        subOsc.start(noteStart)
        osc.stop(noteStart + noteDur)
        subOsc.stop(noteStart + noteDur)
      }

      this.stopFns.push(() => {
        try {
          masterGain.disconnect()
        } catch {
          // ignore
        }
      })
    }

    // Also invoke Web Speech API if available and unmuted for genuine spoken words in 50+ languages
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = langCode
        utterance.rate = tone === 'lullaby' ? 0.84 : tone === 'reflective' ? 0.91 : tone === 'wisdom' ? 0.88 : 1.02
        utterance.pitch = tone === 'lullaby' ? 1.06 : tone === 'wisdom' ? 0.92 : 1.0
        utterance.volume = 0.85
        window.speechSynthesis.speak(utterance)
      } catch {
        // Fallback to pure harmonic synthesis
      }
    }

    const interval = window.setInterval(() => {
      if (cancelled) {
        window.clearInterval(interval)
        return
      }
      const elapsed = performance.now() - startTime
      const ratio = Math.min(elapsed / totalDurationMs, 1)
      onProgress?.(ratio)

      const stepIndex = Math.floor(elapsed / config.tempoMs)
      const syllableRatio =
        config.syllablePattern[stepIndex % config.syllablePattern.length] || 1
      const pulsePhase = (elapsed % config.tempoMs) / config.tempoMs
      const envelope = Math.sin(pulsePhase * Math.PI)
      const energy = Math.min(
        1,
        Math.max(0.22, ((syllableRatio - 0.8) / 0.55) * 0.55 + envelope * 0.45)
      )
      window.dispatchEvent(
        new CustomEvent('living-heirloom:voice-energy', {
          detail: { active: true, energy, tone },
        })
      )

      if (ratio >= 1) {
        window.clearInterval(interval)
        this.stopAll()
        onEnd?.()
      }
    }, 40)

    const cleanup = () => {
      cancelled = true
      window.clearInterval(interval)
      this.stopAll()
    }

    this.stopFns.push(cleanup)
    return cleanup
  }
}

export const voicePreviewEngine = new BrowserVoicePreviewEngine()
