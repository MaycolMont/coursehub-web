export default function Placeholder({ mensaje, icono = 'bi-journal' }) {
  return (
    <div className="text-center py-5 text-muted">
      <i className={`bi ${icono} display-4 d-block mb-3`} />
      <p className="mb-0">{mensaje}</p>
    </div>
  )
}
