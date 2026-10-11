import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { formatDate, formatPrice } from '../format'
import ErrorMessage from './ErrorMessage'
import GameCover from './GameCover'

// "Mes achats": the games I own + my order history
function OrdersPage({ token, onUnauthorized, onGoShop }) {
  const [orders, setOrders] = useState([])
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getOrders(token), api.getGames()])
      .then(([o, g]) => {
        setOrders(o)
        setGames(g)
      })
      .catch((err) => (err.status === 401 ? onUnauthorized() : setError(err)))
      .finally(() => setLoading(false))
  }, [token, onUnauthorized])

  // Library = every game bought (the current game info when it still exists)
  const library = useMemo(() => {
    const byId = new Map(games.map((g) => [g.id, g]))
    const seen = new Map()
    for (const order of orders)
      for (const item of order.items) {
        const key = item.gameId ?? `deleted-${item.gameName}`
        if (!seen.has(key)) seen.set(key, byId.get(item.gameId) ?? { id: key, name: item.gameName, genre: 'Retiré de la boutique' })
      }
    return [...seen.values()]
  }, [orders, games])

  const spent = orders.reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <section>
      <div className="hero">
        <div>
          <p className="hero-kicker">Mon compte</p>
          <h1>Mes achats</h1>
          <p className="hero-text">
            {loading
              ? 'Chargement…'
              : `${library.length} jeu${library.length > 1 ? 'x' : ''} · ${orders.length} commande${orders.length > 1 ? 's' : ''} · ${formatPrice(spent)} dépensés`}
          </p>
        </div>
        <button type="button" className="button big" onClick={onGoShop}>
          🛒 Aller à la boutique
        </button>
      </div>

      <ErrorMessage error={error} />

      {!loading && orders.length === 0 && (
        <div className="empty">
          <span className="empty-icon">🎮</span>
          Vous n'avez encore rien acheté.
        </div>
      )}

      {library.length > 0 && (
        <>
          <h2 className="section-title">Ma bibliothèque</h2>
          <div className="library">
            {library.map((g) => (
              <div key={g.id} className="library-item">
                <GameCover game={g} />
                <strong>{g.name}</strong>
                <span className="muted">{g.genre}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {orders.length > 0 && (
        <>
          <h2 className="section-title">Historique des commandes</h2>
          <div className="orders">
            {orders.map((o) => (
              <article key={o.id} className="order">
                <div className="order-head">
                  <strong>Commande n° {o.id}</strong>
                  <span className="muted">{formatDate(o.createdAt)}</span>
                  <span className="price">{formatPrice(o.total)}</span>
                </div>
                <ul>
                  {o.items.map((i, n) => (
                    <li key={n}>
                      <span>{i.gameName}</span>
                      <span className="muted">{formatPrice(i.unitPrice)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default OrdersPage
