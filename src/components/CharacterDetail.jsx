import { displayName, roleClass } from './CharacterCard'

function CharacterDetail({ character, canEdit, onEdit }) {
  const name = displayName(character)
  const role = character.role?.trim() || 'Sans rôle'

  return (
    <div className="detail">
      <div className="detail-image">
        {character.imageUrl ? (
          <img src={character.imageUrl} alt={name} />
        ) : (
          <span className="card-initial">{character.name?.trim() ? name.charAt(0).toUpperCase() : '?'}</span>
        )}
      </div>

      <div className="detail-tags">
        <span className={`badge ${roleClass(role)}`}>{role}</span>
        <span className="chip">🎮 {character.gameName}</span>
      </div>

      <div className="detail-level">
        <span>Niveau {character.level}</span>
        <div className="level-bar big">
          <div style={{ width: `${Math.min(character.level, 100)}%` }} />
        </div>
      </div>

      <p className={character.description ? 'detail-description' : 'detail-description muted'}>
        {character.description || 'Pas encore de description.'}
      </p>

      {canEdit && (
        <button type="button" className="button" onClick={() => onEdit(character)}>
          ✏️ Modifier ce personnage
        </button>
      )}
    </div>
  )
}

export default CharacterDetail
