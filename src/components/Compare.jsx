import { STATS, totalStats } from '../stats'
import { displayName } from './CharacterCard'
import RadarChart, { COLORS } from './RadarChart'

// Side-by-side "battle" of two characters
function Compare({ characters }) {
  const [a, b] = characters
  const totalA = totalStats(a)
  const totalB = totalStats(b)
  const winner = totalA === totalB ? null : totalA > totalB ? a : b

  return (
    <div className="compare">
      <div className="compare-heads">
        {[a, b].map((c, n) => (
          <div key={c.id} className="compare-head" style={{ '--c': COLORS[n] }}>
            <div className="compare-avatar">
              {c.imageUrl ? <img src={c.imageUrl} alt="" /> : <span>{displayName(c).charAt(0).toUpperCase()}</span>}
            </div>
            <strong>{displayName(c)}</strong>
            <span className="muted">{c.gameName}</span>
          </div>
        ))}
        <span className="compare-vs">VS</span>
      </div>

      <RadarChart characters={[a, b]} size={300} />

      <table className="compare-table">
        <tbody>
          {STATS.map((s) => {
            const va = a[s.key] ?? 0
            const vb = b[s.key] ?? 0
            return (
              <tr key={s.key}>
                <td className={va > vb ? 'win' : ''}>{va}</td>
                <th>{s.icon} {s.label}</th>
                <td className={vb > va ? 'win' : ''}>{vb}</td>
              </tr>
            )
          })}
          <tr className="compare-total">
            <td className={totalA > totalB ? 'win' : ''}>{totalA}</td>
            <th>Total</th>
            <td className={totalB > totalA ? 'win' : ''}>{totalB}</td>
          </tr>
        </tbody>
      </table>

      <p className="compare-result">
        {winner ? <>🏆 <strong>{displayName(winner)}</strong> l'emporte !</> : '🤝 Égalité parfaite !'}
      </p>
    </div>
  )
}

export default Compare
