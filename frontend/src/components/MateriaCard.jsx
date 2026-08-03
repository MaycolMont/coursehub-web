import { Link } from 'react-router-dom'

export default function MateriaCard({ materia }) {
  const facultad = materia.carreras_list?.[0]?.facultad_nombre

  return (
    <div className="col" data-facultad={facultad || ''}>
      <Link
        to={`/materias/${materia.id}`}
        className="text-decoration-none"
      >
        <div className="card h-100 border-0 cursor-pointer">
          <div className="card-body d-flex flex-column">
            <div className="d-flex flex-wrap gap-2 mb-2">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                {materia.codigo}
              </span>
              <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
                {materia.recursos_count ?? 0} recursos
              </span>
            </div>
            <h6 className="card-title fw-bold text-dark">{materia.nombre}</h6>
            {facultad && (
              <p className="card-text text-muted small mt-auto mb-0">
                <i className="bi bi-building me-1" />
                {facultad}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
