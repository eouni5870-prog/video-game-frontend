import { gameHue } from '../format'

// Game cover: the picture if there is one, otherwise a colored tile with the initial
function GameCover({ game, className = '' }) {
  if (game.coverUrl) {
    return (
      <div className={`game-cover ${className}`}>
        <img src={game.coverUrl} alt={game.name} loading="lazy" />
      </div>
    )
  }
  const hue = gameHue(game.name)
  return (
    <div
      className={`game-cover placeholder ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 60) % 360} 75% 30%))` }}
    >
      <span>{game.name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export default GameCover
