import { useEffect, useState } from 'react'
import { api } from '../api'
import CharacterCard, { displayName } from './CharacterCard'
import CharacterDetail from './CharacterDetail'
import Compare from './Compare'
import CharacterForm, { ROLES } from './CharacterForm'
import ErrorMessage from './ErrorMessage'
import Modal from './Modal'
import Pagination from './Pagination'
import CardSkeleton from './CardSkeleton'
import { useToast } from '../toast'

const PAGE_SIZE = 12

function CharactersPage({ token, username, isAdmin = false, onUnauthorized, onAskLogin, initialGameId = '' }) {
  const [query, setQuery] = useState({
    search: '',
    gameId: initialGameId,
    role: '',
    page: 1,
    pageSize: PAGE_SIZE,
  })
  const [searchInput, setSearchInput] = useState('')
  const [result, setResult] = useState(null)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // null = closed, 'new' = add, object = edit
  const [viewing, setViewing] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const toast = useToast()
  const [favoriteIds, setFavoriteIds] = useState(() => new Set())
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [compared, setCompared] = useState([])
  const [showCompare, setShowCompare] = useState(false)

  // Games for the filter and the form
  useEffect(() => {
    api.getGames().then(setGames).catch(() => setGames([]))
  }, [reloadKey])

  // Ids of my favorites (to fill the hearts)
  useEffect(() => {
    if (!token) {
      setFavoriteIds(new Set())
      setShowFavorites(false)
      return
    }
    api
      .getFavoriteIds(token)
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => setFavoriteIds(new Set()))
  }, [token])

  // My favorites list, when the "Mes favoris" filter is on
  useEffect(() => {
    if (!showFavorites || !token) return
    api.getFavorites(token).then(setFavorites).catch(setError)
  }, [showFavorites, token, favoriteIds, reloadKey])

  const toggleFavorite = async (character) => {
    if (!token) {
      onAskLogin()
      return
    }
    const wasFavorite = favoriteIds.has(character.id)
    const next = new Set(favoriteIds)
    if (wasFavorite) next.delete(character.id)
    else next.add(character.id)
    setFavoriteIds(next) // update the heart right away
    try {
      if (wasFavorite) await api.removeFavorite(character.id, token)
      else await api.addFavorite(character.id, token)
      toast(wasFavorite ? 'Retiré des favoris' : `${displayName(character)} ajouté aux favoris ♥`)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setFavoriteIds(favoriteIds) // undo
      if (err.status === 401) onUnauthorized()
      else toast(err.message, 'error')
    }
  }

  // Pick up to 2 characters to compare (picking a 3rd replaces the oldest)
  const toggleCompare = (character) => {
    setCompared((list) =>
      list.some((c) => c.id === character.id)
        ? list.filter((c) => c.id !== character.id)
        : [...list, character].slice(-2),
    )
  }

  // Wait 300 ms after typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((q) => (q.search === searchInput ? q : { ...q, search: searchInput, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Load characters every time the filters, the page or the data change
  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    api
      .getCharacters(query)
      .then((data) => !ignore && setResult(data))
      .catch((err) => !ignore && setError(err))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [query, reloadKey])

  const setFilter = (field) => (e) => setQuery({ ...query, [field]: e.target.value, page: 1 })

  const resetFilters = () => {
    setSearchInput('')
    setQuery({ search: '', gameId: '', role: '', page: 1, pageSize: PAGE_SIZE })
  }

  const handleDelete = async (character) => {
    const name = character.name?.trim() || 'ce personnage'
    if (!window.confirm(`Supprimer ${name} ?`)) return
    try {
      await api.deleteCharacter(character.id, token)
      toast(`${name} supprimé`)
      setReloadKey((k) => k + 1)
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    }
  }

  const handleSaved = () => {
    toast(editing === 'new' ? 'Personnage ajouté' : 'Personnage modifié')
    setEditing(null)
    setReloadKey((k) => k + 1)
  }

  const hasFilters = query.search || query.gameId || query.role

  return (
    <section>
      <div className="hero">
        <div>
          <p className="hero-kicker">Collection</p>
          <h1>Personnages</h1>
          <p className="hero-text">
            {result
              ? `${result.totalCount} personnage${result.totalCount > 1 ? 's' : ''} dans ${games.length} jeu${games.length > 1 ? 'x' : ''}`
              : 'Chargement de la collection…'}
          </p>
        </div>
        {isAdmin && (
          <button type="button" className="button big" onClick={() => setEditing('new')}>
            + Nouveau personnage
          </button>
        )}
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="🔍  Rechercher un personnage…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select value={query.gameId} onChange={setFilter('gameId')}>
          <option value="">Tous les jeux</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select value={query.role} onChange={setFilter('role')}>
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={showFavorites ? 'button fav-filter on' : 'button secondary fav-filter'}
          onClick={() => (token ? setShowFavorites(!showFavorites) : onAskLogin())}
          aria-pressed={showFavorites}
        >
          {showFavorites ? '♥' : '♡'} Mes favoris
        </button>
        {hasFilters && (
          <button type="button" className="button secondary" onClick={resetFilters}>
            Effacer
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      {showFavorites ? (
        favorites.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">♡</span>
            Aucun favori pour le moment. Cliquez sur le cœur d'une carte pour l'ajouter.
          </div>
        ) : (
          <div className="grid">
            {favorites.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                canEdit={isAdmin}
                isFavorite={favoriteIds.has(character.id)}
                onToggleFavorite={toggleFavorite}
                isCompared={compared.some((c) => c.id === character.id)}
                onToggleCompare={toggleCompare}
                onOpen={setViewing}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      ) : (
        <>
          {loading && !result && <CardSkeleton />}

          {result && result.items.length === 0 && !loading && (
            <div className="empty">
              <span className="empty-icon">🕹️</span>
              {hasFilters ? 'Aucun personnage ne correspond à votre recherche.' : 'Aucun personnage pour le moment.'}
            </div>
          )}

          {result && result.items.length > 0 && (
            <div className={loading ? 'grid loading' : 'grid'}>
              {result.items.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  canEdit={isAdmin}
                  isFavorite={favoriteIds.has(character.id)}
                  onToggleFavorite={toggleFavorite}
                  isCompared={compared.some((c) => c.id === character.id)}
                  onToggleCompare={toggleCompare}
                  onOpen={setViewing}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {result && (
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={(page) => setQuery({ ...query, page })}
            />
          )}
        </>
      )}

      {compared.length > 0 && (
        <div className="compare-bar">
          <span>
            ⚔️ {compared.map((c) => displayName(c)).join(' vs ')}
            {compared.length === 1 && <span className="muted"> — choisissez un 2e personnage</span>}
          </span>
          <div className="compare-bar-actions">
            <button type="button" className="button secondary small" onClick={() => setCompared([])}>
              Annuler
            </button>
            <button type="button" className="button small" disabled={compared.length < 2} onClick={() => setShowCompare(true)}>
              Comparer
            </button>
          </div>
        </div>
      )}

      {showCompare && compared.length === 2 && (
        <Modal title="Comparaison" onClose={() => setShowCompare(false)}>
          <Compare characters={compared} />
        </Modal>
      )}

      {viewing && (
        <Modal title={displayName(viewing)} onClose={() => setViewing(null)}>
          <CharacterDetail
            character={viewing}
            canEdit={isAdmin}
            isFavorite={favoriteIds.has(viewing.id)}
            onToggleFavorite={toggleFavorite}
            token={token}
            username={username}
            onAskLogin={() => {
              setViewing(null)
              onAskLogin()
            }}
            onReviewsChanged={() => setReloadKey((k) => k + 1)}
            onUnauthorized={() => {
              setViewing(null)
              onUnauthorized()
            }}
            onEdit={(c) => {
              setViewing(null)
              setEditing(c)
            }}
          />
        </Modal>
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Nouveau personnage' : 'Modifier le personnage'}
          onClose={() => setEditing(null)}
        >
          <CharacterForm
            character={editing === 'new' ? null : editing}
            games={games}
            token={token}
            onSaved={handleSaved}
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

export default CharactersPage
