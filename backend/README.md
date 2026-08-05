# CourseHub - Backend API (Django + DRF)

API REST de CourseHub. Este directorio es el **backend** que se publica en **AlwaysData**.

## Requisitos

- Python 3.11+
- Sin servicios externos en desarrollo: usa SQLite y almacenamiento local (`media/`)
- Driver de base de datos según el hosting: `mysqlclient` (MySQL/MariaDB) o `psycopg2-binary` (PostgreSQL)

## Puesta en marcha

Ejecutar **dentro de este directorio**:

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Linux / macOS:**
```bash
./setup.sh
```

El script crea el entorno virtual (`.venv`), instala dependencias, aplica migraciones y siembra datos de ejemplo (8 facultades, 2 carreras, 57 materias y un administrador).

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

| Campo    | Valor                |
| -------- | -------------------- |
| Email    | `admin@espol.edu.ec` |
| Password | `AdminEspol2026!`    |

Se pueden cambiar antes de sembrar creando un `.env` (usa `.env.example` como plantilla, variables `SEED_ADMIN_*`).

## Accesos

| Recurso | URL |
| ------- | --- |
| Admin Django | http://127.0.0.1:8000/admin/ |
| API raíz | http://127.0.0.1:8000/api/ |
| Docs Swagger | http://127.0.0.1:8000/api/docs/ |
| Esquema OpenAPI | http://127.0.0.1:8000/api/schema/ |

## Base de datos en producción (MySQL - AlwaysData)

El hosting AlwaysData usa **MySQL**. Configura el `.env` del servidor con:

```
DB_ENGINE=django.db.backends.mysql
DB_NAME=tuusuario_coursehub
DB_USER=tuusuario
DB_PASSWORD=tu_password
DB_HOST=mysql-tuusuario.alwaysdata.net
DB_PORT=3306
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=tuusuario.alwaysdata.net
CORS_ALLOW_ALL_ORIGINS=True
```

Luego ejecuta migraciones y el seed:

```bash
python manage.py migrate
python manage.py seed_data
python manage.py collectstatic
```

## API (resumen)

**Auth** (`/api/auth/`)
- `POST register/` — crea cuenta (correo `@espol.edu.ec` obligatorio)
- `POST login/` — devuelve `access` y `refresh` (JWT Bearer)
- `POST refresh/`, `POST logout/`, `GET me/`, `POST change-password/`

**Catálogo** (`/api/`) — solo lectura pública
- `facultades/`, `carreras/`, `materias/`, `materias/catalogo/`, `profesores/`

**Contenido** (`/api/`)
- `colecciones/` — colecciones por materia y profesor
- `recursos/` — subida de PDF/ZIP (multipart, máx 40MB) o enlaces; `GET recursos/{id}/descargar/`

**Interacción** (`/api/`)
- `valoraciones/` (1–5 estrellas), `guardados/`, `reportes/` (+ `atender/`, `desestimar/`)

Los endpoints se documentan en Swagger (`/api/docs/`).
