import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Muestra el contenido si hay sesión; si no, un panel amigable para iniciar sesión
// sin redirigir ni perder el contexto de la página visitada.
export default function IfAuthenticated({
  children,
  titulo = 'Necesitas iniciar sesión',
  descripcion = 'Inicia sesión con tu cuenta institucional de la ESPOL para acceder a esta función.',
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2">Cargando...</p>
      </div>
    )
  }

  if (user) return children

  return (
    <div className="text-center py-5">
      <div
        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-3"
        style={{
          width: 72,
          height: 72,
          backgroundColor: 'rgba(0, 51, 102, 0.08)',
          color: 'var(--color-primary)',
        }}
      >
        <i className="bi bi-person-lock" style={{ fontSize: '2.2rem' }} />
      </div>
      <h3 className="fw-bold">{titulo}</h3>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: 420 }}>
        {descripcion}
      </p>
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        <Link to="/login" className="btn btn-primary rounded-pill px-4">
          <i className="bi bi-box-arrow-in-right me-1" />
          Iniciar Sesión
        </Link>
        <Link to="/explorar" className="btn btn-outline-primary rounded-pill px-4">
          <i className="bi bi-compass me-1" />
          Explorar sin cuenta
        </Link>
      </div>
    </div>
  )
}
