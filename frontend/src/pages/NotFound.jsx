import { Link } from 'react-router-dom'
import { usePageTitle } from '../utils/usePageTitle'

export default function NotFound() {
  usePageTitle('Página no encontrada')
  return (
    <div className="container py-5">
      <div className="text-center py-5">
        <div className="display-1 fw-bold text-primary">404</div>
        <h3 className="fw-bold">Página no encontrada</h3>
        <p className="text-muted mx-auto mb-4" style={{ maxWidth: 420 }}>
          La página que buscas no existe o fue movida. Explora el catálogo de
          materias para seguir estudiando.
        </p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Link to="/explorar" className="btn btn-primary rounded-pill px-4">
            <i className="bi bi-compass me-1" />
            Explorar Materias
          </Link>
          <Link to="/" className="btn btn-outline-primary rounded-pill px-4">
            <i className="bi bi-house me-1" />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
