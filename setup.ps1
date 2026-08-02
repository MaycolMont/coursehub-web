# =============================================================
#  CourseHub - Configuracion rapida (Windows / PowerShell)
#  Crea el entorno, instala dependencias, migra y siembra datos.
# =============================================================
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "`n=== CourseHub: configuracion local ===" -ForegroundColor Cyan

# 1. Localizar Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $python) {
    Write-Host "Python no encontrado. Instala Python 3.11+ desde https://www.python.org/ y reintenta." -ForegroundColor Red
    exit 1
}
Write-Host ("Python detectado: " + $python.Source) -ForegroundColor Green

# 2. Crear entorno virtual
if (-not (Test-Path .venv)) {
    Write-Host "Creando entorno virtual (.venv)..."
    & $python.Source -m venv .venv
}
$venvPython = Join-Path $root ".venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    $venvPython = Join-Path $root ".venv\bin\python.exe"
}
Write-Host "Entorno listo: $venvPython" -ForegroundColor Green

# 3. Instalar dependencias
Write-Host "Instalando dependencias..."
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r requirements.txt

# 4. Copiar .env si no existe
if (-not (Test-Path .env)) {
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host ".env creado desde .env.example" -ForegroundColor Yellow
    }
} else {
    Write-Host ".env ya existe, no se sobrescribe." -ForegroundColor Yellow
}

# 5. Migraciones
Write-Host "Aplicando migraciones..."
& $venvPython manage.py migrate

# 6. Seed
Write-Host "Sembrando datos (facultades, carreras, materias, admin)..."
& $venvPython manage.py seed_data

Write-Host "`n=== Listo! Credenciales de administrador ===" -ForegroundColor Cyan
Write-Host "  Email:    admin@espol.edu.ec"
Write-Host "  Password: AdminEspol2026!"
Write-Host "  (Cambialas en el admin o crea las tuyas en .env antes de sembrar)" -ForegroundColor Yellow

Write-Host "`nPara iniciar el servidor:" -ForegroundColor Green
Write-Host "  .venv\Scripts\python manage.py runserver"
Write-Host "  Admin: http://127.0.0.1:8000/admin/"
Write-Host "  API:   http://127.0.0.1:8000/api/"
Write-Host "  Docs:  http://127.0.0.1:8000/api/docs/`n"
