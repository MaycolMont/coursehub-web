import { useCallback, useEffect, useState } from 'react'
import { contenidoApi, interaccionApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import Modal, { ConfirmModal } from '../../components/Modal'
import { ESTADOS_RECURSO, formatearFecha } from '../../utils/format'
import { usePageTitle } from '../../utils/usePageTitle'

const ESTADOS_REPORTE = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  atendido: { label: 'Atendido', color: 'success' },
  desestimado: { label: 'Desestimado', color: 'secondary' },
}

export default function ModerarRecursos() {
  usePageTitle('Moderación')
  const notificar = useToast()
  const [tab, setTab] = useState('recursos')
  const [recursos, setRecursos] = useState([])
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [verDetalle, setVerDetalle] = useState(null)
  const [confirmar, setConfirmar] = useState(null)

  const cargarRecursos = useCallback(
    () =>
      contenidoApi
        .recursos({ solo_activos: 'false' })
        .then(setRecursos)
        .catch(() => notificar('Error al cargar recursos', 'danger')),
    [notificar],
  )

  const cargarReportes = useCallback(
    () =>
      interaccionApi
        .reportes()
        .then(setReportes)
        .catch(() => notificar('Error al cargar reportes', 'danger')),
    [notificar],
  )

  useEffect(() => {
    Promise.all([cargarRecursos(), cargarReportes()]).finally(() =>
      setCargando(false),
    )
  }, [cargarRecursos, cargarReportes])

  const toggleActivo = async () => {
    const r = confirmar
    try {
      await contenidoApi.toggleActivo(r.id)
      setRecursos((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, activo: !x.activo } : x)),
      )
      notificar(
        r.activo ? 'Recurso ocultado de la plataforma' : 'Recurso reactivado',
        'success',
      )
    } catch (err) {
      notificar(err.message || 'No se pudo actualizar el estado', 'danger')
    } finally {
      setConfirmar(null)
    }
  }

  const atenderReporte = async (r) => {
    try {
      await interaccionApi.atenderReporte(r.id)
      await cargarReportes()
      notificar('Reporte atendido', 'success')
    } catch (err) {
      notificar(err.message || 'No se pudo atender el reporte', 'danger')
    }
  }

  const desestimarReporte = async (r) => {
    try {
      await interaccionApi.desestimarReporte(r.id)
      await cargarReportes()
      notificar('Reporte desestimado', 'info')
    } catch (err) {
      notificar(err.message || 'No se pudo desestimar el reporte', 'danger')
    }
  }

  const filtrados = recursos.filter((r) => {
    const q = buscar.trim().toLowerCase()
    return (
      !q ||
      r.nombre_archivo.toLowerCase().includes(q) ||
      (r.usuario_pseudonimo || '').toLowerCase().includes(q)
    )
  })

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  return (
    <>
      <h2 className="fw-bold">
        <i className="bi bi-shield-check me-2" />
        Moderación
      </h2>
      <hr />

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'recursos' ? 'active' : ''}`}
            onClick={() => setTab('recursos')}
          >
            <i className="bi bi-file-earmark-text me-1" />
            Recursos ({recursos.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'reportes' ? 'active' : ''}`}
            onClick={() => setTab('reportes')}
          >
            <i className="bi bi-flag me-1" />
            Reportes ({reportes.length})
          </button>
        </li>
      </ul>

      {tab === 'recursos' && (
        <>
          <div className="row mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por título o autor..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
          </div>
          <div className="card border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Recurso</th>
                      <th>Autor</th>
                      <th>Materia</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((r) => {
                      const est = ESTADOS_RECURSO[r.activo ? 'activo' : 'inactivo']
                      return (
                        <tr key={r.id}>
                          <td>
                            <button
                              className="btn btn-link p-0 fw-semibold text-start"
                              onClick={() => setVerDetalle(r)}
                            >
                              {r.nombre_archivo}
                            </button>
                          </td>
                          <td className="small">{r.usuario_pseudonimo}</td>
                          <td className="small text-muted">{r.materia_codigo || '—'}</td>
                          <td className="small">{formatearFecha(r.fecha_subida)}</td>
                          <td>
                            <span
                              className={`badge bg-${est.color} bg-opacity-10 fw-semibold text-${est.color}`}
                            >
                              {est.label}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => setVerDetalle(r)}
                            >
                              <i className="bi bi-eye" />
                            </button>
                            <button
                              className={`btn btn-sm ${r.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              onClick={() => setConfirmar(r)}
                            >
                              <i className={`bi ${r.activo ? 'bi-eye-slash' : 'bi-eye'}`} />
                              {r.activo ? ' Ocultar' : ' Activar'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtrados.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                          No se encontraron recursos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'reportes' && (
        <div className="row g-3">
          {reportes.length === 0 ? (
            <div className="alert alert-info" role="alert">
              No hay reportes registrados.
            </div>
          ) : (
            reportes.map((r) => {
              const est = ESTADOS_REPORTE[r.estado] || ESTADOS_REPORTE.pendiente
              return (
                <div className="col-md-6" key={r.id}>
                  <div className="card border-0 h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-1">
                          <i className="bi bi-flag me-1 text-danger" />
                          {r.motivo}
                        </h6>
                        <span
                          className={`badge bg-${est.color} bg-opacity-10 fw-semibold text-${est.color}`}
                        >
                          {est.label}
                        </span>
                      </div>
                      <p className="small text-muted mb-2">
                        Sobre: <strong>{r.recurso_nombre}</strong>
                      </p>
                      <p className="small mb-2">{r.descripcion}</p>
                      <p className="small text-muted mb-0">
                        Reportado por {r.usuario_pseudonimo || 'Anónimo'} ·{' '}
                        {formatearFecha(r.fecha_reporte)}
                      </p>
                      {r.estado === 'pendiente' && (
                        <div className="d-flex gap-2 mt-3">
                          <button
                            className="btn btn-sm btn-outline-success flex-grow-1"
                            onClick={() => atenderReporte(r)}
                          >
                            <i className="bi bi-check-lg me-1" />
                            Atender
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary flex-grow-1"
                            onClick={() => desestimarReporte(r)}
                          >
                            <i className="bi bi-x-lg me-1" />
                            Desestimar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <Modal
        show={!!verDetalle}
        onClose={() => setVerDetalle(null)}
        title={
          <>
            <i className="bi bi-file-earmark-text me-1" />
            {verDetalle?.nombre_archivo}
          </>
        }
        footer={
          <button className="btn btn-secondary" onClick={() => setVerDetalle(null)}>
            Cerrar
          </button>
        }
      >
        {verDetalle && (
          <div>
            <p className="mb-1">
              <strong>Autor:</strong> {verDetalle.usuario_pseudonimo}
            </p>
            <p className="mb-1">
              <strong>Materia:</strong>{' '}
              {verDetalle.materia_codigo
                ? `${verDetalle.materia_codigo} · ${verDetalle.materia_nombre}`
                : '—'}
            </p>
            {verDetalle.profesor_nombre && (
              <p className="mb-1">
                <strong>Profesor:</strong> {verDetalle.profesor_nombre}
              </p>
            )}
            <p className="mb-1">
              <strong>Categoría:</strong> {verDetalle.categoria}
            </p>
            <p className="mb-1">
              <strong>Publicado:</strong> {formatearFecha(verDetalle.fecha_subida)}
            </p>
            {verDetalle.descripcion && (
              <p className="mb-1">
                <strong>Descripción:</strong> {verDetalle.descripcion}
              </p>
            )}
            {verDetalle.consejo_estudio && (
              <p className="mb-1">
                <strong>Consejo:</strong> {verDetalle.consejo_estudio}
              </p>
            )}
            <div className="mt-3">
              <span
                className="badge bg-primary bg-opacity-10 text-primary fw-semibold"
              >
                {verDetalle.valoraciones_count ?? 0} calificaciones
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        show={!!confirmar}
        titulo={confirmar?.activo ? 'Ocultar recurso' : 'Reactivar recurso'}
        mensaje={
          <>
            ¿Deseas {confirmar?.activo ? 'ocultar' : 'reactivar'} el recurso{' '}
            <strong>{confirmar?.nombre_archivo}</strong>?
          </>
        }
        onCancel={() => setConfirmar(null)}
        onConfirm={toggleActivo}
      />
    </>
  )
}
