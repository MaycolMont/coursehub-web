import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogoApi, contenidoApi, usuariosApi } from '../api/endpoints'
import { usePageTitle } from '../utils/usePageTitle'

const FEATURES = [
  {
    icono: 'bi-compass',
    titulo: 'Explora Materias',
    texto:
      'Navega por el catálogo de materias de la ESPOL, filtra por facultad y encuentra el contenido que buscas.',
  },
  {
    icono: 'bi-upload',
    titulo: 'Comparte Recursos',
    texto:
      'Sube tus apuntes, guías, exámenes resueltos y proyectos para ayudar a toda la comunidad.',
  },
  {
    icono: 'bi-star',
    titulo: 'Califica y Ayuda',
    texto:
      'Valora los recursos que te sirvieron y ayuda a otros a elegir el mejor material de estudio.',
  },
  {
    icono: 'bi-trophy',
    titulo: 'Rangos y Logros',
    texto:
      'Gana karma, sube de rango y compite en el muro de la fama a medida que contribuyes.',
  },
]

const PASOS = [
  {
    numero: 1,
    icono: 'bi-search',
    titulo: 'Explora',
    texto:
      'Busca la materia que te interesa en nuestro catálogo. Filtra por facultad o usa el buscador.',
  },
  {
    numero: 2,
    icono: 'bi-folder2-open',
    titulo: 'Encuentra',
    texto:
      'Revisa los recursos compartidos por otros estudiantes: notas, pruebas y proyectos.',
  },
  {
    numero: 3,
    icono: 'bi-send',
    titulo: 'Aporta',
    texto:
      'Comparte tu propio material, califica los recursos útiles y gana karma para subir de rango.',
  },
]

export default function Landing() {
  usePageTitle('Inicio')
  const [stats, setStats] = useState({ materias: '50+', recursos: '200+', usuarios: '500+', profesores: '30+' })

  useEffect(() => {
    Promise.all([
      catalogoApi.materias(),
      contenidoApi.recursos(),
      usuariosApi.usuarios(),
      catalogoApi.profesores(),
    ])
      .then(([materias, recursos, usuarios, profesores]) => {
        setStats({
          materias: `${materias.length}+`,
          recursos: `${recursos.length}+`,
          usuarios: `${usuarios.length}+`,
          profesores: `${profesores.length}+`,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hero-section px-3">
        <div className="container position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span
                className="badge fw-semibold px-3 py-2 mb-3 rounded-pill"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <i className="bi bi-mortarboard-fill me-1" /> Comunidad académica
                ESPOL
              </span>
              <h1
                className="display-3 fw-bold text-white mb-3"
                style={{ lineHeight: 1.15 }}
              >
                El conocimiento se <span style={{ color: '#F1C40F' }}>comparte</span>
              </h1>
              <p
                className="lead mb-4"
                style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 540 }}
              >
                CourseHub es la plataforma colaborativa donde estudiantes de la
                ESPOL comparten apuntes, resuelven dudas y construyen juntos una
                mejor experiencia académica.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/explorar"
                  className="btn btn-lg btn-warning fw-bold rounded-pill px-4 py-2 shadow"
                >
                  <i className="bi bi-compass me-2" />
                  Explorar Materias
                </Link>
                <a
                  href="#features"
                  className="btn btn-lg btn-outline-light rounded-pill px-4 py-2"
                >
                  <i className="bi bi-info-circle me-2" />
                  Conocer más
                </a>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-center">
              <i
                className="bi bi-people-fill text-white"
                style={{ fontSize: '14rem', opacity: 0.85 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">¿Por qué CourseHub?</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 560 }}>
              Todo lo que necesitas para potenciar tu vida académica en un solo
              lugar.
            </p>
          </div>
          <div className="row g-4">
            {FEATURES.map((f) => (
              <div className="col-md-6 col-lg-3" key={f.titulo}>
                <div className="card border-0 h-100 shadow-sm rounded-4 p-3">
                  <div
                    className="feature-icon d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      fontSize: '1.6rem',
                      background: 'rgba(0,51,102,0.08)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <i className={`bi ${f.icono}`} />
                  </div>
                  <h5 className="fw-bold text-center">{f.titulo}</h5>
                  <p className="text-muted small mb-0 text-center">{f.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Cómo funciona</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 560 }}>
              En tres pasos simples puedes empezar a compartir y encontrar
              material de estudio.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {PASOS.map((p) => (
              <div className="col-md-4" key={p.numero}>
                <div className="card border-0 h-100 shadow-sm rounded-4 p-4 text-center">
                  <i
                    className={`bi ${p.icono} d-block mx-auto mb-3 text-primary`}
                    style={{ fontSize: '4rem' }}
                  />
                  <div className="step-number mx-auto mb-3">{p.numero}</div>
                  <h5 className="fw-bold">{p.titulo}</h5>
                  <p className="text-muted small mb-0">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5">
        <div className="container py-3">
          <div className="row g-3 justify-content-center text-center">
            {[
              { valor: stats.materias, label: 'Materias' },
              { valor: stats.recursos, label: 'Recursos' },
              { valor: stats.usuarios, label: 'Estudiantes' },
              { valor: stats.profesores, label: 'Profesores' },
            ].map((s) => (
              <div className="col-6 col-md-3" key={s.label}>
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <h3
                    className="fw-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {s.valor}
                  </h3>
                  <p className="text-muted small mb-0">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-5">
        <div className="container text-center py-4">
          <h2 className="fw-bold text-white mb-3">
            Únete a la comunidad de estudio
          </h2>
          <p
            className="mx-auto mb-4"
            style={{ maxWidth: 520, color: 'rgba(255,255,255,0.8)' }}
          >
            Ya sea que quieras compartir tus apuntes o encontrar material para
            tus materias, en CourseHub hay un espacio para ti.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link
              to="/explorar"
              className="btn btn-lg btn-light fw-bold rounded-pill px-4 py-2 shadow-sm"
            >
              <i className="bi bi-compass me-2" />
              Explorar ahora
            </Link>
            <Link
              to="/login"
              className="btn btn-lg btn-outline-light rounded-pill px-4 py-2"
            >
              <i className="bi bi-person-plus me-2" />
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
