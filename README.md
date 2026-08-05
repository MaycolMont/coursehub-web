# CourseHub

Plataforma colaborativa para compartir apuntes, material de estudio y recursos entre estudiantes de ESPOL. Este repositorio está organizado para las actividades de despliegue:

| Carpeta | Contenido | Publicación |
| ------- | --------- | ----------- |
| `backend/` | API REST Django + DRF | **AlwaysData** |
| `frontend-web/` | Página estática independiente (HTML/CSS/JS) que consume la API | **InfinityFree** |
| `frontend/` | App React+Vite del 2.º parcial (referencia) | — |

## Estructura

```
backend-coursehub/
├── backend/          # API Django + DRF (se sube a AlwaysData)
│   ├── coursehub/    # configuración del proyecto
│   ├── apps/         # accounts, institution, content, interaction
│   ├── manage.py
│   ├── requirements.txt
│   └── setup.ps1 / setup.sh
├── frontend-web/     # página independiente (se sube a InfinityFree)
│   ├── index.html
│   ├── css/style.css
│   └── js/ (config.js, api.js, app.js)
├── frontend/         # React (2.º parcial, referencia)
└── GUIA_DEPLOY.md    # pasos para publicar en AlwaysData e InfinityFree
```

## Inicio rápido (backend)

```powershell
cd backend
.\setup.ps1        # crea .venv, instala dependencias, migra y siembra datos
.\.venv\Scripts\python manage.py runserver
```

- Admin: http://127.0.0.1:8000/admin/
- API:   http://127.0.0.1:8000/api/
- Docs:  http://127.0.0.1:8000/api/docs/

## Página web independiente (frontend-web)

Abre `frontend-web/index.html` o súrvela con `python -m http.server 5522 --directory frontend-web`. Antes de usarla, ajusta `frontend-web/js/config.js` para apuntar a la URL pública del backend (en producción: la URL de AlwaysData).

## Despliegue

Consulta [GUIA_DEPLOY.md](GUIA_DEPLOY.md) para publicar el backend en **AlwaysData** (con MySQL) y la página en **InfinityFree**.
