import { useEffect, useState } from 'react'
import { api } from '../api'
import { useCart } from '../cart'
import { formatPrice } from '../format'
import { useToast } from '../toast'
import ErrorMessage from './ErrorMessage'
import GameCover from './GameCover'

// Side panel with the cart and the (simulated) checkout
function CartDrawer({ token, ownedIds, onAskLogin, onUnauthorized, onPurchased }) {
  const cart = useCart()
  const toast = useToast()
  const [step, setStep] = useState('cart') // 'cart' | 'checkout'
  const [error, setError] = useState(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!cart.open) {
      setStep('cart')
      setError(null)
    }
  }, [cart.open])

  useEffect(() => {
    if (!cart.open) return
    const onKey = (e) => e.key === 'Escape' && cart.setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cart])

  if (!cart.open) return null

  const owned = cart.items.filter((g) => ownedIds.has(g.id))

  const goToCheckout = () => {
    if (!token) {
      cart.setOpen(false)
      onAskLogin()
      return
    }
    setStep('checkout')
  }

  const pay = async () => {
    setError(null)
    setPaying(true)
    try {
      await api.createOrder(cart.items.map((g) => g.id), token)
      cart.clear()
      cart.setOpen(false)
      toast('Achat confirmé ! Les jeux sont dans votre bibliothèque 🎉')
      onPurchased()
    } catch (err) {
      if (err.status === 401) {
        cart.setOpen(false)
        onUnauthorized()
      } else setError(err)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && cart.setOpen(false)}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Panier">
        <div className="drawer-header">
          <h2>{step === 'cart' ? `🛒 Panier (${cart.count})` : '💳 Paiement'}</h2>
          <button type="button" className="icon-button" onClick={() => cart.setOpen(false)} aria-label="Fermer">
            ×
          </button>
        </div>

        {cart.count === 0 ? (
          <div className="drawer-empty">
            <span className="empty-icon">🛒</span>
            <p>Votre panier est vide.</p>
          </div>
        ) : step === 'cart' ? (
          <>
            <ul className="cart-list">
              {cart.items.map((g) => (
                <li key={g.id} className="cart-item">
                  <GameCover game={g} className="small" />
                  <div className="cart-item-info">
                    <strong>{g.name}</strong>
                    {ownedIds.has(g.id) ? (
                      <span className="cart-warning">Déjà dans votre bibliothèque</span>
                    ) : (
                      <span className="muted">{g.genre}</span>
                    )}
                  </div>
                  <span className="price">{formatPrice(g.price)}</span>
                  <button type="button" className="icon-button" onClick={() => cart.remove(g.id)} aria-label={`Retirer ${g.name}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatPrice(cart.total)}</strong>
              </div>
              <button type="button" className="button big" onClick={goToCheckout} disabled={owned.length > 0}>
                {token ? 'Commander' : 'Se connecter pour commander'}
              </button>
              {owned.length > 0 && <p className="cart-warning">Retirez les jeux que vous possédez déjà.</p>}
            </div>
          </>
        ) : (
          <div className="checkout">
            <div className="checkout-notice">
              <strong>🎓 Paiement simulé</strong>
              <p>Ce site est un projet d'étude : aucune carte bancaire n'est demandée et aucun argent n'est débité.</p>
            </div>
            <ul className="checkout-summary">
              {cart.items.map((g) => (
                <li key={g.id}>
                  <span>{g.name}</span>
                  <span>{formatPrice(g.price)}</span>
                </li>
              ))}
              <li className="checkout-total">
                <span>Total</span>
                <strong>{formatPrice(cart.total)}</strong>
              </li>
            </ul>
            <ErrorMessage error={error} />
            <button type="button" className="button big" onClick={pay} disabled={paying}>
              {paying ? 'Validation…' : `Confirmer l'achat · ${formatPrice(cart.total)}`}
            </button>
            <button type="button" className="link center" onClick={() => setStep('cart')}>
              ← Retour au panier
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
