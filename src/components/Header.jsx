import { useCart } from '../cart'

const PAGES = [
  { key: 'characters', label: 'Personnages' },
  { key: 'shop', label: 'Boutique' },
  { key: 'games', label: 'Jeux' },
]

function Header({ page, onNavigate, auth, isAdmin, onLogin, onLogout }) {
  const cart = useCart()
  let pages = auth ? [...PAGES, { key: 'orders', label: 'Mes achats' }] : PAGES
  if (isAdmin) pages = [...pages, { key: 'admin', label: 'Admin' }]

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Click on the logo = back to the home page */}
        <button type="button" className="brand" onClick={() => onNavigate('characters')} title="Accueil">
          <span className="brand-logo" aria-hidden="true">
            🎮
          </span>
          <span>
            Game<span className="brand-accent">Heroes</span>
          </span>
        </button>

        <nav className="nav">
          {pages.map((p) => (
            <button
              key={p.key}
              type="button"
              className={page === p.key ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate(p.key)}
            >
              {p.label}
            </button>
          ))}
        </nav>

        <div className="user">
          <button type="button" className="cart-button" onClick={() => cart.setOpen(true)} aria-label={`Panier (${cart.count})`}>
            🛒
            {cart.count > 0 && <span className="cart-badge">{cart.count}</span>}
          </button>
          {auth ? (
            <>
              <span className="user-name">
                👤 {auth.username}
                {isAdmin && <span className="admin-tag">Admin</span>}
              </span>
              <button type="button" className="button secondary" onClick={onLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <button type="button" className="button" onClick={onLogin}>
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
