import { getRarity } from '../rarity'

function roleClass(role) {
  const r = (role || '').toLowerCase()
  if (r === 'hero') return 'badge-hero'
  if (r === 'villain') return 'badge-villain'
  if (r === 'support') return 'badge-support'
  return ''
}

export function displayName(character) {
  return character.name?.trim() || '(sans nom)'
}

// 3D tilt: the card leans toward the mouse
function handleMove(e) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  card.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
  card.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
  card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
  card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
}

function handleLeave(e) {
  const card = e.currentTarget
  card.style.setProperty('--rx', '0deg')
  card.style.setProperty('--ry', '0deg')
}

function CharacterCard({ character, canEdit, isFavorite, onToggleFavorite, isCompared, onToggleCompare, onOpen, onEdit, onDelete }) {
  const hasName = Boolean(character.name?.trim())
  const name = displayName(character)
  const role = character.role?.trim() || 'Sans rôle'
  const rarity = getRarity(character.level)

  return (
    <article className={`card rarity-${rarity.key}${isCompared ? ' compared' : ''}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <button type="button" className="card-cover" onClick={() => onOpen(character)} aria-label={`Voir ${name}`}>
        {character.imageUrl ? (
          <img src={character.imageUrl} alt={name} loading="lazy" />
        ) : (
          <span className="card-initial">{hasName ? name.charAt(0).toUpperCase() : '?'}</span>
        )}
        <span className="card-shine" aria-hidden="true" />
        <span className={`badge ${roleClass(role)}`}>{role}</span>
        <span className="card-level">Niv. {character.level}</span>
      </button>

      <button
        type="button"
        className={isFavorite ? 'fav-button on' : 'fav-button'}
        onClick={() => onToggleFavorite(character)}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-pressed={isFavorite}
      >
        {isFavorite ? '♥' : '♡'}
      </button>

      <button
        type="button"
        className={isCompared ? 'compare-button on' : 'compare-button'}
        onClick={() => onToggleCompare(character)}
        aria-label={isCompared ? 'Retirer de la comparaison' : 'Comparer'}
        aria-pressed={isCompared}
        title="Comparer"
      >
        ⚔️
      </button>

      <div className="card-body">
        <div className="card-title-row">
          <h3>{name}</h3>
          <span className={`rarity-tag rarity-tag-${rarity.key}`}>{rarity.label}</span>
        </div>
        <p className="card-game">🎮 {character.gameName}</p>
        <p className="card-rating">
          {character.reviewCount > 0 ? (
            <>
              <span className="star on">★</span> {character.averageRating.toFixed(1)}
              <span className="muted"> ({character.reviewCount} avis)</span>
            </>
          ) : (
            <span className="muted">Pas encore noté</span>
          )}
          {character.favoriteCount > 0 && <span className="muted card-fav-count">♥ {character.favoriteCount}</span>}
        </p>
        <div className="level-bar" title={`Niveau ${character.level}`}>
          <div style={{ width: `${Math.min(character.level, 100)}%` }} />
        </div>
      </div>

      {canEdit && (
        <div className="card-actions">
          <button type="button" className="button ghost small" onClick={() => onEdit(character)}>
            ✏️ Modifier
          </button>
          <button type="button" className="button danger small" onClick={() => onDelete(character)} aria-label="Supprimer">
            🗑️
          </button>
        </div>
      )}
    </article>
  )
}

export { roleClass }
export default CharacterCard
