interface TrendLineProps {
  values: number[]
  benchmark?: number
  benchmarkLabel?: string
  light?: boolean
}

const W = 640
const H = 230
const PAD = 30
const MIN = 66
const MAX = 98

export function TrendLine({ values, benchmark, benchmarkLabel, light }: TrendLineProps) {
  const grid = light ? '#e4efec' : '#0f3e37'
  const axisText = light ? '#7c9a94' : '#5f8b83'
  const lineCol = light ? '#0b6b64' : '#2ad8be'
  const dotCol = light ? '#0e857d' : '#1fbfa9'
  const fillCol = light ? '#0e857d' : '#1fbfa9'

  const x = (i: number) => PAD + (i / (values.length - 1)) * (W - PAD * 1.6)
  const y = (v: number) => H - PAD - ((v - MIN) / (MAX - MIN)) * (H - PAD * 2)

  const gridlines: number[] = []
  for (let v = 70; v <= 95; v += 5) gridlines.push(v)

  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${x(values.length - 1).toFixed(1)} ${H - PAD} L${x(0).toFixed(1)} ${H - PAD} Z`
  const last = values.length - 1
  const gid = light ? 'trend-fill-l' : 'trend-fill'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fillCol} stopOpacity={light ? '0.16' : '0.22'} />
          <stop offset="1" stopColor={fillCol} stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridlines.map((v) => (
        <g key={v}>
          <line x1={PAD} y1={y(v)} x2={W - 12} y2={y(v)} stroke={grid} />
          <text x={2} y={y(v) + 4} fontFamily="Space Mono" fontSize={10} fill={axisText}>
            {v}
          </text>
        </g>
      ))}

      {benchmark !== undefined && (
        <g>
          <line x1={PAD} y1={y(benchmark)} x2={W - 12} y2={y(benchmark)} stroke="#e0a13c" strokeWidth={1} strokeDasharray="4 4" opacity={0.85} />
          <text x={W - 78} y={y(benchmark) - 6} fontFamily="Space Mono" fontSize={9} fill={light ? '#b07d20' : '#f0b44a'}>
            {benchmarkLabel}
          </text>
        </g>
      )}

      <path d={area} fill={`url(#${gid})`} opacity={0} style={{ animation: 'st-fade-in 0.8s 1s forwards' }} />
      <path
        d={line}
        fill="none"
        stroke={lineCol}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'st-draw 1.6s 0.5s forwards' }}
      />
      {values.map((v, i) => (
        <circle key={i} cx={x(i).toFixed(1)} cy={y(v).toFixed(1)} r={2.6} fill={dotCol} />
      ))}
      <circle cx={x(last).toFixed(1)} cy={y(values[last]).toFixed(1)} r={5} fill="#f76f5c">
        <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
