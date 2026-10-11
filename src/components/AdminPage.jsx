import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { formatDate, formatPrice } from '../format'
import { useToast } from '../toast'
import ErrorMessage from './ErrorMessage'

// Admin dashboard: shop numbers, best sellers, last orders and user roles
function AdminPage({ token, username, onUnauthorized }) {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => {
    Promise.all([api.getAdminStats(token), api.getAdminUsers(token)])
      .then(([s, u]) => {
        setStats(s)
        setUsers(u)
        setError(null)
      })
      .catch((err) => (err.status === 401 ? onUnauthorized() : setError(err)))
  }, [token, onUnauthorized])

  useEffect(load, [load])

  const toggleRole = async (user) => {
    const role = user.role === 'Admin' ? 'User' : 'Admin'
    setBusyId(user.id)
    try {
      await api.setUserRole(user.id, role, token)
      toast(role === 'Admin' ? `${user.username} est maintenant admin` : `${user.username} n'est plus admin`)
      load()
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else toast(err.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const tiles = stats
    ? [
        { icon: '💰', label: "Chiffre d'affaires", value: formatPrice(stats.revenue) },
        { icon: '🧾', label: 'Commandes', value: stats.orderCount },
        { icon: '👥', label: 'Utilisateurs', value: stats.userCount },
        { icon: '🎮', label: 'Jeux', value: stats.gameCount },
        { icon: '🦸', label: 'Personnages', value: stats.characterCount },
        { icon: '⭐', label: 'Avis', value: stats.reviewCount },
      ]
    : []
  const maxSold = Math.max(1, ...(stats?.topGames ?? []).map((g) => g.sold))

  return (
    <section>
      <div className="hero">
        <div>
          <p className="hero-kicker">Administration</p>
          <h1>Tableau de bord</h1>
          <p className="hero-text">Gérez le catalogue et les utilisateurs de GameHeroes.</p>
        </div>
      </div>

      <ErrorMessage error={error} />
      {!stats && !error && <p className="muted">Chargement…</p>}

      {stats && (
        <>
          <div className="stat-tiles">
            {tiles.map((t) => (
              <div key={t.label} className="stat-tile">
                <span className="stat-icon" aria-hidden="true">
                  {t.icon}
                </span>
                <span className="stat-label">{t.label}</span>
                <strong className="stat-value">{t.value}</strong>
              </div>
            ))}
          </div>

          <div className="admin-grid">
            <div className="admin-panel">
              <h2 className="section-title">Meilleures ventes</h2>
              {stats.topGames.length === 0 ? (
                <p className="muted">Aucune vente pour le moment.</p>
              ) : (
                <ul className="top-games">
                  {stats.topGames.map((g) => (
                    <li key={g.gameName}>
                      <div className="top-game-line">
                        <span>{g.gameName}</span>
                        <span className="muted">
                          {g.sold} vente{g.sold > 1 ? 's' : ''} · {formatPrice(g.revenue)}
                        </span>
                      </div>
                      <div className="top-game-bar">
                        <span style={{ width: `${(g.sold / maxSold) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-panel">
              <h2 className="section-title">Dernières commandes</h2>
              {stats.recentOrders.length === 0 ? (
                <p className="muted">Aucune commande pour le moment.</p>
              ) : (
                <ul className="recent-orders">
                  {stats.recentOrders.map((o) => (
                    <li key={o.id}>
                      <span>
                        <strong>{o.username}</strong>
                        <span className="muted">
                          {' '}
                          · n° {o.id} · {formatDate(o.createdAt)} · {o.itemCount} jeu{o.itemCount > 1 ? 'x' : ''}
                        </span>
                      </span>
                      <span className="price">{formatPrice(o.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <h2 className="section-title">Utilisateurs</h2>
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>Commandes</th>
                  <th>Dépensé</th>
                  <th>Avis</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.username === username
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.username}</strong>
                        {isMe && <span className="muted"> (vous)</span>}
                      </td>
                      <td>
                        <span className={u.role === 'Admin' ? 'badge badge-admin' : 'badge'}>{u.role}</span>
                      </td>
                      <td className="muted">{formatDate(u.createdAt)}</td>
                      <td>{u.orderCount}</td>
                      <td>{formatPrice(u.spent)}</td>
                      <td>{u.reviewCount}</td>
                      <td>
                        {!isMe && (
                          <button
                            type="button"
                            className={u.role === 'Admin' ? 'button ghost small' : 'button small'}
                            disabled={busyId === u.id}
                            onClick={() => toggleRole(u)}
                          >
                            {u.role === 'Admin' ? 'Retirer admin' : 'Nommer admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default AdminPage
