import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AppLayout, SidebarLayout, RequireAuth } from './components/Layouts'
import IfAuthenticated from './components/IfAuthenticated'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Terminos from './pages/Terminos'
import Privacidad from './pages/Privacidad'
import NotFound from './pages/NotFound'

import Explorar from './pages/estudiante/Explorar'
import MateriaDetalle from './pages/estudiante/MateriaDetalle'
import Compartir from './pages/estudiante/Compartir'
import Guardados from './pages/estudiante/Guardados'
import Perfil from './pages/estudiante/Perfil'
import MuroFama from './pages/estudiante/MuroFama'

import Dashboard from './pages/admin/Dashboard'
import GestionarMaterias from './pages/admin/GestionarMaterias'
import ModerarRecursos from './pages/admin/ModerarRecursos'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/terminos" element={<Terminos />} />
                <Route path="/privacidad" element={<Privacidad />} />
              </Route>

              <Route element={<SidebarLayout />}>
                {/* Público: exploración sin necesidad de cuenta */}
                <Route path="/explorar" element={<Explorar />} />
                <Route path="/materias/:id" element={<MateriaDetalle />} />
                <Route path="/muro-fama" element={<MuroFama />} />
                <Route path="/perfil/:id" element={<Perfil />} />

                {/* Requiere sesión (mostrará panel de inicio de sesión) */}
                <Route
                  path="/guardados"
                  element={
                    <IfAuthenticated>
                      <Guardados />
                    </IfAuthenticated>
                  }
                />
                <Route
                  path="/compartir"
                  element={
                    <IfAuthenticated>
                      <Compartir />
                    </IfAuthenticated>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <IfAuthenticated>
                      <Perfil />
                    </IfAuthenticated>
                  }
                />
              </Route>

              <Route element={<SidebarLayout />}>
                <Route
                  path="/admin"
                  element={
                    <RequireAuth admin>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/materias"
                  element={
                    <RequireAuth admin>
                      <GestionarMaterias />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin/moderar"
                  element={
                    <RequireAuth admin>
                      <ModerarRecursos />
                    </RequireAuth>
                  }
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
