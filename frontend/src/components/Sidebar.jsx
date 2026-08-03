import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { obtenerRango } from '../utils/format'

const LINKS_ADMIN = [
  { to: '/admin', icono: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/admin/materias', icono: 'bi-book', label: 'Gestionar Materias' },
  { to: '/admin/moderar', icono: 'bi-shield-check', label: 'Moderar Recursos' },
]

const LINKS_ESTUDIANTE = [
  { to: '/explorar', icono: 'bi-compass', label: 'Explorar Materias' },
  { to: '/muro-fama', icono: 'bi-trophy', label: 'Muro de la Fama' },
  { to: '/guardados', icono: 'bi-bookmark', label: 'Mis Guardados' },
  { to: '/compartir', icono: 'bi-upload', label: 'Compartir Material' },
  { to: '/perfil', icono: 'bi-person-circle', label: 'Mi Perfil' },
]

const LINKS_PUBLICO = [
  { to: '/explorar', icono: 'bi-compass', label: 'Explorar Materias' },
  { to: '/muro-fama', icono: 'bi-trophy', label: 'Muro de la Fama' },
]

export default function Sidebar() {
  const { esAdmin, user, rangos } = useAuth()
  const { pathname } = useLocation()

  const links = esAdmin ? LINKS_ADMIN : user ? LINKS_ESTUDIANTE : LINKS_PUBLICO
  const titulo = esAdmin ? 'Panel Admin' : user ? 'Menú Estudiante' : 'Navegación'
  const rango = user ? obtenerRango(user.karma_acumulado, rangos) : null

  return (
    <aside className="layout-sidebar bg-white shadow-sm">
      {user && (
        <div className="p-3 border-bottom d-none d-lg-block">
          <Link to="/perfil" className="d-flex align-items-center gap-3 text-decoration-none">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
              style={{ width: 44, height: 44, backgroundColor: rango.color }}
            >
              {user.pseudonimo.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="fw-bold text-dark text-truncate">{user.pseudonimo}</div>
              <div className="small text-muted">
                <i className={`bi ${rango.icono} me-1`} style={{ color: rango.color }} />
                {rango.nombre} · {user.karma_acumulado} pts
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="p-2 p-lg-3 border-lg-bottom">
        <small className="text-muted text-uppercase fw-bold d-none d-lg-block">
          {titulo}
        </small>
        <ul className="nav flex-lg-column gap-1 flex-row flex-nowrap overflow-auto sidebar-horizontal">
          {links.map((link) => (
            <li className="nav-item" key={link.to}>
              <Link
                to={link.to}
                className={`sidebar-link ${pathname === link.to ? 'active' : ''}`}
              >
                <i className={`bi ${link.icono}`} />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {!user && (
          <li className="nav-item d-none d-lg-block">
            <small className="text-muted px-3 pt-2 d-block">
              Inicia sesión para acceder a más funciones
            </small>
          </li>
        )}
      </div>
    </aside>
  )
}
