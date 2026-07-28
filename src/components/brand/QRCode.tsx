import { useMemo } from 'react'
import qrcode from 'qrcode-generator'

interface QRCodeProps {
  /** The URL or text the code resolves to. */
  value: string
  /** Rendered pixel size (square). Scales crisply; it is an SVG. */
  size?: number
  /** Quiet-zone width, in modules. The spec asks for 4; 3 reads fine on screen. */
  margin?: number
  /** Foreground (dark modules) colour. */
  dark?: string
  /** Background colour behind the code and quiet zone. */
  light?: string
  className?: string
  /** Accessible label; falls back to announcing the value. */
  title?: string
}

/**
 * A real, self-contained QR code rendered as an SVG.
 *
 * Generation is synchronous (qrcode-generator), so this works at render time
 * with no network call and inlines cleanly into the single-file viewer build.
 * Every dark module is emitted into one <path>, which keeps the markup small.
 */
export function QRCode({
  value,
  size = 168,
  margin = 3,
  dark = '#14312d',
  light = '#ffffff',
  className,
  title,
}: QRCodeProps) {
  const { path, dim } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    const count = qr.getModuleCount()
    const dimension = count + margin * 2
    let d = ''
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          d += `M${col + margin} ${row + margin}h1v1h-1z`
        }
      }
    }
    return { path: d, dim: dimension }
  }, [value, margin])

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${dim} ${dim}`}
      role="img"
      aria-label={title ?? `QR code for ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={dim} height={dim} fill={light} />
      <path d={path} fill={dark} />
    </svg>
  )
}
