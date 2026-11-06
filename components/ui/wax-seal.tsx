'use client'
interface WaxSealBadgeProps {
  crest: 'oak' | 'olive' | 'lotus' | 'star' | 'compass'
  size?: 'sm' | 'md' | 'lg'
  sealed?: boolean
}

export function WaxSealBadge({
  crest,
  size = 'md',
  sealed = true,
}: WaxSealBadgeProps) {
  const dimensions =
    size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'

  return (
    <div
      aria-hidden="true"
      className={`${dimensions} relative flex shrink-0 items-center justify-center rounded-full border transition-transform duration-500 ${
        sealed
          ? 'border-[#ff5924]/45 bg-[var(--canvas-blush)] text-[var(--accent-ember)]'
          : 'border-[#748297]/40 bg-[var(--card-parchment)] text-[var(--ink-slate-navy)]'
      }`}
    >
      <span className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-current opacity-35" />
      {crest === 'oak' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C9.5 3 8 5 8 7.5C6 7.5 4.5 9 4.5 11C4.5 13.5 6.5 15 9 15H15C17.5 15 19.5 13.5 19.5 11C19.5 9 18 7.5 16 7.5C16 5 14.5 3 12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 15V21M9 21H15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      {crest === 'olive' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 19C9 15 14 10 19 5M14 6C11 6 9 8 9 11C12 11 14 9 14 6ZM18 10C15 10 13 12 13 15C16 15 18 13 18 10Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      {crest === 'lotus' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4C10 8 9 11 12 16C15 11 14 8 12 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M12 16C8 15 5.5 12.5 5 9C8 9.5 10.5 11.5 12 16ZM12 16C16 15 18.5 12.5 19 9C16 9.5 13.5 11.5 12 16Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M6 19H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      {crest === 'star' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {crest === 'compass' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M14.8 9.2L13 13L9.2 14.8L11 11L14.8 9.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}
