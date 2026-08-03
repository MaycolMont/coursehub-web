import { useEffect, useMemo, useState } from 'react'
import { catalogoApi, contenidoApi } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { CATEGORIAS } from '../../utils/format'
import { usePageTitle } from '../../utils/usePageTitle'

const MAX_MB = 40

export default function Compartir() {
  usePageTitle('Compartir Recurso')
  const { user } = useAuth()
  const notificar = useToast()

  const [materias, setMaterias] = useState([])
  const [profesores, setProfesores] = useState([])
  const [colecciones, setColecciones] = useState([])
  const [cargando, setCargando] = useState(true)

  const [materiaId, setMateriaId] = useState('')
  const [coleccionId, setColeccionId] = useState('')
  const [nuevaColeccion, setNuevaColeccion] = useState(false)
  const [tituloColeccion, setTituloColeccion] = useState('')
  const [profesorId, setProfesorId] = useState('')
  const [anioSemestre, setAnioSemestre] = useState('2026-1S')

  const [tipo, setTipo] = useState('archivo')
  const [categoria, setCategoria] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [enlace, setEnlace] = useState('')
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [consejo, setConsejo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)

  useEffect(() => {
    Promise.all([catalogoApi.materias(), catalogoApi.profesores()])
      .then(([mats, profs]) => {
        setMaterias(mats.filter((m) => m.activo !== false))
        setProfesores(profs)
      })
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (!materiaId) {
      setColecciones([])
      setColeccionId('')
      return
    }
    contenidoApi
      .colecciones({ materia_id: materiaId })
      .then((data) => {
        setColecciones(data)
        setNuevaColeccion(data.length === 0)
        setColeccionId(data.length ? String(data[0].id) : '')
      })
      .catch(() => notificar('Error al cargar las colecciones', 'danger'))
  }, [materiaId]) // eslint-disable-line react-hooks/exhaustive-deps

  const materiaSeleccionada = useMemo(
    () => materias.find((m) => m.id === Number(materiaId)),
    [materias, materiaId],
  )

  const validarArchivo = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'zip'].includes(ext)) {
      notificar('Solo se permiten archivos PDF o ZIP', 'danger')
      return false
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      notificar(`El archivo supera el límite de ${MAX_MB} MB`, 'danger')
      return false
    }
    return true
  }

  const crearColeccionNueva = async () => {
    if (!tituloColeccion.trim() || !profesorId) {
      notificar('Completa el título y el profesor de la nueva colección', 'warning')
      return null
    }
    try {
      const c = await contenidoApi.crearColeccion({
        titulo: tituloColeccion.trim(),
        materia: Number(materiaId),
        profesor: Number(profesorId),
        anio_semestre: anioSemestre,
      })
      setColecciones((prev) => [...prev, c])
      setColeccionId(String(c.id))
      setNuevaColeccion(false)
      return c
    } catch (err) {
      notificar(err.message || 'No se pudo crear la colección', 'danger')
      return null
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      notificar('Debes iniciar sesión para compartir recursos', 'warning')
      return
    }
    if (!categoria) {
      notificar('Selecciona la categoría del recurso', 'warning')
      return
    }

    let coleccionFinal = coleccionId
    if (nuevaColeccion) {
      const c = await crearColeccionNueva()
      if (!c) return
      coleccionFinal = String(c.id)
    }

    if (tipo === 'archivo') {
      if (!archivo || !validarArchivo(archivo)) return
      const fd = new FormData()
      fd.append('coleccion', coleccionFinal)
      fd.append('categoria', categoria)
      fd.append('tipo_recurso', 'pdf')
      fd.append('archivo', archivo)
      if (nombreArchivo.trim()) fd.append('nombre_archivo', nombreArchivo.trim())
      if (descripcion.trim()) fd.append('descripcion', descripcion.trim())
      if (consejo.trim()) fd.append('consejo_estudio', consejo.trim())
      await enviar(fd)
    } else {
      const url = enlace.trim()
      if (!url || !/^https?:\/\//.test(url)) {
        notificar('Ingresa una URL válida que comience con http:// o https://', 'warning')
        return
      }
      if (!nombreArchivo.trim()) {
        notificar('El título es obligatorio para un recurso tipo enlace', 'warning')
        return
      }
      const fd = new FormData()
      fd.append('coleccion', coleccionFinal)
      fd.append('categoria', categoria)
      fd.append('tipo_recurso', 'link')
      fd.append('storage_key', url)
      fd.append('nombre_archivo', nombreArchivo.trim())
      if (descripcion.trim()) fd.append('descripcion', descripcion.trim())
      if (consejo.trim()) fd.append('consejo_estudio', consejo.trim())
      await enviar(fd)
    }
  }

  const enviar = async (fd) => {
    setEnviando(true)
    try {
      await contenidoApi.crearRecurso(fd)
      notificar('¡Recurso compartido! +20 puntos de karma', 'success')
      setArchivo(null)
      setEnlace('')
      setNombreArchivo('')
      setDescripcion('')
      setConsejo('')
      setCategoria('')
    } catch (err) {
      notificar(err.message || 'No se pudo compartir el recurso', 'danger')
    } finally {
      setEnviando(false)
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
        <i className="bi bi-plus-square me-2" />
        Compartir Recurso
      </h2>
      <hr />

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <form onSubmit={onSubmit} className="card border-0">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Materia</label>
                <select
                  className="form-select"
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  required
                >
                  <option value="">Selecciona una materia...</option>
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.codigo} · {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {materiaId && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Colección</label>
                  {colecciones.length > 0 && !nuevaColeccion ? (
                    <>
                      <select
                        className="form-select"
                        value={coleccionId}
                        onChange={(e) => setColeccionId(e.target.value)}
                      >
                        {colecciones.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.titulo} — {c.profesor_nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 mt-1"
                        onClick={() => setNuevaColeccion(true)}
                      >
                        <i className="bi bi-plus-circle me-1" />
                        Crear nueva colección
                      </button>
                    </>
                  ) : (
                    <div className="border rounded-3 p-3 bg-light">
                      <p className="small text-muted mb-2">
                        Esta materia no tiene colecciones aún, crea la primera:
                      </p>
                      <div className="row g-2">
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Título (ej. Apuntes C1)"
                            value={tituloColeccion}
                            onChange={(e) => setTituloColeccion(e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={profesorId}
                            onChange={(e) => setProfesorId(e.target.value)}
                          >
                            <option value="">Profesor...</option>
                            {profesores.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            value={anioSemestre}
                            onChange={(e) => setAnioSemestre(e.target.value)}
                          />
                        </div>
                      </div>
                      {colecciones.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 mt-2"
                          onClick={() => setNuevaColeccion(false)}
                        >
                          <i className="bi bi-arrow-left me-1" />
                          Usar una colección existente
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Categoría</label>
                <div className="row g-2">
                  {Object.entries(CATEGORIAS).map(([clave, cat]) => (
                    <div className="col-4" key={clave}>
                      <input
                        type="radio"
                        className="btn-check"
                        name="categoria"
                        id={`cat-${clave}`}
                        value={clave}
                        checked={categoria === clave}
                        onChange={() => setCategoria(clave)}
                      />
                      <label className="btn btn-outline-primary w-100" htmlFor={`cat-${clave}`}>
                        <i className={`bi ${cat.icono} me-1`} />
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo de recurso</label>
                <div className="btn-group w-100">
                  <input
                    type="radio"
                    className="btn-check"
                    name="tipo"
                    id="tipo-archivo"
                    checked={tipo === 'archivo'}
                    onChange={() => setTipo('archivo')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="tipo-archivo">
                    <i className="bi bi-upload me-1" />
                    Subir archivo (PDF/ZIP)
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="tipo"
                    id="tipo-enlace"
                    checked={tipo === 'enlace'}
                    onChange={() => setTipo('enlace')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="tipo-enlace">
                    <i className="bi bi-link-45deg me-1" />
                    Compartir enlace
                  </label>
                </div>
              </div>

              {tipo === 'archivo' ? (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Archivo</label>
                  <label
                    className={`dropzone d-block p-4 text-center ${arrastrando ? 'dragging' : ''}`}
                    htmlFor="input-archivo"
                    onDragOver={(e) => {
                      e.preventDefault()
                      setArrastrando(true)
                    }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setArrastrando(false)
                      if (e.dataTransfer.files.length) {
                        setArchivo(e.dataTransfer.files[0])
                      }
                    }}
                  >
                    {archivo ? (
                      <>
                        <i className="bi bi-file-earmark-check fs-2 text-success d-block mb-2" />
                        <span className="fw-semibold text-success">{archivo.name}</span>
                        <span className="d-block small text-muted">
                          {(archivo.size / 1024 / 1024).toFixed(2)} MB · haz clic para cambiarlo
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-arrow-up fs-2 text-primary d-block mb-2" />
                        <span className="fw-semibold">
                          Arrastra tu archivo aquí o haz clic para elegir
                        </span>
                        <span className="d-block small text-muted mt-1">
                          Solo PDF o ZIP · máximo {MAX_MB} MB
                        </span>
                      </>
                    )}
                  </label>
                  <input
                    id="input-archivo"
                    type="file"
                    className="visually-hidden"
                    accept=".pdf,.zip"
                    onChange={(e) => setArchivo(e.target.files[0])}
                  />
                  <div className="form-text">
                    Solo PDF o ZIP · máximo {MAX_MB} MB · hasta 5 archivos por
                    colección.
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Enlace (URL)</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Título {tipo === 'archivo' ? '(opcional)' : ''}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    tipo === 'archivo'
                      ? 'Se usará el nombre del archivo si lo dejas vacío'
                      : 'Ej. Curso de Python - Cálculo'
                  }
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="¿De qué trata el recurso?"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-lightbulb me-1 text-warning" />
                  Consejo para futuros estudiantes
                </label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Un consejo para quien curse esta materia"
                  value={consejo}
                  onChange={(e) => setConsejo(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2" />
                    Publicar Recurso
                  </>
                )}
              </button>
              <p className="text-muted small text-center mt-2 mb-0">
                Al publicar ganas <strong>+20 puntos de karma</strong> y ayudas a tu comunidad.
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
