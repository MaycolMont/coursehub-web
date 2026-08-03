import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'

// Layout público: navbar + contenido + footer (landing, login, legales).
export function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// Layout de aplicación interna con sidebar (estudiante y admin).
export function SidebarLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="layout-main p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

// Protege rutas que requieren sesión y/o rol administrador.
export function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (admin && user.rol !== 'administrador') {
    return <Navigate to="/explorar" replace />
  }

  return children
}
