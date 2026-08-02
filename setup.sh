#!/usr/bin/env bash
# =============================================================
#  CourseHub - Configuracion rapida (Linux / macOS)
# =============================================================
set -e

cd "$(dirname "$0")"

echo ""
echo "=== CourseHub: configuracion local ==="

# 1. Localizar Python
if command -v python3 >/dev/null 2>&1; then
    PY=python3
else
    echo "Python 3.11+ no encontrado." >&2
    exit 1
fi
echo "Python detectado: $($PY --version)"

# 2. Crear entorno virtual
if [ ! -d .venv ]; then
    echo "Creando entorno virtual (.venv)..."
    $PY -m venv .venv
fi
VENV_PY=".venv/bin/python"

# 3. Instalar dependencias
echo "Instalando dependencias..."
$VENV_PY -m pip install --upgrade pip
$VENV_PY -m pip install -r requirements.txt

# 4. Copiar .env si no existe
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo ".env creado desde .env.example"
    fi
else
    echo ".env ya existe, no se sobrescribe."
fi

# 5. Migraciones
echo "Aplicando migraciones..."
$VENV_PY manage.py migrate

# 6. Seed
echo "Sembrando datos (facultades, carreras, materias, admin)..."
$VENV_PY manage.py seed_data

echo ""
echo "=== Listo! Credenciales de administrador ==="
echo "  Email:    admin@espol.edu.ec"
echo "  Password: AdminEspol2026!"
echo ""

echo "Para iniciar el servidor:"
echo "  .venv/bin/python manage.py runserver"
echo "  Admin: http://127.0.0.1:8000/admin/"
echo "  API:   http://127.0.0.1:8000/api/"
echo "  Docs:  http://127.0.0.1:8000/api/docs/"
