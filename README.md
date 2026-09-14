# CourseHub

Plataforma colaborativa para compartir apuntes, material de estudio y recursos entre estudiantes de ESPOL.

| Carpeta | Contenido | Publicación |
| ------- | --------- | ----------- |
| `backend/` | API REST Django + DRF | **Render** (Web Service) |
| `supabase/` | Migraciones SQL de infraestructura (bucket) | **Supabase** |

## Estructura

```
backend-coursehub/
├── backend/          # API Django + DRF
│   ├── coursehub/    # configuración del proyecto
│   ├── apps/         # accounts, institution, content, interaction
│   ├── manage.py
│   └── requirements.txt
├── supabase/         # migraciones SQL (bucket de recursos)
└── render.yaml       # Blueprint de Render (despliegue del backend)
```

## Inicio rápido (backend)

```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

- Admin: http://127.0.0.1:8000/admin/
- API:   http://127.0.0.1:8000/api/
- Docs:  http://127.0.0.1:8000/api/docs/

## Despliegue en Render

1. Push del repo a GitHub.
2. En **Render Dashboard → New → Blueprint**, selecciona el repo.
3. Render detecta `render.yaml` en la raíz y crea el Web Service automáticamente.
4. En **Environment → EnvVars**, completa las variables secretas:
   - `DB_PASSWORD` — contraseña del PostgreSQL de Supabase
   - `SUPABASE_S3_ACCESS_KEY`
   - `SUPABASE_S3_SECRET_KEY`
5. Ajusta `DJANGO_ALLOWED_HOSTS` con el dominio asignado por Render (p. ej. `mi-app.onrender.com` o tu dominio propio).
6. La primera ejecución aplica migraciones, recoge estáticos y arranca gunicorn.
7. Para crear el superadmin, ejecuta en **Render Shell**: `python manage.py createsuperuser`

Para más detalles, ver [backend/README.md](backend/README.md).