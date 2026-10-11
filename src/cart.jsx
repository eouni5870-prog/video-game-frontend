import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'vgc-cart'
const CartContext = createContext(null)

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

// Shopping cart, remembered in this browser. Items are games: { id, name, price, coverUrl, genre }
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, g) => sum + Number(g.price), 0),
      has: (id) => items.some((g) => g.id === id),
      add: (game) =>
        setItems((list) =>
          list.some((g) => g.id === game.id)
            ? list
            : [...list, { id: game.id, name: game.name, price: game.price, coverUrl: game.coverUrl, genre: game.genre }],
        ),
      remove: (id) => setItems((list) => list.filter((g) => g.id !== id)),
      clear: () => setItems([]),
      open,
      setOpen,
    }),
    [items, open],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
