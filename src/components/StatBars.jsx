import { STATS } from '../stats'

function StatBars({ character }) {
  return (
    <div className="stat-bars">
      {STATS.map((s) => (
        <div key={s.key} className="stat-bar">
          <span>{s.icon} {s.label}</span>
          <div className="level-bar">
            <div style={{ width: `${character[s.key] ?? 0}%` }} />
          </div>
          <strong>{character[s.key] ?? 0}</strong>
        </div>
      ))}
    </div>
  )
}

export default StatBars
