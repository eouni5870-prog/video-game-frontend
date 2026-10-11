import { STATS } from '../stats'

const COLORS = ['#a78bfa', '#f472b6']

// Radar chart of the 4 stats (0-100). Accepts 1 or 2 characters (to compare them).
function RadarChart({ characters, size = 260 }) {
  const center = size / 2
  const radius = size / 2 - 48
  const angle = (i) => (Math.PI * 2 * i) / STATS.length - Math.PI / 2
  const point = (i, value) => [
    center + Math.cos(angle(i)) * radius * (value / 100),
    center + Math.sin(angle(i)) * radius * (value / 100),
  ]

  return (
    <svg className="radar" viewBox={`0 0 ${size} ${size}`} role="img"
      aria-label={characters.map((c) => `${c.name}: ${STATS.map((s) => `${s.label} ${c[s.key]}`).join(', ')}`).join(' — ')}>
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          className="radar-ring"
          points={STATS.map((_, i) => point(i, ring).join(',')).join(' ')}
        />
      ))}
      {STATS.map((s, i) => {
        const [x, y] = point(i, 100)
        const [lx, ly] = point(i, 122)
        return (
          <g key={s.key}>
            <line className="radar-axis" x1={center} y1={center} x2={x} y2={y} />
            <text className="radar-label" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
              {s.icon} {s.label}
            </text>
          </g>
        )
      })}
      {characters.map((c, n) => (
        <polygon
          key={c.id}
          className="radar-shape"
          style={{ fill: COLORS[n], stroke: COLORS[n] }}
          points={STATS.map((s, i) => point(i, c[s.key] ?? 0).join(',')).join(' ')}
        />
      ))}
    </svg>
  )
}

export { COLORS }
export default RadarChart
