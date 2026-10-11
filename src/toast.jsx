import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(() => {})

// Small notifications in the corner: toast('Luigi ajouté') or toast('Erreur', 'error')
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, type }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{t.type === 'error' ? '✕' : '✓'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
