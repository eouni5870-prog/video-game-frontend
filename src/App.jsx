import { useState } from 'react'
import './App.css'
import AuthForm from './components/AuthForm'
import CharactersPage from './components/CharactersPage'
import GamesPage from './components/GamesPage'
import Header from './components/Header'
import Modal from './components/Modal'
import { useAuth } from './useAuth'

function App() {
  const { auth, signIn, signOut } = useAuth()
  const [page, setPage] = useState('characters')
  const [gameFilter, setGameFilter] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')

  const askLogin = (message = '') => {
    setLoginMessage(message)
    setShowLogin(true)
  }

  // Token expired or missing -> log out and open the login window
  const handleUnauthorized = () => {
    signOut()
    askLogin('Votre session a expiré. Reconnectez-vous.')
  }

  const navigate = (target) => {
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
        onLogin={() => askLogin()}
        onLogout={signOut}
      />

      <main className="container main">
        {page === 'characters' ? (
          <CharactersPage
            key={gameFilter}
            initialGameId={gameFilter}
            token={auth?.token}
            onUnauthorized={handleUnauthorized}
            onAskLogin={() => askLogin('Connectez-vous pour ajouter ou modifier.')}
          />
        ) : (
          <GamesPage
            token={auth?.token}
            onUnauthorized={handleUnauthorized}
            onAskLogin={() => askLogin('Connectez-vous pour ajouter ou modifier.')}
            onShowCharacters={showCharactersOfGame}
          />
        )}
      </main>

      {showLogin && (
        <Modal title="Connexion" onClose={() => setShowLogin(false)}>
          {loginMessage && <p className="info">{loginMessage}</p>}
          <AuthForm
            onSuccess={(result) => {
              signIn(result)
              setShowLogin(false)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default App
