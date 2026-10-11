import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../toast'
import ErrorMessage from './ErrorMessage'
import Stars from './Stars'

function formatDate(value) {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Ratings and comments of one character + the form for my own review
function Reviews({ characterId, token, username, onAskLogin, onChanged, onUnauthorized }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const isMine = (r) => username && r.username.toLowerCase() === username.toLowerCase()
  const mine = reviews.find(isMine)

  useEffect(() => {
    let ignore = false
    api
      .getReviews(characterId)
      .then((data) => {
        if (ignore) return
        setReviews(data)
        const my = data.find((r) => username && r.username.toLowerCase() === username.toLowerCase())
        setRating(my?.rating ?? 0)
        setComment(my?.comment ?? '')
      })
      .catch((err) => !ignore && setError(err))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [characterId, username])

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      setError(new Error('Choisissez une note de 1 à 5 étoiles.'))
      return
    }
    setError(null)
    setSaving(true)
    try {
      const saved = await api.saveReview(characterId, { rating, comment: comment.trim() || null }, token)
      setReviews((list) => [saved, ...list.filter((r) => !isMine(r))])
      toast(mine ? 'Avis modifié' : 'Merci pour votre avis !')
      onChanged()
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.deleteReview(characterId, token)
      setReviews((list) => list.filter((r) => !isMine(r)))
      setRating(0)
      setComment('')
      toast('Avis supprimé')
      onChanged()
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      else setError(err)
    }
  }

  return (
    <section className="reviews">
      <div className="reviews-header">
        <h3>Avis</h3>
        {reviews.length > 0 && (
          <span className="reviews-average">
            <Stars value={average} /> <strong>{average.toFixed(1)}</strong>
            <span className="muted"> ({reviews.length})</span>
          </span>
        )}
      </div>

      {token ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-row">
            <span>{mine ? 'Votre note' : 'Donnez une note'}</span>
            <Stars value={rating} onChange={setRating} size="big" />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Un commentaire ? (facultatif)"
          />
          <ErrorMessage error={error} />
          <div className="review-form-actions">
            {mine && (
              <button type="button" className="link danger-link" onClick={handleDelete}>
                Supprimer mon avis
              </button>
            )}
            <button type="submit" className="button small" disabled={saving}>
              {saving ? 'Envoi…' : mine ? 'Mettre à jour' : 'Publier'}
            </button>
          </div>
        </form>
      ) : (
        <p className="muted">
          <button type="button" className="link" onClick={onAskLogin}>
            Connectez-vous
          </button>{' '}
          pour donner votre avis.
        </p>
      )}

      {loading ? (
        <p className="muted">Chargement des avis…</p>
      ) : reviews.length === 0 ? (
        <p className="muted">Pas encore d'avis. Soyez le premier !</p>
      ) : (
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id} className={isMine(r) ? 'review mine' : 'review'}>
              <div className="review-top">
                <span className="review-avatar">{r.username.charAt(0).toUpperCase()}</span>
                <strong>{r.username}</strong>
                {isMine(r) && <span className="chip small-chip">Vous</span>}
                <Stars value={r.rating} size="small" />
                <span className="muted review-date">{formatDate(r.updatedAt ?? r.createdAt)}</span>
              </div>
              {r.comment && <p>{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Reviews
