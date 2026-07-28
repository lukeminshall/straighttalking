interface LogoProps {
  variant?: 'colour' | 'reverse'
  wordmark?: boolean
  height?: number
  className?: string
}

/**
 * The Straight Talking mark: a speech bubble with a single straight line of talk.
 * `reverse` renders white-on-dark; `colour` renders teal-on-light.
 */
export function Logo({ variant = 'colour', wordmark = true, height = 32, className }: LogoProps) {
  const bubble = variant === 'reverse' ? '#ffffff' : 'var(--st-teal)'
  const bar = variant === 'reverse' ? 'var(--st-teal)' : '#ffffff'
  const text = variant === 'reverse' ? '#ffffff' : 'var(--st-ink)'
  const accent = 'var(--st-teal)'

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}
    >
      <svg viewBox="0 0 120 120" style={{ height, width: 'auto', flex: 'none' }} aria-hidden="true">
        <rect x="16" y="16" width="88" height="74" rx="26" fill={bubble} />
        <path d="M46 88 L36 107 L64 88 Z" fill={bubble} />
        <rect x="36" y="47" width="48" height="12" rx="6" fill={bar} />
      </svg>
      {wordmark && (
        <span
          style={{
            fontFamily: 'var(--ff-display)',
            fontWeight: 700,
            fontSize: height * 0.62,
            letterSpacing: '-0.02em',
            color: text,
          }}
        >
          Straight <span style={{ color: variant === 'reverse' ? 'var(--st-teal-g)' : accent }}>Talking</span>
        </span>
      )}
    </span>
  )
}
