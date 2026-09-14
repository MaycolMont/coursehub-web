from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from botocore.exceptions import ClientError

from apps.content.models import Recurso


class Command(BaseCommand):
    help = (
        'Migra los archivos de los recursos existentes al bucket de Supabase '
        'y guarda su URL pública en Recurso.url.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Solo muestra qué recursos se migrarían, sin subir nada.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        recursos = Recurso.objects.exclude(
            tipo_recurso=Recurso.TipoRecurso.LINK,
        ).exclude(archivo='').order_by('id')

        if not recursos.exists():
            self.stdout.write(self.style.SUCCESS('No hay recursos por migrar.'))
            return

        migrados = saltados = errores = 0
        for recurso in recursos:
            nombre = (recurso.archivo.name or '').replace('\\', '/')
            if not nombre:
                saltados += 1
                continue

            if recurso.url and recurso.url.startswith(settings.SUPABASE_PUBLIC_URL):
                self.stdout.write(f'  [SKIP] {recurso.id}: {nombre} (ya en Supabase)')
                saltados += 1
                continue

            contenido = self._leer_bytes(recurso)
            if contenido is None:
                self.stdout.write(
                    self.style.ERROR(
                        f'  [ERROR] {recurso.id}: {nombre} sin fuente disponible'
                    )
                )
                errores += 1
                continue

            if dry_run:
                self.stdout.write(f'  [DRY] {recurso.id}: {nombre} ({len(contenido)} bytes)')
                continue

            try:
                storage = recurso.archivo.storage
                storage.save(nombre, ContentFile(contenido))
                recurso.url = storage.url(nombre)
                recurso.save(update_fields=['url'])
                self.stdout.write(f'  [OK] {recurso.id}: {nombre} -> {recurso.url}')
                migrados += 1
            except (OSError, IOError, ClientError) as exc:
                self.stdout.write(
                    self.style.ERROR(f'  [ERROR] {recurso.id}: {nombre}: {exc}')
                )
                errores += 1

        resumen = f'Migrados: {migrados} | Saltados: {saltados} | Errores: {errores}'
        if dry_run:
            resumen = f'DRY-RUN | {resumen}'
        self.stdout.write(self.style.SUCCESS(resumen))

    def _leer_bytes(self, recurso):
        nombre = (recurso.archivo.name or '').replace('\\', '/')
        try:
            with recurso.archivo.open('rb') as archivo:
                return archivo.read()
        except (OSError, IOError, ClientError):
            pass
        ruta = Path(settings.MEDIA_ROOT) / nombre
        if ruta.is_file():
            return ruta.read_bytes()
        return None