import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { obtenerRango } from '../utils/format'

export default function Navbar() {
  const { user, logout, esAdmin, rangos } = useAuth()
  const notificar = useToast()
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    notificar('Sesión cerrada correctamente', 'info')
    navigate('/explorar')
  }

  const rango = user ? obtenerRango(user.karma_acumulado, rangos) : null

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm navbar-coursehub sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <Link to="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <i className="bi bi-mortarboard-fill fs-4" />
          CourseHub
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <Link to="/explorar" className="nav-link text-light">
                <i className="bi bi-compass me-1" />
                Explorar
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/muro-fama" className="nav-link text-light">
                <i className="bi bi-trophy me-1" />
                Muro de la Fama
              </Link>
            </li>

            {user ? (
              <>
                {esAdmin && (
                  <li className="nav-item">
                    <Link
                      to="/admin"
                      className="btn btn-outline-light btn-sm rounded-pill px-3"
                    >
                      <i className="bi bi-speedometer2 me-1" /> Panel Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <span className="nav-link text-light d-flex align-items-center gap-2 mb-0">
                    {rango && (
                      <span
                        className="badge d-inline-flex align-items-center gap-1"
                        style={{
                          backgroundColor: `${rango.color}33`,
                          color: rango.color,
                        }}
                        title={`Rango: ${rango.nombre}`}
                      >
                        <i className={`bi ${rango.icono}`} />
                        {rango.nombre}
                      </span>
                    )}
                    <span
                      className="badge d-inline-flex align-items-center gap-1 bg-white text-dark"
                      title="Puntos de karma"
                    >
                      <i className="bi bi-star-fill text-warning" />
                      {user.karma_acumulado}
                    </span>
                    <Link
                      to="/perfil"
                      className="text-decoration-none d-inline-flex align-items-center gap-2"
                    >
                      <i className="bi bi-person-circle fs-4 text-light" />
                      <span className="fw-semibold text-light">
                        {user.pseudonimo}
                      </span>
                    </Link>
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm rounded-pill px-3"
                    onClick={cerrarSesion}
                  >
                    <i className="bi bi-box-arrow-right me-1" /> Salir
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link
                  to="/login"
                  className="btn btn-light text-primary btn-sm rounded-pill px-3 fw-semibold"
                >
                  <i className="bi bi-box-arrow-in-right me-1" /> Iniciar Sesión
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
