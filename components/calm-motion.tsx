'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CalmRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  distance?: number
  duration?: number
  as?: 'div' | 'section' | 'article' | 'span'
}

export function CalmReveal({
  children,
  className = '',
  delay = 0,
  distance = 18,
  duration = 720,
  as: Component = 'div',
}: CalmRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(true)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true)
      return
    }

    const rect = el.getBoundingClientRect()
    // If element starts below the viewport fold, gently reveal it on scroll
    if (rect.top > window.innerHeight * 0.92) {
      setShouldAnimate(true)
      setVisible(false)

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.01, rootMargin: '0px 0px 60px 0px' }
      )

      observer.observe(el)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={
        shouldAnimate
          ? {
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translate3d(0, 0px, 0) scale(1)'
                : `translate3d(0, ${distance}px, 0) scale(0.992)`,
              transition: `opacity ${duration}ms cubic-bezier(0.19, 1, 0.22, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.19, 1, 0.22, 1) ${delay}ms`,
            }
          : undefined
      }
    >
      {children}
    </Component>
  )
}

interface RevealLinesProps {
  lines: React.ReactNode[]
  className?: string
  lineClassName?: string
  staggerMs?: number
  baseDelayMs?: number
}

export function RevealLines({
  lines,
  className = '',
  lineClassName = '',
  staggerMs = 95,
  baseDelayMs = 40,
}: RevealLinesProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [visible, setVisible] = useState(true)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true)
      return
    }

    const rect = el.getBoundingClientRect()
    if (rect.top > window.innerHeight * 0.92) {
      setShouldAnimate(true)
      setVisible(false)

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.01, rootMargin: '0px 0px 60px 0px' }
      )

      observer.observe(el)
      return () => observer.disconnect()
    }
  }, [])

  return (
    <span ref={ref} className={`block ${className}`}>
      {lines.map((line, idx) => (
        <span
          key={idx}
          className={`block py-[0.06em] ${lineClassName}`}
          style={
            shouldAnimate
              ? {
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? 'translate3d(0, 0px, 0)'
                    : 'translate3d(0, 22px, 0)',
                  transition: `transform 780ms cubic-bezier(0.19, 1, 0.22, 1) ${
                    baseDelayMs + idx * staggerMs
                  }ms, opacity 620ms cubic-bezier(0.19, 1, 0.22, 1) ${
                    baseDelayMs + idx * staggerMs
                  }ms`,
                }
              : undefined
          }
        >
          <span className="block">{line}</span>
        </span>
      ))}
    </span>
  )
}
