import { useEffect, useState } from 'react'
import { catalogoApi } from '../../api/endpoints'
import { useToast } from '../../context/ToastContext'
import Modal, { ConfirmModal } from '../../components/Modal'
import { usePageTitle } from '../../utils/usePageTitle'

const VACIA = { codigo: '', nombre: '', carreras: [], activo: true }

export default function GestionarMaterias() {
  usePageTitle('Gestionar Materias')
  const notificar = useToast()
  const [materias, setMaterias] = useState([])
  const [carreras, setCarreras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(VACIA)
  const [guardando, setGuardando] = useState(false)
  const [eliminar, setEliminar] = useState(null)

  const cargar = () =>
    Promise.all([catalogoApi.materiasCrud(), catalogoApi.carreras()]).then(
      ([m, c]) => {
        setMaterias(m)
        setCarreras(c)
      },
    )

  useEffect(() => {
    cargar()
      .catch(() => notificar('Error al cargar las materias', 'danger'))
      .finally(() => setCargando(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const abrirNueva = () => {
    setEditandoId(null)
    setForm(VACIA)
    setModalAbierto(true)
  }

  const abrirEditar = (m) => {
    setEditandoId(m.id)
    setForm({
      codigo: m.codigo,
      nombre: m.nombre,
      carreras: m.carreras || [],
      activo: m.activo,
    })
    setModalAbierto(true)
  }

  const toggleCarrera = (id) => {
    setForm((f) => ({
      ...f,
      carreras: f.carreras.includes(id)
        ? f.carreras.filter((c) => c !== id)
        : [...f.carreras, id],
    }))
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.codigo.trim() || !form.nombre.trim()) {
      notificar('Completa el código y el nombre', 'warning')
      return
    }
    setGuardando(true)
    try {
      const data = {
        codigo: form.codigo.trim().toUpperCase(),
        nombre: form.nombre.trim(),
        carreras: form.carreras,
        activo: form.activo,
      }
      if (editandoId) {
        await catalogoApi.actualizarMateria(editandoId, data)
        notificar('Materia actualizada correctamente', 'success')
      } else {
        await catalogoApi.crearMateria(data)
        notificar('Materia creada correctamente', 'success')
      }
      setModalAbierto(false)
      await cargar()
    } catch (err) {
      notificar(err.message || 'No se pudo guardar la materia', 'danger')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminar = async () => {
    try {
      await catalogoApi.eliminarMateria(eliminar.id)
      setMaterias((prev) => prev.filter((m) => m.id !== eliminar.id))
      notificar('Materia eliminada', 'info')
    } catch (err) {
      notificar(err.message || 'No se pudo eliminar: tiene recursos asociados', 'danger')
    } finally {
      setEliminar(null)
    }
  }

  const filtradas = materias.filter((m) => {
    const q = buscar.trim().toLowerCase()
    return (
      !q ||
      m.codigo.toLowerCase().includes(q) ||
      m.nombre.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-journal-bookmark me-2" />
          Gestionar Materias
        </h2>
        <button className="btn btn-primary" onClick={abrirNueva}>
          <i className="bi bi-plus-lg me-1" />
          Nueva materia
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por código o nombre..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="card border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Carreras</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                          {m.codigo}
                        </span>
                      </td>
                      <td className="fw-semibold">{m.nombre}</td>
                      <td className="small text-muted">{m.carreras?.length ?? 0} carrera(s)</td>
                      <td>
                        <span
                          className={`badge bg-opacity-10 fw-semibold ${m.activo ? 'bg-success' : 'bg-danger'}`}
                          style={{ color: m.activo ? '#2ECC71' : '#E74C3C' }}
                        >
                          {m.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => abrirEditar(m)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setEliminar(m)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtradas.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No se encontraron materias.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={
          editandoId ? (
            <>
              <i className="bi bi-pencil-square me-1" /> Editar materia
            </>
          ) : (
            <>
              <i className="bi bi-plus-lg me-1" /> Nueva materia
            </>
          )
        }
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" form="form-materia" type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="form-materia" onSubmit={guardar}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Código</label>
              <input
                type="text"
                className="form-control"
                placeholder="FISG1024"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              />
            </div>
            <div className="col-md-8">
              <label className="form-label fw-semibold">Nombre</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la materia"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">Carreras</label>
            <div className="border rounded-3 p-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {carreras.map((c) => (
                <div className="form-check" key={c.id}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`carrera-${c.id}`}
                    checked={form.carreras.includes(c.id)}
                    onChange={() => toggleCarrera(c.id)}
                  />
                  <label className="form-check-label" htmlFor={`carrera-${c.id}`}>
                    {c.nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-check form-switch mt-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="materia-activa"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="materia-activa">
              Materia activa
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        show={!!eliminar}
        titulo="Eliminar materia"
        mensaje={
          <>
            ¿Seguro que deseas eliminar <strong>{eliminar?.codigo} · {eliminar?.nombre}</strong>?
            <br />
            <small className="text-muted">
              Esta acción no se puede deshacer. Si tiene recursos asociados, no se podrá eliminar.
            </small>
          </>
        }
        onCancel={() => setEliminar(null)}
        onConfirm={confirmarEliminar}
      />
    </>
  )
}
