import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { api } from './api'
import AdminPage from './components/AdminPage'
import AuthForm from './components/AuthForm'
import CartDrawer from './components/CartDrawer'
import CharactersPage from './components/CharactersPage'
import GamesPage from './components/GamesPage'
import Header from './components/Header'
import Modal from './components/Modal'
import OrdersPage from './components/OrdersPage'
import ShopPage from './components/ShopPage'
import { useAuth } from './useAuth'
import { useToast } from './toast'

function App() {
  const { auth, isAdmin, signIn, signOut } = useAuth()
  const toast = useToast()
  const [page, setPage] = useState('characters')
  const [gameFilter, setGameFilter] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [ownedIds, setOwnedIds] = useState(() => new Set())
  const token = auth?.token

  const askLogin = (message = '') => {
    setLoginMessage(message)
    setShowLogin(true)
  }

  // Token expired or missing -> log out and open the login window
  const handleUnauthorized = useCallback(() => {
    signOut()
    setLoginMessage('Votre session a expiré. Reconnectez-vous.')
    setShowLogin(true)
  }, [signOut])

  // Games I already bought (shop shows "Possédé")
  const loadOwned = useCallback(() => {
    if (!token) {
      setOwnedIds(new Set())
      return
    }
    api
      .getOwnedGameIds(token)
      .then((ids) => setOwnedIds(new Set(ids)))
      .catch(() => setOwnedIds(new Set()))
  }, [token])

  useEffect(loadOwned, [loadOwned])

  const navigate = (target) => {
    if (target === 'orders' && !token) {
      askLogin('Connectez-vous pour voir vos achats.')
      return
    }
    if (target === 'admin' && !isAdmin) return
    setGameFilter('')
    setPage(target)
  }

  const showCharactersOfGame = (gameId) => {
    setGameFilter(String(gameId))
    setPage('characters')
  }

  return (
    <div className="app">
      <Header
        page={page}
        onNavigate={navigate}
        auth={auth}
        isAdmin={isAdmin}
        onLogin={() => askLogin()}
        onLogout={() => {
          signOut()
          if (page === 'orders' || page === 'admin') setPage('shop')
          toast('Vous êtes déconnecté')
        }}
      />

      <main className="container main">
        {page === 'characters' && (
          <CharactersPage
            key={gameFilter}
            initialGameId={gameFilter}
            token={token}
            username={auth?.username}
            isAdmin={isAdmin}
            onUnauthorized={handleUnauthorized}
            onAskLogin={() => askLogin('Connectez-vous pour continuer.')}
          />
        )}
        {page === 'shop' && <ShopPage ownedIds={ownedIds} onShowCharacters={showCharactersOfGame} />}
        {page === 'games' && (
          <GamesPage
            token={token}
            isAdmin={isAdmin}
            onUnauthorized={handleUnauthorized}
            onShowCharacters={showCharactersOfGame}
          />
        )}
        {page === 'orders' && token && (
          <OrdersPage token={token} onUnauthorized={handleUnauthorized} onGoShop={() => setPage('shop')} />
        )}
        {page === 'admin' && isAdmin && (
          <AdminPage token={token} username={auth?.username} onUnauthorized={handleUnauthorized} />
        )}
      </main>

      <CartDrawer
        token={token}
        ownedIds={ownedIds}
        onAskLogin={() => askLogin('Connectez-vous pour passer commande.')}
        onUnauthorized={handleUnauthorized}
        onPurchased={() => {
          loadOwned()
          setPage('orders')
        }}
      />

      {showLogin && (
        <Modal title="Connexion" onClose={() => setShowLogin(false)}>
          {loginMessage && <p className="info">{loginMessage}</p>}
          <AuthForm
            onSuccess={(result) => {
              signIn(result)
              setShowLogin(false)
              toast(`Bienvenue, ${result.username} !`)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default App
