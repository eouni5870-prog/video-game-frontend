import { useState } from 'react'
import { api } from '../api'
import ErrorMessage from './ErrorMessage'

function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const credentials = { username: username.trim(), password }
      const result =
        mode === 'login' ? await api.login(credentials) : await api.register(credentials)
      onSuccess(result)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage error={error} />

      <label>
        Nom d'utilisateur
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={50}
          required
          autoFocus
        />
      </label>

      <label>
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === 'register' ? 6 : undefined}
          required
        />
      </label>

      <button type="submit" className="button" disabled={saving}>
        {saving ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
      </button>

      <p className="muted center">
        {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
        >
          {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
        </button>
      </p>
    </form>
  )
}

export default AuthForm
