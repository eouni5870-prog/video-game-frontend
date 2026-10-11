import { useEffect, useState } from 'react'
import { api } from '../api'
import ErrorMessage from './ErrorMessage'
import GameForm from './GameForm'
import Modal from './Modal'
import GameCover from './GameCover'
import { formatPrice } from '../format'
import { useToast } from '../toast'

function GamesPage({ token, isAdmin = false, onUnauthorized, onShowCharacters }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const toast = useToast()

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    api
      .getGames()
      .then((data) => !ignore && setGames(data))
      .catch((err) => !ignore && setError(err))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [reloadKey])

  const handleDelete = async (game) => {
    if (!window.confirm(`Supprimer le jeu ${game.name} ?`)) return
    try {
      await api.deleteGame(game.id, token)
      toast(`${game.name} supprimé`)
      setReloadKey((k) => k + 1)
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    }
  }

  return (
    <section>
      <div className="hero">
        <div>
          <p className="hero-kicker">Bibliothèque</p>
          <h1>Jeux</h1>
          <p className="hero-text">
            {loading ? 'Chargement…' : `${games.length} jeu${games.length > 1 ? 'x' : ''}`}
          </p>
        </div>
        {isAdmin && (
          <button type="button" className="button big" onClick={() => setEditing('new')}>
            + Nouveau jeu
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      {loading && <p className="muted">Chargement…</p>}

      {!loading && games.length === 0 && !error && (
        <div className="empty">
          <span className="empty-icon">🎮</span>
          Aucun jeu pour le moment.
        </div>
      )}

      {games.length > 0 && (
        <div className="game-grid">
          {games.map((game) => (
            <article key={game.id} className="game-card">
              <button type="button" className="game-main" onClick={() => onShowCharacters(game.id)}>
                <GameCover game={game} className="icon" />
                <span className="game-info">
                  <strong>{game.name}</strong>
                  <span>
                    {game.genre} · {game.releaseYear} · <b className="price">{formatPrice(game.price)}</b>
                  </span>
                </span>
                <span className="game-count">
                  {game.characterCount}
                  <small>perso{game.characterCount > 1 ? 's' : ''}</small>
                </span>
              </button>
              {isAdmin && (
                <div className="card-actions">
                  <button type="button" className="button ghost small" onClick={() => setEditing(game)}>
                    ✏️ Modifier
                  </button>
                  <button type="button" className="button danger small" onClick={() => handleDelete(game)}>
                    🗑️
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Nouveau jeu' : 'Modifier le jeu'} onClose={() => setEditing(null)}>
          <GameForm
            game={editing === 'new' ? null : editing}
            token={token}
            onSaved={() => {
              toast(editing === 'new' ? 'Jeu ajouté' : 'Jeu modifié')
              setEditing(null)
              setReloadKey((k) => k + 1)
            }}
            onUnauthorized={() => {
              setEditing(null)
              onUnauthorized()
            }}
          />
        </Modal>
      )}
    </section>
  )
}

export default GamesPage
