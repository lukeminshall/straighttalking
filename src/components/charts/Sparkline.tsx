interface SparklineProps {
  values: number[]
  colour?: string
  width?: number
  height?: number
  fill?: boolean
}

export function Sparkline({ values, colour = '#2ad8be', width = 120, height = 34, fill = false }: SparklineProps) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const x = (i: number) => (i / (values.length - 1)) * width
  const y = (v: number) => height - ((v - min) / span) * height * 0.85 - 3

  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${width} ${height} L0 ${height} Z`
  const last = values.length - 1

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {fill && <path d={area} fill={colour} opacity={0.14} />}
      <path
        d={line}
        fill="none"
        stroke={colour}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'st-draw 1.4s 0.4s forwards' }}
      />
      <circle cx={x(last).toFixed(1)} cy={y(values[last]).toFixed(1)} r={2.6} fill={colour} />
    </svg>
  )
}
