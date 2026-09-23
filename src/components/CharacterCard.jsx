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

function CharacterCard({ character, canEdit, onOpen, onEdit, onDelete }) {
  const hasName = Boolean(character.name?.trim())
  const name = displayName(character)
  const role = character.role?.trim() || 'Sans rôle'

  return (
    <article className="card">
      <button type="button" className="card-cover" onClick={() => onOpen(character)} aria-label={`Voir ${name}`}>
        {character.imageUrl ? (
          <img src={character.imageUrl} alt={name} loading="lazy" />
        ) : (
          <span className="card-initial">{hasName ? name.charAt(0).toUpperCase() : '?'}</span>
        )}
        <span className={`badge ${roleClass(role)}`}>{role}</span>
        <span className="card-level">Niv. {character.level}</span>
      </button>

      <div className="card-body">
        <h3>{name}</h3>
        <p className="card-game">🎮 {character.gameName}</p>
        <div className="level-bar" title={`Niveau ${character.level}`}>
          <div style={{ width: `${Math.min(character.level, 100)}%` }} />
        </div>
      </div>

      {canEdit && (
        <div className="card-actions">
          <button type="button" className="button ghost small" onClick={() => onEdit(character)}>
            ✏️ Modifier
          </button>
          <button type="button" className="button danger small" onClick={() => onDelete(character)}>
            🗑️
          </button>
        </div>
      )}
    </article>
  )
}

export { roleClass }
export default CharacterCard
