import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="text-white py-4 mt-auto footer-coursehub">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-mortarboard-fill fs-4" />
          <span>
            <strong>CourseHub</strong> © {new Date().getFullYear()} — Proyecto
            Académico ESPOL
          </span>
        </div>
        <div className="d-flex gap-3">
          <Link
            to="/terminos"
            className="text-white-50 text-decoration-none small"
          >
            Términos y Condiciones
          </Link>
          <Link
            to="/privacidad"
            className="text-white-50 text-decoration-none small"
          >
            Política de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  )
}
