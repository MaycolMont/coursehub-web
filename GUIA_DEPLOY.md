# Guía de despliegue

Pasos para las actividades de la lección: publicar la API en **AlwaysData** y la página independiente en **InfinityFree**.

---

## 1. Publicar el backend (Django + DRF) en AlwaysData

AlwaysData ofrece planes gratuitos con soporte Python/Django y bases de datos **MySQL**. Se usa el panel de control (`https://admin.alwaysdata.com`).

### 1.1 Crear la app de Python (Django)

1. Entra a **Web > Sitios** y añade un sitio:
   - Tipo: **Python (WSGI)**.
   - Dirección: `tuusuario.alwaysdata.net`.
   - Ruta raíz: `www` (o `backend` si subes los archivos allí).
   - Comando (WSGI): `./venv/bin/python app.py` o apunta a `coursehub/wsgi.py`. Lo habitual en AlwaysData:
     - Application path: el directorio donde está `manage.py` (por ejemplo `backend`).
     - `env.py` / comando de arranque: crea un `app.py` en la raíz con:
       ```python
       import os
       from django.core.wsgi import get_wsgi_application
       os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coursehub.settings')
       application = get_wsgi_application()
       ```
       y en el panel usa el comando `./venv/bin/python app.py` (o `gunicorn coursehub.wsgi:application` si el plan lo permite).

2. Sube el contenido de la carpeta `backend/` del repositorio a la ruta raíz del sitio (por FTP o por la consola web).

### 1.2 Entorno virtual y dependencias

Desde la consola SSH/panel de AlwaysData, dentro del directorio de la app:

```bash
python -m venv venv
./venv/bin/pip install -r requirements.txt
```

### 1.3 Crear la base de datos MySQL

1. **MySQL > Databases** (panel AlwaysData): crea una base con el nombre `tuusuario_coursehub` (solo dejará el prefijo `tuusuario_`).
2. Anota los datos de conexión que aparecen en el panel (host tipo `mysql-tuusuario.alwaysdata.net`, usuario y contraseña).

### 1.4 Configurar `.env` en el servidor

Crea un archivo `.env` en la raíz de la app (basado en `backend/.env.example`):

```
DJANGO_SECRET_KEY=genera-una-clave-segura
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=tuusuario.alwaysdata.net

DB_ENGINE=django.db.backends.mysql
DB_NAME=tuusuario_coursehub
DB_USER=tuusuario
DB_PASSWORD=tu_password
DB_HOST=mysql-tuusuario.alwaysdata.net
DB_PORT=3306

CORS_ALLOW_ALL_ORIGINS=True
```

> `CORS_ALLOW_ALL_ORIGINS=True` permite que la página de InfinityFree (otro dominio) consuma la API sin problemas. Si quieres restringir, ponlo en `False` y lista el dominio en `CORS_ALLOWED_ORIGINS`.

### 1.5 Aplicar migraciones y sembrar datos

```bash
./venv/bin/python manage.py migrate
./venv/bin/python manage.py seed_data
./venv/bin/python manage.py collectstatic
```

### 1.6 Comprobar que los endpoints son públicos

Desde tu navegador o con `curl`:

```bash
curl -i https://tuusuario.alwaysdata.net/api/facultades/
curl -i https://tuusuario.alwaysdata.net/api/materias/catalogo/
curl -i https://tuusuario.alwaysdata.net/api/recursos/
curl -i https://tuusuario.alwaysdata.net/api/docs/
```

Deben responder `200 OK` con JSON. Si aparece `403`, revisa `DJANGO_ALLOWED_HOSTS`; si aparece un error CORS, revisa `CORS_ALLOW_ALL_ORIGINS`.

---

## 2. Publicar la página independiente en InfinityFree

InfinityFree sirve archivos **estáticos** (HTML/CSS/JS) desde `htdocs`. No ejecuta Python.

### 2.1 Subir los archivos

1. Entra a `https://cp.infinityfree.com` y crea una cuenta con **uno de los tres dominios** disponibles.
2. Accede al **Administrador de archivos** (o usa FTP/File Manager) y sube **el contenido** de la carpeta `frontend-web/` del repositorio a `htdocs`:
   - `index.html`
   - `css/style.css`
   - `js/config.js`, `js/api.js`, `js/app.js`

### 2.2 Apuntar la página a la API publicada

Edita `frontend-web/js/config.js` en el servidor:

```js
window.API_BASE_URL = 'https://tuusuario.alwaysdata.net/api';
```

> Cambia la URL por la del backend publicado en AlwaysData (paso 1.6). Sin la barra final.

### 2.3 Verificar

Abre tu dominio de InfinityFree (ej. `https://tu-dominio.infinityfreeapp.com`). La página debe mostrar las estadísticas, facultades, materias y recursos cargados desde la API, y la insignia debe decir **"API disponible"**.

Si muestra "API sin conexión":
- Comprueba que `js/config.js` tenga la URL correcta.
- Abre la consola del navegador (F12) para ver el error.
- Verifica CORS en el backend (`CORS_ALLOW_ALL_ORIGINS=True`).

---

## Resumen de URLs finales

| Recurso | URL |
| ------- | --- |
| API (AlwaysData) | `https://tuusuario.alwaysdata.net/api/` |
| Swagger (AlwaysData) | `https://tuusuario.alwaysdata.net/api/docs/` |
| Página web (InfinityFree) | `https://tu-dominio.infinityfreeapp.com/` |
