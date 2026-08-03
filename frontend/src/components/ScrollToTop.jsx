import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de ruta, vuelve al inicio de la página.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
