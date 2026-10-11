import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useCart } from '../cart'
import { formatPrice } from '../format'
import { useToast } from '../toast'
import ErrorMessage from './ErrorMessage'
import GameCover from './GameCover'

const SORTS = {
  name: { label: 'Nom (A → Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  priceAsc: { label: 'Prix croissant', fn: (a, b) => a.price - b.price },
  priceDesc: { label: 'Prix décroissant', fn: (a, b) => b.price - a.price },
  newest: { label: 'Plus récents', fn: (a, b) => b.releaseYear - a.releaseYear },
}

function ShopPage({ ownedIds, onShowCharacters }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [sort, setSort] = useState('name')
  const cart = useCart()
  const toast = useToast()

  useEffect(() => {
    api
      .getGames()
      .then(setGames)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const genres = useMemo(() => [...new Set(games.map((g) => g.genre))].sort(), [games])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return games
      .filter((g) => (!term || g.name.toLowerCase().includes(term)) && (!genre || g.genre === genre))
      .sort(SORTS[sort].fn)
  }, [games, search, genre, sort])

  const addToCart = (game) => {
    cart.add(game)
    toast(`${game.name} ajouté au panier`)
  }

  return (
    <section>
      <div className="hero shop-hero">
        <div>
          <p className="hero-kicker">Boutique</p>
          <h1>Jeux vidéo</h1>
          <p className="hero-text">
            {loading ? 'Chargement…' : `${games.length} jeux disponibles · achat simulé, aucun paiement réel`}
          </p>
        </div>
        <button type="button" className="button big" onClick={() => cart.setOpen(true)}>
          🛒 Voir le panier {cart.count > 0 && `(${cart.count})`}
        </button>
      </div>

      <div className="filters">
        <input type="search" placeholder="🔍  Rechercher un jeu…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Tous les genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <ErrorMessage error={error} />

      {!loading && visible.length === 0 && (
        <div className="empty">
          <span className="empty-icon">🛒</span>
          Aucun jeu ne correspond à votre recherche.
        </div>
      )}

      <div className="shop-grid">
        {visible.map((game) => {
          const owned = ownedIds.has(game.id)
          const inCart = cart.has(game.id)
          return (
            <article key={game.id} className={owned ? 'product owned' : 'product'}>
              <GameCover game={game} />
              {owned && <span className="product-ribbon">✓ Possédé</span>}
              <div className="product-body">
                <h3>{game.name}</h3>
                <p className="muted">
                  {game.genre} · {game.releaseYear}
                </p>
                <button type="button" className="link product-chars" onClick={() => onShowCharacters(game.id)}>
                  👥 {game.characterCount} personnage{game.characterCount > 1 ? 's' : ''}
                </button>
              </div>
              <div className="product-footer">
                <span className="price">{formatPrice(game.price)}</span>
                {owned ? (
                  <span className="product-owned">Dans votre bibliothèque</span>
                ) : inCart ? (
                  <button type="button" className="button secondary small" onClick={() => cart.remove(game.id)}>
                    ✓ Dans le panier
                  </button>
                ) : (
                  <button type="button" className="button small" onClick={() => addToCart(game)}>
                    Ajouter au panier
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ShopPage
