import { useState } from 'react'
import Modal from './Modal'
import { interaccionApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const MOTIVOS = [
  'Contenido inapropiado',
  'Infringe derechos de autor',
  'Información incorrecta',
  'Archivo dañado o enlace roto',
  'Spam o duplicado',
  'Otro',
]

export default function ReportModal({ recurso, show, onClose, onReportado }) {
  const { user } = useAuth()
  const notificar = useToast()
  const [motivo, setMotivo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [anonimoNombre, setAnonimoNombre] = useState('')
  const [anonimoCorreo, setAnonimoCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setMotivo('')
    setDescripcion('')
    setAnonimoNombre('')
    setAnonimoCorreo('')
    onClose()
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!motivo) {
      notificar('Selecciona un motivo', 'warning')
      return
    }
    if (!descripcion.trim()) {
      notificar('Describe el problema', 'warning')
      return
    }
    setEnviando(true)
    try {
      const data = {
        recurso: recurso.id,
        motivo,
        descripcion: descripcion.trim(),
      }
      if (!user) {
        if (anonimoNombre.trim()) data.anonimo_nombre = anonimoNombre.trim()
        if (anonimoCorreo.trim()) data.anonimo_correo = anonimoCorreo.trim()
      }
      await interaccionApi.reportar(data)
      notificar('Reporte enviado. Gracias por colaborar.', 'success')
      if (onReportado) onReportado()
      cerrar()
    } catch (err) {
      notificar(err.message || 'No se pudo enviar el reporte', 'danger')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      show={show}
      onClose={cerrar}
      size="sm"
      title={
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-flag" />
          Reportar recurso
        </span>
      }
      footer={
        <>
          <button className="btn btn-secondary" onClick={cerrar}>
            Cancelar
          </button>
          <button className="btn btn-danger" form="form-reporte" type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : (
              <>
                <i className="bi bi-send me-1" /> Enviar reporte
              </>
            )}
          </button>
        </>
      }
    >
      {recurso && (
        <form id="form-reporte" onSubmit={enviar}>
          <p className="small text-muted mb-3">
            Estás reportando: <strong>{recurso.nombre_archivo}</strong>
          </p>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Motivo</label>
            <select
              className="form-select"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            >
              <option value="">Selecciona...</option>
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Descripción</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Cuéntanos qué problema tiene este recurso..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          {!user && (
            <div className="row g-2">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Tu nombre (opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Anónimo"
                  value={anonimoNombre}
                  onChange={(e) => setAnonimoNombre(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Correo (opcional)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="tu@correo.com"
                  value={anonimoCorreo}
                  onChange={(e) => setAnonimoCorreo(e.target.value)}
                />
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}
