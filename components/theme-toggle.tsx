'use client'

import React, { useEffect, useState } from 'react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (dark: boolean) => {
      if (dark) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
      setIsDark(dark)
    }

    const stored = window.localStorage.getItem('living-heirloom-theme')
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored === 'dark')
    } else {
      applyTheme(mediaQuery.matches)
    }

    const handleMediaChange = (e: MediaQueryListEvent) => {
      const manual = window.localStorage.getItem('living-heirloom-theme')
      if (!manual) {
        applyTheme(e.matches)
      }
    }

    const handleCustomSync = (e: Event) => {
      const custom = e as CustomEvent<{ dark: boolean }>
      if (typeof custom.detail?.dark === 'boolean') {
        setIsDark(custom.detail.dark)
      }
    }

    mediaQuery.addEventListener('change', handleMediaChange)
    window.addEventListener('living-heirloom:theme-change', handleCustomSync)
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener(
        'living-heirloom:theme-change',
        handleCustomSync
      )
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    const root = document.documentElement
    if (nextDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    window.localStorage.setItem(
      'living-heirloom-theme',
      nextDark ? 'dark' : 'light'
    )
    setIsDark(nextDark)
    window.dispatchEvent(
      new CustomEvent('living-heirloom:theme-change', {
        detail: { dark: nextDark },
      })
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? 'Switch to Sunlit Light Mode'
          : 'Switch to Candlelit Dark Mode'
      }
      title={
        isDark
          ? 'Switch to Sunlit Light Mode'
          : 'Switch to Candlelit Dark Mode'
      }
      className={`group inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--ink-slate-navy)] uppercase transition-all duration-300 hover:border-[#ff5924] hover:text-[var(--accent-ember)] ${className}`}
    >
      {mounted && isDark ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-[var(--accent-ember)] transition-transform duration-300 group-hover:rotate-12"
          >
            <circle
              cx="12"
              cy="12"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M12 2.5V5M12 19V21.5M4.22 4.22L5.99 5.99M18.01 18.01L19.78 19.78M2.5 12H5M19 12H21.5M4.22 19.78L5.99 18.01M18.01 5.99L19.78 4.22"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="hidden sm:inline">Sunlit</span>
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-[var(--accent-ember)] transition-transform duration-300 group-hover:-rotate-12"
          >
            <path
              d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:inline">Candlelit</span>
        </>
      )}
    </button>
  )
}
