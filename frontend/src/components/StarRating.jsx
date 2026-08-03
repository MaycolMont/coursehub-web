// Estrellas de visualización (solo lectura) e interactivas para calificar.

export function StarRating({ promedio, count }) {
  const valor = promedio || 0
  return (
    <span className="d-inline-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`bi ${i <= Math.round(valor) ? 'bi-star-fill' : 'bi-star'} text-warning`}
        />
      ))}
      <small className="text-muted ms-1">
        {count != null ? `(${count})` : valor ? valor.toFixed(1) : 'Sin calificar'}
      </small>
    </span>
  )
}

export function StarRatingInput({ value, onChange }) {
  return (
    <span className="d-inline-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          onClick={() => onChange(i)}
          className={`bi ${i <= (value || 0) ? 'bi-star-fill' : 'bi-star'} text-warning fs-4 estrella-calificar`}
        />
      ))}
    </span>
  )
}
