import { useState } from 'react'
import { api } from '../api'
import ErrorMessage from './ErrorMessage'

function GameForm({ game, token, onSaved, onUnauthorized }) {
  const isNew = !game
  const [form, setForm] = useState({
    name: game?.name ?? '',
    genre: game?.genre ?? '',
    releaseYear: game?.releaseYear ?? new Date().getFullYear(),
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const body = { name: form.name.trim(), genre: form.genre.trim(), releaseYear: Number(form.releaseYear) }
    try {
      if (isNew) await api.createGame(body, token)
      else await api.updateGame(game.id, body, token)
      onSaved()
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage error={error} />

      <label>
        Nom *
        <input value={form.name} onChange={update('name')} maxLength={100} required autoFocus />
      </label>

      <div className="form-row">
        <label>
          Genre *
          <input value={form.genre} onChange={update('genre')} maxLength={50} required placeholder="RPG, Action…" />
        </label>
        <label>
          Année de sortie *
          <input
            type="number"
            min={1950}
            max={2100}
            value={form.releaseYear}
            onChange={update('releaseYear')}
            required
          />
        </label>
      </div>

      <button type="submit" className="button" disabled={saving}>
        {saving ? 'Enregistrement…' : isNew ? 'Ajouter le jeu' : 'Enregistrer'}
      </button>
    </form>
  )
}

export default GameForm
