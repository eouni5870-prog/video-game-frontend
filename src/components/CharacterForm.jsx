import { useState } from 'react'
import { api } from '../api'
import ErrorMessage from './ErrorMessage'
import ImagePicker from './ImagePicker'

export const ROLES = ['Hero', 'Villain', 'Support']

function CharacterForm({ character, games, token, onSaved, onUnauthorized }) {
  const isNew = !character
  const [form, setForm] = useState({
    name: character?.name ?? '',
    role: character?.role ?? 'Hero',
    gameId: character?.gameId ?? games[0]?.id ?? '',
    level: character?.level ?? 1,
    imageUrl: character?.imageUrl ?? '',
    description: character?.description ?? '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const body = {
      name: form.name.trim(),
      role: form.role.trim(),
      gameId: Number(form.gameId),
      level: Number(form.level),
      imageUrl: form.imageUrl.trim() || null,
      description: form.description.trim() || null,
    }

    try {
      if (isNew) await api.createCharacter(body, token)
      else await api.updateCharacter(character.id, body, token)
      onSaved()
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    } finally {
      setSaving(false)
    }
  }

  if (games.length === 0) {
    return <p className="muted">Ajoutez d'abord un jeu dans l'onglet « Jeux ».</p>
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage error={error} />

      <ImagePicker
        value={form.imageUrl}
        onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
        token={token}
        onError={(err) => (err.status === 401 ? onUnauthorized() : setError(err))}
      />

      <label>
        Nom *
        <input value={form.name} onChange={update('name')} maxLength={100} required />
      </label>

      <div className="form-row">
        <label>
          Rôle *
          <input value={form.role} onChange={update('role')} maxLength={50} list="roles" required />
          <datalist id="roles">
            {ROLES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </label>

        <label>
          Niveau (1-100)
          <input type="number" min={1} max={100} value={form.level} onChange={update('level')} required />
        </label>
      </div>

      <label>
        Jeu *
        <select value={form.gameId} onChange={update('gameId')} required>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Description
        <textarea value={form.description} onChange={update('description')} maxLength={1000} rows={3} />
      </label>

      <button type="submit" className="button" disabled={saving}>
        {saving ? 'Enregistrement…' : isNew ? 'Ajouter le personnage' : 'Enregistrer'}
      </button>
    </form>
  )
}

export default CharacterForm
