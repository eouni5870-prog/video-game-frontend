import { displayName, roleClass } from './CharacterCard'
import { getRarity } from '../rarity'
import Reviews from './Reviews'
import RadarChart from './RadarChart'
import StatBars from './StatBars'

function CharacterDetail({ character, canEdit, onEdit, isFavorite, onToggleFavorite, token, username, onAskLogin, onReviewsChanged, onUnauthorized }) {
  const name = displayName(character)
  const role = character.role?.trim() || 'Sans rôle'
  const rarity = getRarity(character.level)

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
        <span className={`rarity-tag rarity-tag-${rarity.key}`}>{rarity.label}</span>
        <span className="chip">🎮 {character.gameName}</span>
      </div>

      <div className="detail-level">
        <span>Niveau {character.level}</span>
        <div className="level-bar big">
          <div style={{ width: `${Math.min(character.level, 100)}%` }} />
        </div>
      </div>

      <div className="detail-stats">
        <RadarChart characters={[character]} size={220} />
        <StatBars character={character} />
      </div>

      <p className={character.description ? 'detail-description' : 'detail-description muted'}>
        {character.description || 'Pas encore de description.'}
      </p>

      <div className="detail-actions">
        <button type="button" className={isFavorite ? 'button ghost fav-on' : 'button ghost'} onClick={() => onToggleFavorite(character)}>
          {isFavorite ? '♥ Dans mes favoris' : '♡ Ajouter aux favoris'}
        </button>
        {canEdit && (
          <button type="button" className="button" onClick={() => onEdit(character)}>
            ✏️ Modifier
          </button>
        )}
      </div>

      <Reviews
        characterId={character.id}
        token={token}
        username={username}
        onAskLogin={onAskLogin}
        onChanged={onReviewsChanged}
        onUnauthorized={onUnauthorized}
      />
    </div>
  )
}

export default CharacterDetail
