# CourseHub

Plataforma colaborativa para compartir apuntes, material de estudio y recursos entre estudiantes de ESPOL. Este repositorio contiene el **backend Django + DRF** (el frontend React+Vite vendrá aparte).

## Requisitos

- Python 3.11+
- Sin servicios externos: usa SQLite y almacenamiento local de archivos (`media/`)

## Puesta en marcha

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux / macOS:**
```bash
./setup.sh
```

El script crea un entorno virtual (`.venv`), instala dependencias, aplica migraciones y siembra datos de ejemplo (8 facultades, 2 carreras, 57 materias y un administrador).

Alternativa manual:
```bash
python -m venv .venv
.venv\Scripts\activate        # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

## Credenciales iniciales

| Campo    | Valor               |
| -------- | ------------------- |
| Email    | `admin@espol.edu.ec` |
| Password | `AdminEspol2026!`    |

Se pueden cambiar antes de sembrar creando un `.env` (usa `.env.example` como plantilla, con variables `SEED_ADMIN_*`).

## Accesos

| Recurso | URL |
| ------- | --- |
| Admin Django | http://127.0.0.1:8000/admin/ |
| API raíz | http://127.0.0.1:8000/api/ |
| Docs Swagger | http://127.0.0.1:8000/api/docs/ |
| Esquema OpenAPI | http://127.0.0.1:8000/api/schema/ |

## API (resumen)

**Auth** (`/api/auth/`)
- `POST register/` — crea cuenta (correo `@espol.edu.ec` obligatorio)
- `POST login/` — devuelve `access` y `refresh` (JWT Bearer)
- `POST refresh/`, `POST logout/`, `GET me/`, `POST change-password/`

**Catálogo** (`/api/`)
- `facultades/`, `carreras/`, `materias/`, `materias/catalogo/`, `profesores/`

**Contenido** (`/api/`)
- `colecciones/` — colecciones por materia y profesor
- `recursos/` — subida de PDF/ZIP (multipart, máx 40MB, 5 archivos y 1 ZIP por colección) o enlaces; `GET recursos/{id}/descargar/`

**Interacción** (`/api/`)
- `valoraciones/` (1–5 estrellas, una por usuario y recurso)
- `guardados/`, `reportes/` (+ `atender/`, `desestimar/` para moderadores)

Los endpoints se documentan en Swagger (`/api/docs/`).
