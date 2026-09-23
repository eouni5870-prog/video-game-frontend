import { useEffect, useState } from 'react'
import { api } from '../api'
import CharacterCard, { displayName } from './CharacterCard'
import CharacterDetail from './CharacterDetail'
import CharacterForm, { ROLES } from './CharacterForm'
import ErrorMessage from './ErrorMessage'
import Modal from './Modal'
import Pagination from './Pagination'

const PAGE_SIZE = 12

function CharactersPage({ token, onUnauthorized, onAskLogin, initialGameId = '' }) {
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

  // Games for the filter and the form
  useEffect(() => {
    api.getGames().then(setGames).catch(() => setGames([]))
  }, [reloadKey])

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
      setReloadKey((k) => k + 1)
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    }
  }

  const handleSaved = () => {
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
        <button type="button" className="button big" onClick={() => (token ? setEditing('new') : onAskLogin())}>
          + Nouveau personnage
        </button>
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
        {hasFilters && (
          <button type="button" className="button secondary" onClick={resetFilters}>
            Effacer
          </button>
        )}
      </div>

      <ErrorMessage error={error} />

      {loading && !result && <p className="muted">Chargement…</p>}

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
              canEdit={Boolean(token)}
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

      {viewing && (
        <Modal title={displayName(viewing)} onClose={() => setViewing(null)}>
          <CharacterDetail
            character={viewing}
            canEdit={Boolean(token)}
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
