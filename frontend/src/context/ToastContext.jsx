import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const ICONOS = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-triangle-fill',
  warning: 'bi-exclamation-circle-fill',
  info: 'bi-info-circle-fill',
}

const COLORES = {
  success: '#2ECC71',
  danger: '#E74C3C',
  warning: '#F1C40F',
  info: '#00A8E8',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const quitar = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notificar = useCallback((mensaje, tipo = 'info') => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, mensaje, tipo }])
    setTimeout(() => quitar(id), 4000)
  }, [quitar])

  return (
    <ToastContext.Provider value={notificar}>
      {children}
      <div
        className="position-fixed top-0 end-0 m-3 d-flex flex-column gap-2"
        style={{ zIndex: 9999, maxWidth: '420px' }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="toast-coursehub d-flex align-items-center gap-2 p-3 text-white rounded-3 shadow"
            style={{ backgroundColor: COLORES[t.tipo] || '#00A8E8' }}
          >
            <i className={`bi ${ICONOS[t.tipo] || 'bi-info-circle-fill'} fs-5`} />
            <span className="small flex-grow-1">{t.mensaje}</span>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar notificación"
              onClick={() => quitar(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
