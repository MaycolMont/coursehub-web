// =============================================================
//  CourseHub Web - Pagina independiente
//  Consume los endpoints publicos de la API CourseHub y muestra
//  el catalogo institucional y los recursos compartidos.
// =============================================================

const state = {
  facultades: [],
  carreras: [],
  materias: [],
  profesores: [],
  recursos: [],
  filtroFacultad: null,
  filtroCarrera: null,
  busquedaMateria: '',
  busquedaRecurso: '',
};

const CATEGORIAS = {
  nota: 'Nota',
  prueba: 'Prueba',
  proyecto: 'Proyecto',
};

const TIPOS = {
  pdf: 'PDF',
  zip: 'ZIP',
  link: 'Enlace',
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function crearTarjeta(icono, titulo, subtitulo, enlaces = []) {
  const card = document.createElement('article');
  card.className = 'tarjeta';
  const body = document.createElement('div');
  body.className = 'tarjeta-body';
  body.innerHTML = `
    <div class="tarjeta-icono">${icono}</div>
    <h3 class="tarjeta-titulo">${escapeHtml(titulo)}</h3>
    ${subtitulo ? `<p class="tarjeta-sub">${escapeHtml(subtitulo)}</p>` : ''}
  `;
  card.appendChild(body);
  if (enlaces.length) {
    const actions = document.createElement('div');
    actions.className = 'tarjeta-acciones';
    enlaces.forEach(({ label, href }) => {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'btn btn-sm';
      a.textContent = label;
      actions.appendChild(a);
    });
    card.appendChild(actions);
  }
  return card;
}

function renderEstrellas(promedio) {
  if (promedio === null || promedio === undefined) return '<span class="sin-estrellas">Sin valoraciones</span>';
  const full = Math.round(promedio);
  let stars = '';
  for (let i = 1; i <= 5; i += 1) {
    stars += `<span class="star ${i <= full ? 'star-on' : ''}">&#9733;</span>`;
  }
  return `<span class="estrellas">${stars}</span> <span class="promedio">${promedio.toFixed(1)}</span>`;
}

function urlRecurso(recurso) {
  if (recurso.archivo_url) return recurso.archivo_url;
  if (recurso.storage_key && recurso.storage_key.startsWith('http')) return recurso.storage_key;
  return '#';
}

/* ---------------- Estadisticas ---------------- */
function renderStats() {
  const stats = [
    { icono: '&#127979;', valor: state.facultades.length, etiqueta: 'Facultades' },
    { icono: '&#127891;', valor: state.carreras.length, etiqueta: 'Carreras' },
    { icono: '&#128218;', valor: state.materias.length, etiqueta: 'Materias' },
    { icono: '&#127937;', valor: state.recursos.length, etiqueta: 'Recursos' },
    { icono: '&#128188;', valor: state.profesores.length, etiqueta: 'Profesores' },
  ];
  const grid = $('#stats-grid');
  grid.innerHTML = '';
  stats.forEach(({ icono, valor, etiqueta }) => {
    const div = document.createElement('div');
    div.className = 'stat';
    div.innerHTML = `
      <div class="stat-icono">${icono}</div>
      <div class="stat-valor">${valor}</div>
      <div class="stat-etiqueta">${etiqueta}</div>
    `;
    grid.appendChild(div);
  });
}

/* ---------------- Facultades ---------------- */
function renderFacultades() {
  const grid = $('#facultades-grid');
  grid.innerHTML = '';
  state.facultades.forEach((facultad) => {
    const card = document.createElement('article');
    card.className = 'tarjeta facultad-card';
    const activa = state.filtroFacultad === String(facultad.id);
    if (activa) card.classList.add('seleccionada');
    card.innerHTML = `
      <div class="tarjeta-body">
        <div class="tarjeta-icono">&#127979;</div>
        <h3 class="tarjeta-titulo">${escapeHtml(facultad.nombre)}</h3>
        <p class="tarjeta-sub">Facultad de la ESPOL</p>
      </div>
    `;
    card.addEventListener('click', () => toggleFiltroFacultad(facultad.id));
    grid.appendChild(card);
  });
}

function toggleFiltroFacultad(id) {
  if (state.filtroFacultad === String(id)) {
    state.filtroFacultad = null;
  } else {
    state.filtroFacultad = String(id);
    state.filtroCarrera = null;
  }
  renderFacultades();
  renderCarreras();
  renderMaterias();
}

/* ---------------- Carreras ---------------- */
function renderCarreras() {
  const container = $('#carreras-lista');
  container.innerHTML = '';
  const carreras = state.filtroFacultad
    ? state.carreras.filter((c) => String(c.facultad_id) === state.filtroFacultad)
    : state.carreras;

  if (!state.filtroFacultad) {
    const msg = document.createElement('p');
    msg.className = 'vacio';
    msg.textContent = 'Selecciona una facultad para ver sus carreras.';
    container.appendChild(msg);
    return;
  }
  if (!carreras.length) {
    const msg = document.createElement('p');
    msg.className = 'vacio';
    msg.textContent = 'Esta facultad no tiene carreras registradas.';
    container.appendChild(msg);
    return;
  }
  carreras.forEach((carrera) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    if (state.filtroCarrera === String(carrera.id)) chip.classList.add('chip-on');
    chip.textContent = carrera.nombre;
    chip.title = carrera.facultad_nombre || '';
    chip.addEventListener('click', () => {
      state.filtroCarrera = state.filtroCarrera === String(carrera.id) ? null : String(carrera.id);
      renderCarreras();
      renderMaterias();
    });
    container.appendChild(chip);
  });
}

/* ---------------- Materias ---------------- */
function renderMaterias() {
  const grid = $('#materias-grid');
  grid.innerHTML = '';
  const texto = state.busquedaMateria.trim().toLowerCase();
  let materias = state.materias;

  const facultadSeleccionada = state.facultades.find(
    (f) => String(f.id) === state.filtroFacultad,
  );
  if (facultadSeleccionada) {
    materias = materias.filter((m) =>
      (m.carreras_list || []).some(
        (c) => c.facultad_nombre === facultadSeleccionada.nombre,
      ),
    );
  }
  if (state.filtroCarrera) {
    materias = materias.filter((m) =>
      (m.carreras_list || []).some((c) => String(c.id) === state.filtroCarrera),
    );
  }

  if (texto) {
    materias = materias.filter(
      (m) =>
        m.nombre.toLowerCase().includes(texto) ||
        (m.codigo || '').toLowerCase().includes(texto),
    );
  }

  if (!materias.length) {
    const msg = document.createElement('p');
    msg.className = 'vacio';
    msg.textContent = 'No se encontraron materias con los filtros actuales.';
    grid.appendChild(msg);
    return;
  }
  materias.forEach((materia) => {
    const card = document.createElement('article');
    card.className = 'tarjeta';
    const carreras = (materia.carreras_list || [])
      .map((c) => escapeHtml(c.nombre))
      .join(', ');
    card.innerHTML = `
      <div class="tarjeta-body">
        <div class="tarjeta-icono">&#128218;</div>
        <div class="tarjeta-codigo">${escapeHtml(materia.codigo)}</div>
        <h3 class="tarjeta-titulo">${escapeHtml(materia.nombre)}</h3>
        <p class="tarjeta-sub">${carreras || 'Sin carreras asociadas'}</p>
      </div>
      <div class="tarjeta-pie">
        <span class="badge">${materia.recursos_count ?? 0} recursos</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------------- Profesores ---------------- */
function renderProfesores() {
  const grid = $('#profesores-grid');
  grid.innerHTML = '';
  if (!state.profesores.length) {
    const msg = document.createElement('p');
    msg.className = 'vacio';
    msg.textContent = 'No hay profesores registrados.';
    grid.appendChild(msg);
    return;
  }
  state.profesores.forEach((profesor) => {
    const card = document.createElement('article');
    card.className = 'tarjeta';
    card.innerHTML = `
      <div class="tarjeta-body">
        <div class="tarjeta-icono">&#128188;</div>
        <h3 class="tarjeta-titulo">${escapeHtml(profesor.nombre)}</h3>
        <p class="tarjeta-sub">${profesor.activo ? 'Profesor activo' : 'Inactivo'}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------------- Recursos ---------------- */
function renderRecursos() {
  const grid = $('#recursos-grid');
  grid.innerHTML = '';
  const texto = state.busquedaRecurso.trim().toLowerCase();
  let recursos = state.recursos;

  if (texto) {
    recursos = recursos.filter((r) =>
      [r.nombre_archivo, r.descripcion, r.materia_nombre, r.profesor_nombre]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(texto)),
    );
  }

  if (!recursos.length) {
    const msg = document.createElement('p');
    msg.className = 'vacio';
    msg.textContent = 'No se encontraron recursos publicados.';
    grid.appendChild(msg);
    return;
  }
  recursos.forEach((recurso) => {
    const card = document.createElement('article');
    card.className = 'tarjeta recurso-card';
    const tipo = TIPOS[recurso.tipo_recurso] || recurso.tipo_recurso;
    const categoria = CATEGORIAS[recurso.categoria] || recurso.categoria;
    const href = urlRecurso(recurso);
    const esLink = href === '#';
    card.innerHTML = `
      <div class="tarjeta-body">
        <div class="recurso-cabecera">
          <span class="badge badge-tipo">${tipo}</span>
          <span class="badge">${escapeHtml(categoria)}</span>
        </div>
        <h3 class="tarjeta-titulo">${escapeHtml(recurso.nombre_archivo)}</h3>
        <p class="tarjeta-sub">
          ${escapeHtml(recurso.materia_codigo || '')}
          ${recurso.materia_nombre ? `&middot; ${escapeHtml(recurso.materia_nombre)}` : ''}
          ${recurso.profesor_nombre ? `&middot; ${escapeHtml(recurso.profesor_nombre)}` : ''}
        </p>
        ${recurso.descripcion ? `<p class="recurso-desc">${escapeHtml(recurso.descripcion)}</p>` : ''}
        <p class="recurso-meta">Subido por ${escapeHtml(recurso.usuario_pseudonimo || 'Anónimo')} &middot; ${escapeHtml(String(recurso.fecha_subida || '').slice(0, 10))}</p>
        <div class="recurso-valoracion">
          ${renderEstrellas(recurso.promedio_estrellas)}
          <span class="count">(${recurso.valoraciones_count ?? 0})</span>
        </div>
      </div>
      <div class="tarjeta-acciones">
        <a class="btn btn-sm ${esLink ? 'btn-disabled' : 'btn-primary'}" href="${href}"
           ${esLink ? 'aria-disabled="true"' : 'target="_blank" rel="noopener noreferrer"'}>${esLink ? 'No disponible' : 'Abrir recurso'}</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------------- Estado de la API ---------------- */
function renderEstadoApi(ok, detalle) {
  const pill = $('#api-status');
  pill.className = `api-status ${ok ? 'ok' : 'error'}`;
  pill.innerHTML = ok
    ? `&#9989; API disponible`
    : `&#10060; API sin conexi&oacute;n${detalle ? `: ${escapeHtml(detalle)}` : ''}`;
}

/* ---------------- Carga inicial ---------------- */
async function cargarDatos() {
  const heroSub = $('#hero-sub');
  const btnRefresh = $('#btn-refresh');
  btnRefresh.disabled = true;
  renderEstadoApi(false, 'conectando...');
  heroSub.textContent = 'Conectando con la API...';

  try {
    const [facultades, carreras, materias, profesores, recursos] = await Promise.all([
      api.facultades(),
      api.carreras(),
      api.materias(),
      api.profesores(),
      api.recursos(),
    ]);

    state.facultades = facultades;
    state.carreras = carreras;
    state.materias = materias;
    state.profesores = profesores;
    state.recursos = recursos;

    const disponible = await api.ping();
    renderEstadoApi(disponible);
    heroSub.textContent = 'Explora la comunidad académica de la ESPOL: facultades, carreras, materias y recursos compartidos.';
    renderStats();
    renderFacultades();
    renderCarreras();
    renderMaterias();
    renderProfesores();
    renderRecursos();
  } catch (error) {
    renderEstadoApi(false, error.message);
    heroSub.textContent = 'No se pudo conectar con la API. Verifica que el backend esté publicado y que js/config.js tenga la URL correcta.';
  } finally {
    btnRefresh.disabled = false;
  }
}

/* ---------------- Inicializacion ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  $('#busqueda-materia').addEventListener('input', (event) => {
    state.busquedaMateria = event.target.value;
    renderMaterias();
  });
  $('#busqueda-recurso').addEventListener('input', (event) => {
    state.busquedaRecurso = event.target.value;
    renderRecursos();
  });
  $('#btn-refresh').addEventListener('click', cargarDatos);
  $('#anio-actual').textContent = new Date().getFullYear();
  cargarDatos();
});
