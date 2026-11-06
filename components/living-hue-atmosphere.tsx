'use client'

import { useEffect } from 'react'

/**
 * LivingHueAtmosphere
 * Drives the 4-layer fluid, cursor-reactive & voice-resonant hue system across the site:
 * 1. Viscous "Golden-Hour" Hero pools (Sienna + Golden Amber + Rose Blush) with 600ms-1000ms spring lag & figure-8 autonomous drift.
 * 2. "Lamp-Lit Paper" inner radial wash inside Pastel Cards (.pastel-card-parchment, .pastel-card-blue, .pastel-card-sage, .hero-elevated-card).
 * 3. Voice-Reactive Hue Resonance (--voice-resonance) that swells in warmth when a spoken memory is playing.
 * 4. "Candlelight in the Archive" deep ember & burgundy aura inside the Dark Manifesto section (#privacy-manifesto).
 */
export function LivingHueAtmosphere() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReducedMotion) return

    const root = document.documentElement

    // Normalized viewport pointer target (0..1)
    let targetX = 0.5
    let targetY = 0.24
    let lastPointerTime = 0

    // Viscous interpolated pools (different damping weights for fluid separation)
    let siennaX = 0.5
    let siennaY = 0.22
    let amberX = 0.5
    let amberY = 0.28

    // Client pixel coordinates for section/card projection
    let pointerClientX = window.innerWidth * 0.5
    let pointerClientY = window.innerHeight * 0.28

    // Voice resonance state (0..1)
    let targetVoiceEnergy = 0
    let currentVoiceEnergy = 0

    // Track hovered interactive cards for lamp-lit paper effect
    const CARD_SELECTOR =
      '.pastel-card-parchment, .pastel-card-blue, .pastel-card-sage, .hero-elevated-card, .dark-card-glow'

    const cardStates = new Map<
      HTMLElement,
      {
        curX: number
        curY: number
        targetX: number
        targetY: number
        opacity: number
        targetOpacity: number
      }
    >()

    const handlePointerMove = (e: PointerEvent) => {
      pointerClientX = e.clientX
      pointerClientY = e.clientY
      targetX = e.clientX / Math.max(window.innerWidth, 1)
      targetY = e.clientY / Math.max(window.innerHeight, 1)
      lastPointerTime = performance.now()

      const cards = document.querySelectorAll<HTMLElement>(CARD_SELECTOR)
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect()
        // Check if card is near or under cursor
        const pad = 120
        const isNear =
          e.clientX >= rect.left - pad &&
          e.clientX <= rect.right + pad &&
          e.clientY >= rect.top - pad &&
          e.clientY <= rect.bottom + pad

        if (!isNear && !cardStates.has(card)) return

        const relX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100
        const relY = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom

        const existing = cardStates.get(card) || {
          curX: relX,
          curY: relY,
          targetX: relX,
          targetY: relY,
          opacity: 0,
          targetOpacity: 0,
        }

        existing.targetX = Math.max(-15, Math.min(115, relX))
        existing.targetY = Math.max(-15, Math.min(115, relY))
        existing.targetOpacity = isInside ? 1 : isNear ? 0.35 : 0
        cardStates.set(card, existing)
      })
    }

    const handleVoiceEnergy = (e: Event) => {
      const custom = e as CustomEvent<{
        active: boolean
        energy: number
      }>
      if (custom.detail?.active) {
        targetVoiceEnergy = custom.detail.energy
      } else {
        targetVoiceEnergy = 0
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('living-heirloom:voice-energy', handleVoiceEnergy)

    let rafId = 0

    const tick = (now: number) => {
      // Autonomous slow figure-8 Lissajous sunlight drift
      const driftX = Math.sin(now * 0.00055) * 0.11 + Math.cos(now * 0.00028) * 0.05
      const driftY = Math.cos(now * 0.00042) * 0.07 + Math.sin(now * 0.00031) * 0.04

      // Blend cursor target with autonomous drift (if cursor idle > 3.5s, drift becomes more prominent)
      const idleFactor = Math.min(1, Math.max(0.25, (now - lastPointerTime) / 4500))
      const effectiveTargetX =
        targetX * (1 - idleFactor * 0.35) + (0.5 + driftX) * (idleFactor * 0.35) + driftX * 0.35
      const effectiveTargetY =
        targetY * (1 - idleFactor * 0.35) + (0.24 + driftY) * (idleFactor * 0.35) + driftY * 0.35

      // Viscous spring lag: Sienna pool (0.042 lerp) and Golden Amber pool (0.022 lerp)
      siennaX += (effectiveTargetX - siennaX) * 0.042
      siennaY += (effectiveTargetY - siennaY) * 0.042

      amberX += (effectiveTargetX - driftX * 0.45 - amberX) * 0.022
      amberY += (effectiveTargetY + driftY * 0.45 - amberY) * 0.022

      // Smooth voice resonance interpolation
      currentVoiceEnergy += (targetVoiceEnergy - currentVoiceEnergy) * 0.08

      root.style.setProperty('--hue-sienna-x', `${(siennaX * 100).toFixed(2)}%`)
      root.style.setProperty('--hue-sienna-y', `${(siennaY * 100).toFixed(2)}%`)
      root.style.setProperty('--hue-amber-x', `${(amberX * 100).toFixed(2)}%`)
      root.style.setProperty('--hue-amber-y', `${(amberY * 100).toFixed(2)}%`)
      root.style.setProperty(
        '--voice-resonance',
        currentVoiceEnergy.toFixed(3)
      )

      // Update section-specific coordinates for Dark Manifesto candlelight if visible
      const darkSection = document.getElementById('privacy-manifesto')
      if (darkSection) {
        const rect = darkSection.getBoundingClientRect()
        if (rect.bottom > -100 && rect.top < window.innerHeight + 100) {
          const relDarkX =
            ((pointerClientX - rect.left) / Math.max(rect.width, 1)) * 100
          const relDarkY =
            ((pointerClientY - rect.top) / Math.max(rect.height, 1)) * 100
          const prevX = parseFloat(
            darkSection.style.getPropertyValue('--dark-candle-x') || '50'
          )
          const prevY = parseFloat(
            darkSection.style.getPropertyValue('--dark-candle-y') || '28'
          )
          const nextX = prevX + (Math.max(5, Math.min(95, relDarkX)) - prevX) * 0.038
          const nextY = prevY + (Math.max(5, Math.min(95, relDarkY)) - prevY) * 0.038
          darkSection.style.setProperty(
            '--dark-candle-x',
            `${nextX.toFixed(2)}%`
          )
          darkSection.style.setProperty(
            '--dark-candle-y',
            `${nextY.toFixed(2)}%`
          )
        }
      }

      // Update each active card's viscous lamp-lit coordinates
      cardStates.forEach((state, card) => {
        if (!card.isConnected) {
          cardStates.delete(card)
          return
        }
        state.curX += (state.targetX - state.curX) * 0.065
        state.curY += (state.targetY - state.curY) * 0.065
        state.opacity += (state.targetOpacity - state.opacity) * 0.075

        card.style.setProperty('--card-x', `${state.curX.toFixed(2)}%`)
        card.style.setProperty('--card-y', `${state.curY.toFixed(2)}%`)
        card.style.setProperty('--card-glow-opacity', state.opacity.toFixed(3))

        if (state.opacity < 0.005 && state.targetOpacity === 0) {
          cardStates.delete(card)
        }
      })

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener(
        'living-heirloom:voice-energy',
        handleVoiceEnergy
      )
    }
  }, [])

  return null
}
