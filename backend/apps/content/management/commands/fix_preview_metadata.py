import mimetypes

from django.core.management.base import BaseCommand

from apps.content.models import Recurso
from apps.content.storage import SupabaseS3Storage


class Command(BaseCommand):
    help = (
        'Repara los metadatos (Content-Type y Content-Disposition: inline) de los '
        'objetos ya subidos a Supabase Storage, de modo que los PDFs se muestren '
        'inline en el navegador en lugar de descargarse. Ejecutar una vez tras '
        'migrar desde Cloudinary.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Solo muestra qué objetos se corregirían, sin modificarlos.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        storage = Recurso._meta.get_field('archivo').storage
        if not isinstance(storage, SupabaseS3Storage):
            self.stderr.write(
                self.style.ERROR(
                    'El storage de archivos no es SupabaseS3Storage; no se hizo nada.'
                )
            )
            return

        qs = Recurso.objects.exclude(
            tipo_recurso=Recurso.TipoRecurso.LINK,
        ).exclude(archivo='').order_by('id')

        if not qs.exists():
            self.stdout.write(self.style.SUCCESS('No hay recursos con archivo que corregir.'))
            return

        corregidos = errores = 0
        for recurso in qs.iterator():
            nombre = (recurso.archivo.name or '').replace('\\', '/')
            if not nombre:
                continue
            content_type = {
                Recurso.TipoRecurso.PDF: 'application/pdf',
                Recurso.TipoRecurso.ZIP: 'application/zip',
            }.get(recurso.tipo_recurso) or (
                mimetypes.guess_type(nombre)[0] or 'application/octet-stream'
            )

            if dry_run:
                self.stdout.write(
                    f'  [DRY] {recurso.id}: {nombre} -> {content_type} (inline)'
                )
                continue

            try:
                storage.fix_object_metadata(nombre, content_type)
                self.stdout.write(f'  [OK] {recurso.id}: {nombre}')
                corregidos += 1
            except Exception as exc:  # noqa: BLE001
                self.stdout.write(
                    self.style.ERROR(f'  [ERROR] {recurso.id}: {nombre}: {exc}')
                )
                errores += 1

        resumen = f'Metadatos corregidos: {corregidos} | Errores: {errores}'
        if dry_run:
            resumen = f'DRY-RUN | {resumen}'
        self.stdout.write(self.style.SUCCESS(resumen))