function Header({ page, onNavigate, auth, onLogin, onLogout }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">
            🎮
          </span>
          <span>
            Game<span className="brand-accent">Heroes</span>
          </span>
        </div>

        <nav className="nav">
          <button
            type="button"
            className={page === 'characters' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('characters')}
          >
            Personnages
          </button>
          <button
            type="button"
            className={page === 'games' ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate('games')}
          >
            Jeux
          </button>
        </nav>

        <div className="user">
          {auth ? (
            <>
              <span className="user-name">👤 {auth.username}</span>
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
