import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usuariosApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { obtenerRango, formatearFecha } from '../../utils/format'
import { usePageTitle } from '../../utils/usePageTitle'

const PODIO_ORDEN = [1, 0, 2]
const PODIO_ALTURA = [96, 120, 80]
const PODIO_MEDALLA = ['bi-award-fill', 'bi-trophy-fill', 'bi-award-fill']
const PODIO_COLOR = ['text-secondary', 'text-warning', 'text-warning']

export default function MuroFama() {
  usePageTitle('Muro de la Fama')
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [rangos, setRangos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([usuariosApi.usuarios(), usuariosApi.rangos()])
      .then(([u, r]) => {
        setUsuarios(u)
        setRangos(r)
      })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  const ranking = useMemo(
    () => [...usuarios].sort((a, b) => b.karma_acumulado - a.karma_acumulado),
    [usuarios],
  )
  const top3 = ranking.slice(0, 3)

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2">Cargando ranking...</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="fw-bold">
        <i className="bi bi-trophy me-2" />
        Muro de la Fama
      </h2>
      <p className="text-muted">
        Los estudiantes que más aportan a la comunidad académica.
      </p>
      <hr />

      {ranking.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Aún no hay participantes en el ranking.
        </div>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="d-flex align-items-end justify-content-center gap-3 mb-4 podium">
              {PODIO_ORDEN.map((idx) => {
                const u = top3[idx]
                if (!u) return null
                const rango = obtenerRango(u.karma_acumulado, rangos)
                const esYo = user && u.id === user.id
                return (
                  <Link
                    key={u.id}
                    to={`/perfil/${u.id}`}
                    className="text-center text-decoration-none podium-item"
                  >
                    <div
                      className={`${PODIO_MEDALLA[idx]} ${PODIO_COLOR[idx]} fs-2 mb-1`}
                    />
                    <div
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-2"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: rango.color,
                      }}
                    >
                      {u.pseudonimo.charAt(0).toUpperCase()}
                    </div>
                    <div className="fw-bold text-dark">{u.pseudonimo}</div>
                    {esYo && <span className="badge bg-primary">Tú</span>}
                    <div
                      className="fw-bold text-primary"
                      style={{ fontSize: '1.1rem' }}
                    >
                      {u.karma_acumulado} <small className="text-muted">pts</small>
                    </div>
                    <div
                      className="mx-auto rounded-top-2 w-100"
                      style={{
                        height: PODIO_ALTURA[idx],
                        background: 'linear-gradient(180deg, var(--color-secondary), var(--color-primary))',
                        opacity: idx === 1 ? 1 : 0.75,
                      }}
                    />
                  </Link>
                )
              })}
            </div>
          )}

          <div className="card border-0">
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {ranking.slice(3).map((u, i) => {
                  const rango = obtenerRango(u.karma_acumulado, rangos)
                  const esYo = user && u.id === user.id
                  return (
                    <li
                      key={u.id}
                      className={`list-group-item d-flex align-items-center gap-3 py-3 ${esYo ? 'bg-primary bg-opacity-10' : ''}`}
                    >
                      <div className="text-center" style={{ width: 44 }}>
                        <span className="fs-5 fw-bold text-muted">{i + 4}</span>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                        style={{ width: 44, height: 44, backgroundColor: rango.color }}
                      >
                        {u.pseudonimo.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1">
                        <Link
                          to={`/perfil/${u.id}`}
                          className="fw-bold text-decoration-none text-dark"
                        >
                          {u.pseudonimo}
                          {esYo && <span className="badge bg-primary ms-2">Tú</span>}
                        </Link>
                        <div className="small text-muted">
                          <span
                            className="badge me-2"
                            style={{
                              backgroundColor: `${rango.color}22`,
                              color: rango.color,
                            }}
                          >
                            <i className={`bi ${rango.icono} me-1`} />
                            {rango.nombre}
                          </span>
                          Miembro desde {formatearFecha(u.fecha_registro)}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold fs-5 text-primary">
                          {u.karma_acumulado}
                        </div>
                        <div className="small text-muted">pts</div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  )
}
