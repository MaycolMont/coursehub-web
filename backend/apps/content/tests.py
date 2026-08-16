import io
from types import SimpleNamespace
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from apps.content.models import Recurso
from apps.content.storage import RecursoRawMediaStorage
from apps.content.views import RecursoViewSet


class RecursoDescargaTests(TestCase):
    def _descargar(self, nombre_archivo, tipo_recurso, contenido, nombre_archivo_real=None):
        request = APIRequestFactory().get('/api/recursos/1/descargar/')
        recurso = SimpleNamespace(
            id=1,
            nombre_archivo=nombre_archivo,
            tipo_recurso=tipo_recurso,
            archivo=SimpleUploadedFile(
                nombre_archivo_real or nombre_archivo,
                contenido,
                content_type='application/pdf' if tipo_recurso == Recurso.TipoRecurso.PDF else 'application/zip',
            ),
        )
        recurso.archivo.open = lambda mode='rb': SimpleUploadedFile(
            nombre_archivo_real or nombre_archivo,
            contenido,
            content_type='application/pdf' if tipo_recurso == Recurso.TipoRecurso.PDF else 'application/zip',
        )

        view = RecursoViewSet()
        view.get_object = lambda: recurso
        response = view.descargar(request, pk=1)
        return response

    def test_descarga_pdf_incluye_extension_real_en_cabecera(self):
        response = self._descargar(
            'informe',
            Recurso.TipoRecurso.PDF,
            b'%PDF-1.4\n%%EOF',
        )

        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('attachment; filename="informe.pdf"', response['Content-Disposition'])

    def test_descarga_zip_incluye_extension_real_en_cabecera(self):
        response = self._descargar(
            'material',
            Recurso.TipoRecurso.ZIP,
            b'PK\x03\x04',
        )

        self.assertEqual(response['Content-Type'], 'application/zip')
        self.assertIn('attachment; filename="material.zip"', response['Content-Disposition'])

    @patch('apps.content.storage.cloudinary.uploader.upload')
    def test_storage_preserva_extension_real_al_subir_archivo(self, upload_mock):
        upload_mock.return_value = {'public_id': 'archivo.pdf'}

        storage = RecursoRawMediaStorage()
        public_id = storage._save('recursos/2026/08/archivo.pdf', io.BytesIO(b'%PDF-1.4'))

        self.assertEqual(public_id, 'archivo.pdf')
        self.assertEqual(upload_mock.call_args.kwargs['public_id'], 'archivo.pdf')
