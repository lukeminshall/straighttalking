interface Segment {
  value: number
  colour: string
}

interface DonutProps {
  segments: Segment[]
  centre?: string
  centreSub?: string
  size?: number
  light?: boolean
}

export function Donut({ segments, centre, centreSub, size = 120, light }: DonutProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.4
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const holeFill = light ? '#ffffff' : '#08302b'
  const centreText = light ? '#063d39' : '#eaf6f3'
  const subText = light ? '#46605c' : '#8fb6af'

  let angle = -90
  const arcs = segments.map((seg, i) => {
    const sweep = (seg.value / total) * 360
    const a2 = angle + sweep
    const large = sweep > 180 ? 1 : 0
    const x1 = cx + r * Math.cos((angle * Math.PI) / 180)
    const y1 = cy + r * Math.sin((angle * Math.PI) / 180)
    const x2 = cx + r * Math.cos((a2 * Math.PI) / 180)
    const y2 = cy + r * Math.sin((a2 * Math.PI) / 180)
    angle = a2
    return (
      <path
        key={i}
        d={`M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
        fill={seg.colour}
      />
    )
  })

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-8deg)' }}>
      {arcs}
      <circle cx={cx} cy={cy} r={r * 0.62} fill={holeFill} />
      {centre && (
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight={560} fontSize={19} fill={centreText}>
          {centre}
        </text>
      )}
      {centreSub && (
        <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="Inter" fontSize={9} fill={subText}>
          {centreSub}
        </text>
      )}
    </svg>
  )
}
