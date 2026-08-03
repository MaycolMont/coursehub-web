import { useState } from 'react'
import Modal from './Modal'
import ReportModal from './ReportModal'
import { StarRating, StarRatingInput } from './StarRating'
import { CATEGORIAS, MEDIOS, formatearFecha, abrirEnlace } from '../utils/format'

export default function ResourceModal({
  recurso,
  show,
  onClose,
  tuValoracion,
  onCalificar,
}) {
  const [estrellas, setEstrellas] = useState(0)
  const [reportando, setReportando] = useState(false)

  if (!recurso) return null

  const cat = CATEGORIAS[recurso.categoria] || CATEGORIAS.nota
  const medio = MEDIOS[recurso.tipo_recurso] || MEDIOS.link
  const esLink = recurso.tipo_recurso === 'link'

  const puedeAbrir = esLink ? recurso.storage_key : recurso.archivo_url

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="lg"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-file-earmark-text" />
          {recurso.nombre_archivo}
        </span>
      }
      footer={
        <button className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      <div className="d-flex flex-wrap gap-2 mb-3">
        <span
          className="badge bg-primary bg-opacity-10 text-dark fw-semibold"
          style={{ color: cat.color }}
        >
          <i className={`bi ${cat.icono} me-1`} />
          {cat.label}
        </span>
        {recurso.materia_nombre && (
          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
            {recurso.materia_codigo} · {recurso.materia_nombre}
          </span>
        )}
        {recurso.profesor_nombre && (
          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold">
            <i className="bi bi-person-badge me-1" />
            {recurso.profesor_nombre}
          </span>
        )}
        <span className="badge" style={{ backgroundColor: medio.color, color: '#fff' }}>
          <i className={`bi ${medio.icono} me-1`} />
          {medio.label}
        </span>
        <span className="badge bg-dark bg-opacity-10 text-dark fw-semibold">
          <i className="bi bi-person-circle me-1" />
          {recurso.usuario_pseudonimo}
        </span>
      </div>

      {/* Panel de calificación */}
      <div className="card bg-light border-0 p-3 mb-3">
        <div className="row align-items-center g-3">
          <div className="col-md-7 text-center text-md-start">
            <span className="display-5 fw-bold text-warning">
              {recurso.promedio_estrellas ? recurso.promedio_estrellas.toFixed(1) : '—'}
            </span>
            <span className="text-muted ms-2">{recurso.valoraciones_count ?? 0} calificaciones</span>
            <div className="mt-1">
              <StarRating promedio={recurso.promedio_estrellas} count={null} />
            </div>
          </div>
          <div className="col-md-5 border-md-start ps-md-3">
            <p className="fw-bold text-muted small text-uppercase mb-2">
              {tuValoracion ? 'Tu calificación' : 'Calificar'}
            </p>
            <StarRatingInput
              value={estrellas || tuValoracion}
              onChange={(n) => {
                setEstrellas(n)
                if (onCalificar) onCalificar(n)
              }}
            />
            {tuValoracion ? (
              <p className="small text-success mt-2 mb-0">
                <i className="bi bi-check-circle me-1" />
                Calificaste {tuValoracion}/5
              </p>
            ) : (
              <p className="small text-muted mt-2 mb-0">Haz clic para calificar</p>
            )}
          </div>
        </div>
      </div>

      {puedeAbrir && (
        <div className="mb-3">
          <p className="fw-bold text-muted small text-uppercase mb-1">
            <i className="bi bi-link-45deg me-1" />
            Recurso de Acceso
          </p>
          <p className="mb-0 p-3 bg-light rounded-3">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => abrirEnlace(puedeAbrir)}
            >
              <i className={`bi ${esLink ? 'bi-box-arrow-up-right' : 'bi-download'} me-1`} />
              {esLink ? 'Abrir enlace' : 'Descargar archivo'}
            </button>
          </p>
        </div>
      )}

      {recurso.descripcion && (
        <div className="mb-3">
          <p className="fw-bold text-muted small text-uppercase mb-1">
            <i className="bi bi-tools me-1" />
            Descripción
          </p>
          <p className="mb-0 p-3 bg-light rounded-3">{recurso.descripcion}</p>
        </div>
      )}

      {recurso.consejo_estudio && (
        <div className="mb-3">
          <p className="fw-bold text-muted small text-uppercase mb-1">
            <i className="bi bi-lightbulb me-1" />
            Consejos para Futuros Estudiantes
          </p>
          <p className="mb-0 p-3 bg-light rounded-3 border-start border-4 border-success">
            {recurso.consejo_estudio}
          </p>
        </div>
      )}

      <p className="small text-muted mb-0">
        <i className="bi bi-person-circle me-1" />
        Publicado por {recurso.usuario_pseudonimo} · {formatearFecha(recurso.fecha_subida)}
      </p>

      <button
        type="button"
        className="btn btn-sm btn-outline-danger mt-3"
        onClick={() => setReportando(true)}
      >
        <i className="bi bi-flag me-1" />
        Reportar recurso
      </button>

      <ReportModal
        recurso={recurso}
        show={reportando}
        onClose={() => setReportando(false)}
      />
    </Modal>
  )
}
