# CourseHub - Backend API (Django + DRF)

API REST de CourseHub. Se despliega en **Render** usando PostgreSQL y Supabase Storage.

## Requisitos

- Python 3.12+
- PostgreSQL (recomendado: Supabase Postgres)
- Supabase Storage (bucket `recursos_academicos`) para archivos PDF/ZIP

## Puesta en marcha (local)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

| Recurso | URL |
| ------- | --- |
| Admin Django | http://127.0.0.1:8000/admin/ |
| API raíz | http://127.0.0.1:8000/api/ |
| Docs Swagger | http://127.0.0.1:8000/api/docs/ |
| Esquema OpenAPI | http://127.0.0.1:8000/api/schema/ |

Por defecto usa SQLite y almacenamiento local (no requiere servicios externos en desarrollo).

## Credenciales iniciales (seed)

| Campo    | Valor                |
| -------- | -------------------- |
| Email    | `admin@espol.edu.ec` |
| Password | `AdminEspol2026!`    |

Se pueden cambiar creando un `.env` (usa `.env.example` como plantilla, variables `SEED_ADMIN_*`).

## Despliegue en Render

Render ejecuta el `render.yaml` que está en la raíz del repo. El servicio:

- **Runtime:** Python
- **WSGI server:** gunicorn
- **DB:** PostgreSQL (recomendado: Supabase Postgres, pooler transaccional)
- **Archivos:** Supabase Storage vía API S3 (bucket público)
- **Estáticos:** whitenoise (recogidos con `collectstatic`)
- **Arranque:** `migrate → collectstatic → gunicorn`

### Variables de entorno necesarias

| Variable | Descripción | Ejemplo |
| -------- | ----------- | ------- |
| `DJANGO_SECRET_KEY` | Clave secreta de Django (genera una propia) | `render la genera automáticamente` |
| `DJANGO_DEBUG` | `False` en producción | `False` |
| `DJANGO_ALLOWED_HOSTS` | Dominio(s) del servicio en Render | `mi-app.onrender.com` |
| `CORS_ALLOW_ALL_ORIGINS` | `True` permite cualquier origen | `True` |
| `DB_ENGINE` | `django.db.backends.postgresql` | `django.db.backends.postgresql` |
| `DB_NAME` | Nombre de la base (PostgreSQL) | `postgres` |
| `DB_USER` | Usuario de la base | `postgres.mi-ref` |
| `DB_PASSWORD` | Contraseña de la base | (completar en Render) |
| `DB_HOST` | Host de la base | `aws-0-us-east-1.pooler.supabase.com` |
| `DB_PORT` | Puerto de la base | `6543` |
| `SUPABASE_BUCKET` | Nombre del bucket | `recursos_academicos` |
| `SUPABASE_PUBLIC_URL` | URL pública del proyecto Supabase | `https://mi-ref.supabase.co` |
| `SUPABASE_S3_ENDPOINT` | Endpoint S3-compatible de Supabase | `https://mi-ref.storage.supabase.co/storage/v1/s3` |
| `SUPABASE_S3_ACCESS_KEY` | Access key S3 del bucket | (completar en Render) |
| `SUPABASE_S3_SECRET_KEY` | Secret key S3 del bucket | (completar en Render) |

### Conexión a Supabase Postgres

1. En Supabase Dashboard → Project Settings → Database → **Connection string**
2. Usar el pooler transaccional (compatible IPv4):
   - Host: `aws-0-us-east-1.pooler.supabase.com`
   - Puerto: `6543`
   - User: `postgres.mi-project-ref`
   - Password: la contraseña del DB
3. Setea las variables `DB_*` en Render Dashboard con estos datos.

### Post-deploy

Una vez desplegado, ejecuta en **Render Shell** (o `ssh` si está habilitado):

```bash
python manage.py createsuperuser
```

O para poblar datos de demo:

```bash
python manage.py seed_data
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
- `recursos/` — subida de PDF/ZIP (multipart, máx 15 MB) o enlaces
- `recursos/{id}/previsualizar/` — redirige a la URL pública del archivo (302)
- `recursos/{id}/descargar/` — descarga el archivo (proxy con Content-Disposition: attachment)

**Interacción** (`/api/`)
- `valoraciones/` (1–5 estrellas), `guardados/`, `reportes/` (+ `atender/`, `desestimar/`)

Los endpoints se documentan en Swagger (`/api/docs/`).
