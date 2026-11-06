'use client'
import { useEffect, useId, useRef, useState } from 'react'
export { WaxSealBadge } from './wax-seal'
export interface BespokeOption {
  value: string
  label: string
  sublabel?: string
  badge?: string
}
interface Props {
  id?: string
  label?: string
  value: string
  options: BespokeOption[]
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}
export function BespokeSelect({
  id,
  label,
  value,
  options,
  onChange,
  className = '',
  disabled = false,
}: Props) {
  const uid = useId(),
    controlId = id || uid,
    listId = `${controlId}-options`
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(0)
  const container = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [])
  useEffect(() => {
    if (open)
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: 'nearest' })
  }, [open, active, listId])
  function choose(index: number) {
    if (options[index]) onChange(options[index].value)
    setOpen(false)
    trigger.current?.focus()
  }
  return (
    <div ref={container} className={`bespoke-select ${className}`}>
      {label && (
        <label className="control-label" htmlFor={controlId}>
          {label}
        </label>
      )}
      <button
        ref={trigger}
        id={controlId}
        type="button"
        disabled={disabled || !options.length}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className="select-trigger"
        onClick={() => {
          setActive(selected)
          setOpen(!open)
        }}
        onKeyDown={(event) => {
          if (
            ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(
              event.key,
            )
          ) {
            event.preventDefault()
            if (!open) {
              setOpen(true)
              setActive(selected)
              return
            }
            if (event.key === 'Enter' || event.key === ' ') {
              choose(active)
              return
            }
            setActive(
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? options.length - 1
                  : (active +
                      (event.key === 'ArrowUp' ? -1 : 1) +
                      options.length) %
                    options.length,
            )
          } else if (event.key === 'Escape' || event.key === 'Tab')
            setOpen(false)
          else if (event.key.length === 1) {
            const found = options.findIndex((option) =>
              option.label.toLowerCase().startsWith(event.key.toLowerCase()),
            )
            if (found >= 0) {
              setActive(found)
              setOpen(true)
            }
          }
        }}
      >
        <span>
          <span className="select-value">
            {options[selected]?.label || 'Choose an option'}
          </span>
          {options[selected]?.sublabel && (
            <span className="select-detail">{options[selected].sublabel}</span>
          )}
        </span>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
          <path
            d={open ? 'M3 10L8 5L13 10' : 'M3 6L8 11L13 6'}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label || 'Options'}
          className="select-options"
        >
          {options.map((option, index) => (
            <div
              id={`${listId}-${index}`}
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`select-option ${index === active ? 'is-active' : ''}`}
              onPointerMove={() => setActive(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>
                <span className="select-value">{option.label}</span>
                {option.sublabel && (
                  <span className="select-detail">{option.sublabel}</span>
                )}
              </span>
              <span aria-hidden="true">
                {option.value === value ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
