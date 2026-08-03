import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogoApi, contenidoApi, interaccionApi, usuariosApi } from '../../api/endpoints'
import { formatearFecha } from '../../utils/format'
import { usePageTitle } from '../../utils/usePageTitle'

export default function Dashboard() {
  usePageTitle('Panel de Administración')
  const [stats, setStats] = useState(null)
  const [recientes, setRecientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      catalogoApi.materias(),
      contenidoApi.recursos({ solo_activos: 'false' }),
      usuariosApi.usuarios(),
      interaccionApi.reportes(),
    ])
      .then(([materias, recursos, usuarios, reportes]) => {
        const pendientes = reportes.filter((r) => r.estado === 'pendiente')
        setStats({
          materias: materias.length,
          recursos: recursos.length,
          usuarios: usuarios.length,
          reportesPendientes: pendientes.length,
          valoraciones: recursos.reduce((acc, r) => acc + (r.valoraciones_count || 0), 0),
        })
        setRecientes(recursos.slice(0, 6))
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  const tarjetas = [
    { label: 'Materias', valor: stats?.materias ?? 0, icono: 'bi-journal-bookmark', color: '#003366' },
    { label: 'Recursos', valor: stats?.recursos ?? 0, icono: 'bi-file-earmark-text', color: '#00A8E8' },
    { label: 'Usuarios', valor: stats?.usuarios ?? 0, icono: 'bi-people', color: '#2ECC71' },
    { label: 'Calificaciones', valor: stats?.valoraciones ?? 0, icono: 'bi-star', color: '#F1C40F' },
  ]

  return (
    <>
      <h2 className="fw-bold">
        <i className="bi bi-speedometer2 me-2" />
        Panel de Administración
      </h2>
      <hr />

      <div className="row g-3 mb-4">
        {tarjetas.map((t) => (
          <div className="col-md-3 col-sm-6" key={t.label}>
            <div className="card border-0 h-100">
              <div className="card-body">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mb-2"
                  style={{ width: 44, height: 44, backgroundColor: `${t.color}22` }}
                >
                  <i className={`bi ${t.icono} fs-4`} style={{ color: t.color }} />
                </div>
                <div className="display-6 fw-bold">{t.valor}</div>
                <div className="text-muted">{t.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats?.reportesPendientes > 0 && (
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          Tienes {stats.reportesPendientes} reporte(s) pendiente(s) de revisión.
          <Link to="/admin/moderar" className="ms-auto fw-bold">
            Revisar ahora
          </Link>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 h-100">
            <div className="card-header bg-transparent fw-bold border-0 pt-3">
              <i className="bi bi-clock-history me-2" />
              Recursos recientes
            </div>
            <div className="card-body pt-0">
              <ul className="list-group list-group-flush">
                {recientes.map((r) => (
                  <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{r.nombre_archivo}</div>
                      <div className="small text-muted">
                        {r.materia_codigo} · {r.usuario_pseudonimo} · {formatearFecha(r.fecha_subida)}
                      </div>
                    </div>
                    <span
                      className={`badge ${r.activo ? 'bg-success' : 'bg-danger'} bg-opacity-10 fw-semibold`}
                      style={{ color: r.activo ? '#2ECC71' : '#E74C3C' }}
                    >
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0">
            <div className="card-header bg-transparent fw-bold border-0 pt-3">
              <i className="bi bi-pencil-square me-2" />
              Acciones rápidas
            </div>
            <div className="card-body">
              <Link to="/admin/materias" className="btn btn-outline-primary w-100 mb-2">
                <i className="bi bi-journal-plus me-1" />
                Gestionar materias
              </Link>
              <Link to="/admin/moderar" className="btn btn-outline-warning w-100 mb-2">
                <i className="bi bi-shield-check me-1" />
                Moderar recursos y reportes
              </Link>
              <Link to="/explorar" className="btn btn-outline-success w-100">
                <i className="bi bi-compass me-1" />
                Ver plataforma pública
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
