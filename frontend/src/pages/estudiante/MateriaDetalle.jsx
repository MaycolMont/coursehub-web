import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { catalogoApi, contenidoApi, interaccionApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import ResourceCard from '../../components/ResourceCard'
import ResourceModal from '../../components/ResourceModal'
import Placeholder from '../../components/Placeholder'
import { CATEGORIAS } from '../../utils/format'
import { usePageTitle } from '../../utils/usePageTitle'

export default function MateriaDetalle() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const notificar = useToast()
  usePageTitle(materia ? `${materia.nombre} · ${materia.codigo}` : 'Materia')

  const [materia, setMateria] = useState(null)
  const [recursos, setRecursos] = useState([])
  const [guardados, setGuardados] = useState([])
  const [misValoraciones, setMisValoraciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('nota')
  const [buscar, setBuscar] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    let activo = true
    const promises = [
      catalogoApi.materias().then((ms) => ms.find((m) => m.id === Number(id))),
      contenidoApi.recursos({ materia_id: id }),
      user ? interaccionApi.misGuardados() : Promise.resolve([]),
      user ? interaccionApi.misValoraciones() : Promise.resolve([]),
    ]
    Promise.all(promises)
      .then(([mat, rec, guard, vals]) => {
        if (!activo) return
        setMateria(mat || null)
        setRecursos(rec)
        setGuardados(guard)
        setMisValoraciones(vals)
        const recursoId = searchParams.get('recurso_id')
        if (recursoId) {
          const r = rec.find((x) => x.id === Number(recursoId))
          if (r) setModal(r)
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [id, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const guardadoIds = useMemo(() => new Set(guardados.map((g) => g.recurso)), [guardados])
  const valoracionIds = useMemo(
    () => new Map(misValoraciones.map((v) => [v.recurso, v])),
    [misValoraciones],
  )

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase()
    return recursos.filter(
      (r) =>
        r.activo !== false &&
        r.categoria === tab &&
        (!q ||
          r.nombre_archivo.toLowerCase().includes(q) ||
          (r.profesor_nombre || '').toLowerCase().includes(q)),
    )
  }, [recursos, tab, buscar])

  const actualizarRecursoLocal = useCallback(
    (recursoId, cambios) => {
      setRecursos((prev) =>
        prev.map((r) => (r.id === recursoId ? { ...r, ...cambios } : r)),
      )
    },
    [],
  )

  const toggleGuardar = useCallback(
    async (recurso) => {
      if (!user) {
        notificar('Debes iniciar sesión para guardar recursos', 'warning')
        return
      }
      try {
        if (guardadoIds.has(recurso.id)) {
          const g = guardados.find((x) => x.recurso === recurso.id)
          await interaccionApi.quitarGuardado(g.id)
          setGuardados((prev) => prev.filter((x) => x.id !== g.id))
          notificar('Recurso eliminado de tus marcadores', 'info')
        } else {
          await interaccionApi.guardar(recurso.id)
          const guardadosActualizados = await interaccionApi.misGuardados()
          setGuardados(guardadosActualizados)
          notificar('Recurso guardado en tus marcadores', 'success')
        }
      } catch (err) {
        notificar(err.message || 'Error al actualizar guardados', 'danger')
      }
    },
    [user, guardadoIds, guardados, notificar],
  )

  const calificar = useCallback(
    async (estrellas) => {
      if (!user) {
        notificar('Debes iniciar sesión para calificar recursos', 'warning')
        return
      }
      try {
        const existente = valoracionIds.get(modal.id)
        if (existente) {
          await interaccionApi.actualizarValoracion(existente.id, estrellas)
          setMisValoraciones((prev) =>
            prev.map((v) => (v.id === existente.id ? { ...v, estrellas } : v)),
          )
        } else {
          await interaccionApi.valorar(modal.id, estrellas)
          const vals = await interaccionApi.misValoraciones()
          setMisValoraciones(vals)
        }
        const detalle = await contenidoApi.recurso(modal.id)
        actualizarRecursoLocal(modal.id, {
          promedio_estrellas: detalle.promedio_estrellas,
          valoraciones_count: detalle.valoraciones_count,
        })
        setModal((m) => (m ? { ...m, promedio_estrellas: detalle.promedio_estrellas, valoraciones_count: detalle.valoraciones_count } : m))
        if (estrellas >= 4) {
          notificar('¡Gracias por tu calificación! +10 puntos para el autor', 'success')
        } else {
          notificar('¡Gracias por tu calificación!', 'success')
        }
      } catch (err) {
        notificar(err.message || 'Error al calificar', 'danger')
      }
    },
    [user, valoracionIds, modal, notificar, actualizarRecursoLocal],
  )

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2">Cargando materia...</p>
      </div>
    )
  }

  if (!materia) {
    return (
      <div className="alert alert-danger" role="alert">
        Materia no encontrada.
      </div>
    )
  }

  const facultad = materia.carreras_list?.[0]?.facultad_nombre

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/explorar">Explorar</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {materia.nombre}
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <h3 className="fw-bold mb-0">
          {materia.nombre}{' '}
          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold fs-6">
            {materia.codigo}
          </span>
        </h3>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {facultad && (
          <span className="badge bg-info bg-opacity-10 text-info fw-semibold">
            <i className="bi bi-building me-1" />
            {facultad}
          </span>
        )}
        <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
          <i className="bi bi-file-earmark-text me-1" />
          {materia.recursos_count ?? recursos.length} recursos
        </span>
      </div>

      <ul className="nav nav-tabs mt-4">
        {Object.entries(CATEGORIAS).map(([clave, cat]) => (
          <li className="nav-item" key={clave}>
            <button
              className={`nav-link ${tab === clave ? 'active' : ''}`}
              onClick={() => setTab(clave)}
            >
              <i className={`bi ${cat.icono} me-1`} />
              {cat.label}s
            </button>
          </li>
        ))}
      </ul>

      <div className="row my-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título o profesor..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <Placeholder
          icono="bi-journal-text"
          mensaje={
            buscar
              ? `No se encontraron ${CATEGORIAS[tab].label.toLowerCase()}s que coincidan con "${buscar}"`
              : `No hay ${CATEGORIAS[tab].label.toLowerCase()}s aprobados para esta materia`
          }
        />
      ) : (
        <div className="row g-0">
          {filtrados.map((r) => (
            <ResourceCard
              key={r.id}
              recurso={r}
              guardado={guardadoIds.has(r.id)}
              onToggleGuardar={() => toggleGuardar(r)}
              onVer={() => setModal(r)}
            />
          ))}
        </div>
      )}

      <ResourceModal
        recurso={modal}
        show={!!modal}
        onClose={() => setModal(null)}
        tuValoracion={modal ? valoracionIds.get(modal.id)?.estrellas : null}
        onCalificar={calificar}
      />
    </>
  )
}
