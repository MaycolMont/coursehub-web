import { useEffect, useMemo, useState } from 'react'
import { catalogoApi } from '../../api/endpoints'
import MateriaCard from '../../components/MateriaCard'
import Placeholder from '../../components/Placeholder'
import { usePageTitle } from '../../utils/usePageTitle'

export default function Explorar() {
  usePageTitle('Explorar Materias')
  const [materias, setMaterias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [facultad, setFacultad] = useState('')

  useEffect(() => {
    catalogoApi
      .materias()
      .then((data) => {
        setMaterias(data.filter((m) => m.activo !== false))
      })
      .finally(() => setCargando(false))
  }, [])

  const facultades = useMemo(() => {
    const set = new Set()
    materias.forEach((m) => {
      m.carreras_list?.forEach((c) => set.add(c.facultad_nombre))
    })
    return [...set].sort()
  }, [materias])

  const filtradas = useMemo(() => {
    const q = buscar.trim().toLowerCase()
    return materias.filter((m) => {
      const enFacultad = !facultad || m.carreras_list?.some((c) => c.facultad_nombre === facultad)
      const enBusqueda =
        !q ||
        m.nombre.toLowerCase().includes(q) ||
        m.codigo.toLowerCase().includes(q) ||
        m.carreras_list?.some((c) => c.facultad_nombre.toLowerCase().includes(q))
      return enFacultad && enBusqueda
    })
  }, [materias, buscar, facultad])

  return (
    <>
      <h2 className="fw-bold">
        <i className="bi bi-compass me-2" />
        Explorar Materias
      </h2>
      <hr />

      <div className="row mb-3 g-2">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, código o facultad..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={facultad}
            onChange={(e) => setFacultad(e.target.value)}
          >
            <option value="">Todas las facultades</option>
            {facultades.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : filtradas.length === 0 ? (
        <Placeholder
          icono="bi-journal"
          mensaje={
            buscar || facultad
              ? 'No se encontraron materias que coincidan con la búsqueda'
              : 'No hay materias activas disponibles en este momento'
          }
        />
      ) : (
        <div className="row g-4">{filtradas.map((m) => <MateriaCard key={m.id} materia={m} />)}</div>
      )}
    </>
  )
}
