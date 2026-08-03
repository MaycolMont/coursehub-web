import { useEffect, useMemo, useState } from 'react'
import { interaccionApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import ResourceCard from '../../components/ResourceCard'
import ResourceModal from '../../components/ResourceModal'
import Placeholder from '../../components/Placeholder'
import { usePageTitle } from '../../utils/usePageTitle'

export default function Guardados() {
  usePageTitle('Mis Guardados')
  const { user } = useAuth()
  const notificar = useToast()
  const [guardados, setGuardados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(null)
  const [misValoraciones, setMisValoraciones] = useState([])

  useEffect(() => {
    if (!user) {
      setCargando(false)
      return
    }
    Promise.all([interaccionApi.misGuardados(), interaccionApi.misValoraciones()])
      .then(([g, v]) => {
        setGuardados(g)
        setMisValoraciones(v)
      })
      .catch(() => notificar('Error al cargar tus marcadores', 'danger'))
      .finally(() => setCargando(false))
  }, [user, notificar])

  const valoracionMap = useMemo(
    () => new Map(misValoraciones.map((v) => [v.recurso, v.estrellas])),
    [misValoraciones],
  )

  const quitar = async (id) => {
    try {
      await interaccionApi.quitarGuardado(id)
      setGuardados((prev) => prev.filter((g) => g.id !== id))
      notificar('Recurso eliminado de tus marcadores', 'info')
    } catch (err) {
      notificar(err.message || 'No se pudo quitar el marcador', 'danger')
    }
  }

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
        <i className="bi bi-bookmarks me-2" />
        Mis Guardados
      </h2>
      <hr />
      {guardados.length === 0 ? (
        <Placeholder
          icono="bi-bookmark"
          mensaje="Aún no has guardado recursos. Usa el icono de marcador en cualquier recurso."
        />
      ) : (
        <div className="row g-0">
          {guardados.map((g) => (
            <ResourceCard
              key={g.id}
              recurso={g.recurso_detalle}
              guardado
              onToggleGuardar={() => quitar(g.id)}
              onVer={() => setModal(g.recurso_detalle)}
            />
          ))}
        </div>
      )}

      <ResourceModal
        recurso={modal}
        show={!!modal}
        onClose={() => setModal(null)}
        tuValoracion={modal ? valoracionMap.get(modal.id) : null}
      />
    </>
  )
}
