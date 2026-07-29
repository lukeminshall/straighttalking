/**
 * Straight Talking line-icon set.
 *
 * One consistent family: 24x24 viewBox, 1.6 stroke, round joins, currentColor.
 * These deliberately replace the emoji that used to stand in for iconography,
 * so every surface reads as one designed system rather than a prototype.
 */

export type IconName =
  | 'building'
  | 'network'
  | 'trend'
  | 'star'
  | 'pencil'
  | 'check'
  | 'globe'
  | 'stand'
  | 'card'
  | 'poster'
  | 'sticker'
  | 'banner'
  | 'tent'
  | 'window'
  | 'lanyard'
  | 'letter'
  | 'mail'
  | 'message'
  | 'monitor'
  | 'code'
  | 'nfc'
  | 'qr'
  | 'lock'
  | 'heart'
  | 'alert'
  | 'doc'

interface IconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}

const P: Record<IconName, React.ReactNode> = {
  building: (
    <>
      <path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path d="M14 10h4a2 2 0 0 1 2 2v8" />
      <path d="M3 20h18" />
      <path d="M7 8h2M7 12h2M7 16h2M17 14h.5M17 17h.5" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="18" r="2.2" />
      <circle cx="19" cy="18" r="2.2" />
      <path d="M10.5 6.8 6.4 16M13.5 6.8 17.6 16M7.2 18h9.6" />
    </>
  ),
  trend: (
    <>
      <path d="M4 19h16" />
      <path d="M4 15l4.5-5 3.5 3L20 6" />
      <path d="M16 6h4v4" />
    </>
  ),
  star: (
    <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L5.8 9.8l5-.7z" />
  ),
  pencil: (
    <>
      <path d="M4 20h4l10-10a2 2 0 0 0-2.8-2.8L5.2 17.2z" />
      <path d="M13.5 6.5l3 3" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.5 12.3l2.4 2.4 4.6-4.9" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.8c2.4 2.3 3.6 5.2 3.6 8.2s-1.2 5.9-3.6 8.2c-2.4-2.3-3.6-5.2-3.6-8.2S9.6 6.1 12 3.8z" />
    </>
  ),
  stand: (
    <>
      <rect x="7" y="3.5" width="10" height="10" rx="1.5" />
      <path d="M9.5 6.2h2v2h-2zM12.8 6.2h1.7v1.7h-1.7zM9.5 9.3h1.7V11H9.5zM13 9.5h1.5V11H13z" />
      <path d="M12 13.5v4M8 20.5l4-3 4 3z" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <rect x="6" y="9" width="5" height="5" rx="1" />
      <path d="M13.5 10h4M13.5 13h4M6 16.5h6" />
    </>
  ),
  poster: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <rect x="9" y="6.5" width="6" height="6" rx="1" />
      <path d="M8 15.5h8M8 18h5" />
    </>
  ),
  sticker: (
    <>
      <path d="M4.5 4.5h11a1.5 1.5 0 0 1 1.5 1.5v7.5L13.5 17H6a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M17 13.5h-2.5a1 1 0 0 0-1 1V17" />
      <rect x="7" y="7" width="4.5" height="4.5" rx="0.8" />
    </>
  ),
  banner: (
    <>
      <rect x="7.5" y="3.5" width="9" height="13" rx="1" />
      <path d="M12 16.5v3M8.5 20.5h7" />
      <path d="M9.8 6.5h4.4M9.8 9h4.4M9.8 11.5h2.8" />
    </>
  ),
  tent: (
    <>
      <path d="M12 4.5 5 12v.5h14V12z" />
      <path d="M5 12.5v6h14v-6" />
      <path d="M9.3 9.5h5.4" />
    </>
  ),
  window: (
    <>
      <rect x="4.5" y="4" width="15" height="16" rx="1.5" />
      <path d="M12 4v16M4.5 12h15" />
      <path d="M7 7.2h2M15 7.2h2" />
    </>
  ),
  lanyard: (
    <>
      <path d="M9 3.5l3 3 3-3" />
      <path d="M12 6.5v2" />
      <rect x="7.5" y="8.5" width="9" height="11" rx="1.5" />
      <path d="M10 12h4M10 14.5h4M10 17h2.5" />
    </>
  ),
  letter: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7.5l8 5 8-5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M4.5 8l7.5 4.5L19.5 8" />
    </>
  ),
  message: (
    <>
      <path d="M4.5 5.5h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H10l-4 3.2V15.5H4.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" />
      <path d="M8 9.5h8M8 12h5" />
    </>
  ),
  monitor: (
    <>
      <rect x="3.5" y="4.5" width="17" height="11" rx="1.5" />
      <path d="M9 19.5h6M12 15.5v4" />
      <path d="M7.5 8l2 2.2-2 2.2M11.5 12.5h3.5" />
    </>
  ),
  code: (
    <>
      <path d="M8.5 8.5 4.5 12l4 3.5" />
      <path d="M15.5 8.5 19.5 12l-4 3.5" />
      <path d="M13.2 6.5l-2.4 11" />
    </>
  ),
  nfc: (
    <>
      <path d="M6.5 6.5a11 11 0 0 1 0 11" />
      <path d="M9.8 8.6a6 6 0 0 1 0 6.8" />
      <path d="M13.2 10.4a2.4 2.4 0 0 1 0 3.2" />
      <circle cx="16.4" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <path d="M14 14h3v3h-3zM19 14v.01M14 19v.01M17 19h3v1" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14v2.5" />
    </>
  ),
  heart: (
    <path d="M12 20s-6.5-4.2-8.5-8.2C2.2 9.2 3.4 6.2 6.2 5.7c1.9-.3 3.4.8 4.1 2 .3.5.9.5 1.2 0 .7-1.2 2.2-2.3 4.1-2 2.8.5 4 3.5 2.7 6.1C18.5 15.8 12 20 12 20z" />
  ),
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3.5h6.5L18 8v12.5H7z" />
      <path d="M13.2 3.6V8H18" />
      <path d="M9.5 12.5h6M9.5 15.5h6M9.5 18h3.5" />
    </>
  ),
}

export function Icon({ name, size = 24, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  )
}
