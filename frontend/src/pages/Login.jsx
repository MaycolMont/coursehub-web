import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../utils/usePageTitle'

export default function Login() {
  usePageTitle('Iniciar Sesión')
  const { login, register, user } = useAuth()
  const notificar = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || (user?.rol === 'administrador' ? '/admin' : '/explorar')

  const [esRegistro, setEsRegistro] = useState(false)
  const [correo, setCorreo] = useState('')
  const [pseudonimo, setPseudonimo] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const normalizarCorreo = (valor) => {
    let v = valor.trim()
    if (v && !v.includes('@')) v = `${v}@espol.edu.ec`
    return v.toLowerCase()
  }

  const manejarLogin = async (e) => {
    e.preventDefault()
    setError('')
    const correoCompleto = normalizarCorreo(correo)
    if (!correoCompleto.endsWith('@espol.edu.ec')) {
      setError('Debe utilizar su correo institucional de la ESPOL.')
      return
    }
    if (!password) {
      setError('La contraseña es obligatoria.')
      return
    }
    setCargando(true)
    try {
      const usuario = await login(correoCompleto, password)
      notificar(`¡Bienvenido, ${usuario.pseudonimo}!`, 'success')
      navigate(usuario.rol === 'administrador' ? '/admin' : from, { replace: true })
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
    } finally {
      setCargando(false)
    }
  }

  const manejarRegistro = async (e) => {
    e.preventDefault()
    setError('')
    if (!pseudonimo.trim()) {
      setError('El nombre de usuario es obligatorio.')
      return
    }
    const correoCompleto = normalizarCorreo(correo)
    if (!correoCompleto.endsWith('@espol.edu.ec')) {
      setError('Debe utilizar su correo institucional de la ESPOL.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setCargando(true)
    try {
      await register(correoCompleto, pseudonimo.trim(), password)
      notificar('¡Cuenta creada exitosamente!', 'success')
      navigate('/explorar', { replace: true })
    } catch (err) {
      const msg = err.message || 'Error de conexión. Intenta de nuevo.'
      setError(/ya est[aá] registrado|unique/i.test(msg) ? 'Ese correo ya está registrado. Intenta iniciar sesión.' : msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, #002244 100%)',
      }}
    >
      <div className="w-100" style={{ maxWidth: 440 }}>
        <Link to="/" className="text-white-50 small text-decoration-none">
          <i className="bi bi-arrow-left me-1" /> Volver
        </Link>
        <div className="text-center mb-4">
          <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '3rem' }} />
          <h2 className="text-white fw-bold mb-0">CourseHub</h2>
          <p className="text-white-50 mb-0">Plataforma Comunitaria ESPOL</p>
        </div>

        <div className="card border-0 shadow-lg">
          <div className="card-body p-4">
            <h5 className="card-title text-center fw-bold mb-3">
              {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h5>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">{error}</div>
            )}

            {!esRegistro ? (
              <form onSubmit={manejarLogin} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-envelope me-1" /> Correo Institucional
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="usuario"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                    <span className="input-group-text">@espol.edu.ec</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-lock me-1" /> Contraseña
                  </label>
                  <div className="input-group">
                    <input
                      type={verPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary border"
                      onClick={() => setVerPassword((v) => !v)}
                    >
                      <i className={`bi ${verPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-semibold py-2"
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2" />
                      Ingresar
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={manejarRegistro} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-person me-1" /> Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: anmgarci"
                    value={pseudonimo}
                    onChange={(e) => setPseudonimo(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-envelope me-1" /> Correo Institucional
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="usuario"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                    <span className="input-group-text">@espol.edu.ec</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-lock me-1" /> Contraseña
                  </label>
                  <input
                    type={verPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-success w-100 fw-semibold py-2"
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2" />
                      Crear Cuenta
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center mt-3">
              <small className="text-muted">
                {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                <button
                  className="btn btn-link btn-sm fw-semibold p-0 align-baseline"
                  onClick={() => {
                    setEsRegistro((v) => !v)
                    setError('')
                  }}
                >
                  {esRegistro ? 'Inicia sesión' : 'Regístrate aquí'}
                </button>
              </small>
            </div>

            {!esRegistro && (
              <div className="alert alert-light border mt-3 mb-0 py-3">
                <div className="small fw-semibold mb-2">
                  <i className="bi bi-info-circle me-1 text-primary" />
                  Cuentas de demostración
                </div>
                <div className="small text-muted mb-1">
                  Estudiante: <code>anmgarci</code> · contraseña <code>123456</code>
                </div>
                <div className="small text-muted">
                  Administrador: <code>admin@espol.edu.ec</code> · contraseña{' '}
                  <code>AdminEspol2026!</code>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white-50 mt-3 small mb-0">
          © 2026 CourseHub — Proyecto Académico ESPOL
        </p>
      </div>
    </div>
  )
}
