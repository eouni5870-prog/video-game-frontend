import { useState } from 'react'

const STORAGE_KEY = 'vgc-auth'

function loadAuth() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Sessions saved before roles existed have no "role": ask to log in again
    if (saved?.token && saved.role && new Date(saved.expiresAt) > new Date()) return saved
  } catch {
    // ignore broken storage
  }
  return null
}

// Keeps the logged-in user ({ username, role, token, expiresAt }) and remembers it after a page refresh.
export function useAuth() {
  const [auth, setAuth] = useState(loadAuth)

  const signIn = (value) => {
    setAuth(value)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // ignore
    }
  }

  const signOut = () => {
    setAuth(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const isAdmin = auth?.role === 'Admin'

  return { auth, isAdmin, signIn, signOut }
}
