import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { contenidoApi, interaccionApi, usuariosApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import ResourceCard from '../../components/ResourceCard'
import ResourceModal from '../../components/ResourceModal'
import Placeholder from '../../components/Placeholder'
import { formatearFecha, obtenerRango, calcularProgresoRango } from '../../utils/format'
import { usePageTitle } from '../../utils/usePageTitle'

export default function Perfil() {
  usePageTitle('Perfil')
  const { id } = useParams()
  const { user } = useAuth()
  const notificar = useToast()

  const [usuario, setUsuario] = useState(null)
  const [recursos, setRecursos] = useState([])
  const [rangos, setRangos] = useState([])
  const [guardados, setGuardados] = useState([])
  const [misValoraciones, setMisValoraciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(null)

  const idObjetivo = id || user?.id
  const esPropio = user && idObjetivo && Number(idObjetivo) === Number(user.id)

  useEffect(() => {
    if (!idObjetivo) {
      setCargando(false)
      return
    }
    let activo = true
    const promesas = [usuariosApi.rangos(), usuariosApi.perfil(idObjetivo)]
    if (esPropio) {
      promesas.push(
        contenidoApi.recursos({ usuario_id: idObjetivo }),
        Promise.all([interaccionApi.misGuardados(), interaccionApi.misValoraciones()]),
      )
    } else {
      promesas.push(contenidoApi.recursos({ usuario_id: idObjetivo }))
    }
    Promise.all(promesas)
      .then(([rangs, perfil, recs, ...resto]) => {
        if (!activo) return
        setRangos(rangs)
        setUsuario(perfil)
        setRecursos(recs)
        if (esPropio && resto.length) {
          const [misGuardados, misVals] = resto[0]
          setGuardados(misGuardados)
          setMisValoraciones(misVals)
        }
      })
      .catch(() => notificar('Error al cargar el perfil', 'danger'))
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [idObjetivo, esPropio, notificar])

  const valoracionMap = useMemo(
    () => new Map((misValoraciones || []).map((v) => [v.recurso, v.estrellas])),
    [misValoraciones],
  )
  const guardadoIds = useMemo(
    () => new Set((guardados || []).map((g) => g.recurso)),
    [guardados],
  )

  const rango = usuario ? obtenerRango(usuario.karma_acumulado, rangos) : null
  const progreso = usuario ? calcularProgresoRango(usuario.karma_acumulado, rangos) : null

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="alert alert-danger" role="alert">
        Usuario no encontrado.
      </div>
    )
  }

  const toggleGuardar = async (r) => {
    if (!user) {
      notificar('Debes iniciar sesión para guardar recursos', 'warning')
      return
    }
    try {
      const g = guardados.find((x) => x.recurso === r.id)
      if (g) {
        await interaccionApi.quitarGuardado(g.id)
        setGuardados((prev) => prev.filter((x) => x.id !== g.id))
        notificar('Recurso eliminado de tus marcadores', 'info')
      } else {
        await interaccionApi.guardar(r.id)
        const actualizados = await interaccionApi.misGuardados()
        setGuardados(actualizados)
        notificar('Recurso guardado en tus marcadores', 'success')
      }
    } catch (err) {
      notificar(err.message || 'No se pudo actualizar el marcador', 'danger')
    }
  }

  return (
    <>
      <div className="card border-0 mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center fs-3 fw-bold text-white"
              style={{
                width: 72,
                height: 72,
                backgroundColor: rango.color,
              }}
            >
              {usuario.pseudonimo.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow-1">
              <h3 className="fw-bold mb-0 d-flex align-items-center gap-2">
                {usuario.pseudonimo}
                <span
                  className="badge fs-6"
                  style={{ backgroundColor: `${rango.color}22`, color: rango.color }}
                >
                  <i className={`bi ${rango.icono} me-1`} />
                  {rango.nombre}
                </span>
              </h3>
              <p className="text-muted mb-1">
                <i className="bi bi-person-badge me-1" />
                {usuario.rol === 'administrador'
                  ? 'Administrador'
                  : usuario.rol === 'moderador'
                    ? 'Moderador'
                    : 'Estudiante'}
                {esPropio && <span className="mx-2">·</span>}
                {esPropio && (
                  <span>
                    <i className="bi bi-envelope me-1" />
                    {user.correo_institucional}
                  </span>
                )}
              </p>
              <p className="text-muted mb-0">
                <i className="bi bi-calendar3 me-1" />
                Miembro desde {formatearFecha(usuario.fecha_registro)}
              </p>
            </div>
            <div className="text-center px-3 py-2 rounded-3 bg-light">
              <div className="display-5 fw-bold text-primary">
                {usuario.karma_acumulado}
              </div>
              <div className="text-muted small">puntos de karma</div>
            </div>
          </div>

          {progreso && progreso.siguiente && (
            <div className="mt-3">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Progreso al siguiente rango</span>
                <span>{progreso.progreso}%</span>
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${progreso.progreso}%`, backgroundColor: rango.color }}
                />
              </div>
              <div className="small text-muted mt-1">
                Siguiente rango: <strong>{progreso.siguiente}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <h4 className="fw-bold">
        <i className="bi bi-folder2-open me-2" />
        Recursos publicados ({recursos.length})
      </h4>
      <hr />
      {recursos.length === 0 ? (
        <Placeholder
          icono="bi-folder-plus"
          mensaje={
            esPropio
              ? 'Aún no has publicado recursos. Comparte el primero desde el botón "Compartir".'
              : 'Este usuario aún no publica recursos.'
          }
        />
      ) : (
        <div className="row g-0">
          {recursos.map((r) => (
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

      <div className="mt-4">
        <Link to="/explorar" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-1" />
          Volver a Explorar
        </Link>
      </div>

      <ResourceModal
        recurso={modal}
        show={!!modal}
        onClose={() => setModal(null)}
        tuValoracion={modal ? valoracionMap.get(modal.id) : null}
      />
    </>
  )
}
