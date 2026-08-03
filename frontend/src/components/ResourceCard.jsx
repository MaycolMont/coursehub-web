import { CATEGORIAS, MEDIOS, formatearFecha, abrirEnlace } from '../utils/format'
import { StarRating } from './StarRating'
import { useToast } from '../context/ToastContext'

export default function ResourceCard({ recurso, guardado = false, onToggleGuardar, onVer }) {
  const notificar = useToast()
  const cat = CATEGORIAS[recurso.categoria] || CATEGORIAS.nota
  const medio = MEDIOS[recurso.tipo_recurso] || MEDIOS.link

  const copiarEnlace = async () => {
    const url = recurso.materia_id
      ? `${window.location.origin}/materias/${recurso.materia_id}?recurso_id=${recurso.id}`
      : `${window.location.origin}/materias`
    try {
      await navigator.clipboard.writeText(url)
      notificar('¡Enlace copiado al portapapeles!', 'info')
    } catch {
      notificar('No se pudo copiar el enlace', 'danger')
    }
  }

  const abrirRecurso = () => {
    if (recurso.tipo_recurso === 'link' && recurso.storage_key) {
      abrirEnlace(recurso.storage_key)
    } else if (recurso.archivo_url) {
      abrirEnlace(recurso.archivo_url)
    } else {
      notificar('Este recurso no tiene archivo disponible', 'warning')
    }
  }

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 border-0">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span
              className={`badge ${cat.bg} bg-opacity-10 text-dark fw-semibold`}
              style={{ color: cat.color }}
            >
              <i className={`bi ${cat.icono} me-1`} />
              {cat.label}
            </span>
            <div className="d-flex align-items-center gap-2">
              <StarRating
                promedio={recurso.promedio_estrellas}
                count={recurso.valoraciones_count}
              />
              <button
                className="btn btn-sm p-0 border-0 bg-transparent"
                title={guardado ? 'Quitar de guardados' : 'Guardar recurso'}
                onClick={onToggleGuardar}
              >
                <i
                  className={`bi ${guardado ? 'bi-bookmark-fill' : 'bi-bookmark'} fs-5`}
                  style={{ color: guardado ? 'var(--color-primary)' : '#6c757d' }}
                />
              </button>
              <i
                className={`bi ${medio.icono} fs-5`}
                style={{ color: medio.color }}
                title={medio.label}
              />
            </div>
          </div>

          <h6 className="card-title fw-bold">{recurso.nombre_archivo}</h6>

          {recurso.profesor_nombre && (
            <p className="card-text text-muted small mb-1">
              <i className="bi bi-person-badge me-1" />
              {recurso.profesor_nombre}
            </p>
          )}

          <p className="card-text text-muted small mb-1">
            <i className="bi bi-person-circle me-1" />
            <span className="text-primary fw-semibold">
              {recurso.usuario_pseudonimo}
            </span>
            <span className="mx-1">·</span>
            {formatearFecha(recurso.fecha_subida)}
          </p>

          <div className="mt-auto d-flex gap-2 pt-3">
            <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={onVer}>
              <i className="bi bi-eye me-1" /> Ver Recurso
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={abrirRecurso}
              title="Abrir archivo o enlace"
            >
              <i className={`bi ${recurso.tipo_recurso === 'link' ? 'bi-box-arrow-up-right' : 'bi-download'}`} />
            </button>
            <button
              className="btn btn-sm btn-outline-info"
              onClick={copiarEnlace}
              title="Copiar enlace"
            >
              <i className="bi bi-share" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
