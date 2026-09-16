from types import SimpleNamespace
from unittest.mock import patch

from botocore.exceptions import ClientError
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APIRequestFactory

from apps.accounts.models import Usuario
from apps.content.models import Coleccion, Recurso
from apps.content.serializers import MAX_ARCHIVO_BYTES, RecursoCreateSerializer
from apps.content.storage import SupabaseS3Storage
from apps.content.views import RecursoViewSet
from apps.institution.models import Materia, Profesor


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


class RecursoPrevisualizarTests(TestCase):
    def _preview(self, recurso):
        request = APIRequestFactory().get('/api/recursos/1/previsualizar/')
        view = RecursoViewSet()
        view.get_object = lambda: recurso
        return view.previsualizar(request, pk=1)

    def test_previsualizar_sirve_pdf_inline(self):
        recurso = SimpleNamespace(
            id=1,
            nombre_archivo='informe',
            tipo_recurso=Recurso.TipoRecurso.PDF,
            archivo=SimpleNamespace(
                name='recursos/2026/08/f.pdf',
                open=lambda mode='rb': SimpleUploadedFile(
                    'f.pdf', b'%PDF-1.4\n%%EOF', content_type='application/pdf',
                ),
            ),
        )

        response = self._preview(recurso)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('inline; filename="informe.pdf"', response['Content-Disposition'])

    def test_previsualizar_devuelve_404_sin_archivo(self):
        recurso = SimpleNamespace(id=1, archivo=None)

        response = self._preview(recurso)

        self.assertEqual(response.status_code, 404)


class SupabaseS3StorageTests(TestCase):
    @patch('apps.content.storage.boto3.client')
    def test_open_lanza_file_not_found_cuando_falta_objeto(self, client_mock):
        client_mock.return_value.get_object.side_effect = ClientError(
            {'Error': {'Code': '404', 'Message': 'Not Found'}}, 'GetObject',
        )

        storage = SupabaseS3Storage()
        with self.assertRaises(FileNotFoundError):
            storage.open('recursos/2026/08/faltante.pdf')

    def test_url_publica_formato_correcto(self):
        storage = SupabaseS3Storage()
        self.assertEqual(
            storage.url('recursos/2026/08/f.pdf'),
            'https://aeiptwdvyserqbeyidci.supabase.co/storage/v1/object/public/'
            'recursos_academicos/recursos/2026/08/f.pdf',
        )

    @patch('apps.content.storage.boto3.client')
    def test_save_envia_objeto_con_content_type(self, client_mock):
        storage = SupabaseS3Storage()
        nombre = storage._save(
            'recursos/2026/08/f.pdf', ContentFile(b'%PDF-1.4', name='f.pdf'),
        )

        self.assertEqual(nombre, 'recursos/2026/08/f.pdf')
        kwargs = client_mock.return_value.put_object.call_args.kwargs
        self.assertEqual(kwargs['Bucket'], 'recursos_academicos')
        self.assertEqual(kwargs['Key'], 'recursos/2026/08/f.pdf')
        self.assertEqual(kwargs['ContentType'], 'application/pdf')
        self.assertEqual(kwargs['ContentDisposition'], 'inline')
        self.assertEqual(kwargs['Body'], b'%PDF-1.4')


class RecursoArchivoLimiteTests(TestCase):
    def test_rechaza_archivo_mayor_a_15mb(self):
        serializer = RecursoCreateSerializer()
        archivo = SimpleUploadedFile('grande.pdf', b'0' * (MAX_ARCHIVO_BYTES + 1))

        with self.assertRaises(Exception) as ctx:
            serializer.validate_archivo(archivo)
        self.assertIn('límite de 15 MB', str(ctx.exception))


class RecursoKarmaTests(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            correo_institucional='estudiante@espol.edu.ec',
            pseudonimo='estudiante',
            password='test1234',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.usuario)

    def test_crear_recurso_otorga_10_karma_al_autor(self):
        materia = Materia.objects.create(codigo='MATG9000', nombre='Materia karma')
        response = self.client.post(
            '/api/recursos/',
            {
                'nombre_archivo': 'Guía de física',
                'storage_key': 'https://example.com/guia-fisica',
                'categoria': Recurso.Categoria.NOTA,
                'tipo_recurso': Recurso.TipoRecurso.LINK,
                'materia_id': materia.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['karma_ganado'], 10)
        self.assertEqual(response.data['karma_acumulado'], 10)
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.karma_acumulado, 10)


class RecursoMateriaTests(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            correo_institucional='materia@espol.edu.ec',
            pseudonimo='materia',
            password='test1234',
        )
        self.materia = Materia.objects.create(
            codigo='MATG9999',
            nombre='Materia de prueba',
        )
        self.profesor = Profesor.objects.create(nombre='Profesor de prueba')
        self.coleccion = Coleccion.objects.create(
            titulo='Colección de prueba',
            materia=self.materia,
            profesor=self.profesor,
            anio_semestre='2026-1',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.usuario)

    def _datos_recurso(self, materia_id=None):
        return {
            'nombre_archivo': 'Recurso de prueba',
            'storage_key': 'https://example.com/recurso-prueba',
            'categoria': Recurso.Categoria.NOTA,
            'tipo_recurso': Recurso.TipoRecurso.LINK,
            **({'materia_id': materia_id} if materia_id is not None else {}),
        }

    def test_crear_enlace_sin_coleccion(self):
        response = self.client.post(
            '/api/recursos/', self._datos_recurso(self.materia.id), format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['coleccion'])
        self.assertEqual(response.data['materia_id'], self.materia.id)
        self.assertEqual(
            Recurso.objects.get(pk=response.data['id']).coleccion_id,
            None,
        )

    @patch('apps.content.storage.boto3.client')
    def test_crear_pdf_sin_coleccion(self, client_mock):
        response = self.client.post(
            '/api/recursos/',
            {
                'materia_id': self.materia.id,
                'categoria': Recurso.Categoria.NOTA,
                'tipo_recurso': Recurso.TipoRecurso.PDF,
                'archivo': SimpleUploadedFile('guia.pdf', b'%PDF-1.4'),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data['coleccion'])
        self.assertEqual(response.data['materia_id'], self.materia.id)

    def test_crear_en_materia_sin_colecciones(self):
        materia = Materia.objects.create(codigo='MATG9001', nombre='Sin colección')
        response = self.client.post(
            '/api/recursos/', self._datos_recurso(materia.id), format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_rechaza_materia_id_inexistente(self):
        response = self.client.post(
            '/api/recursos/', self._datos_recurso(999999), format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('materia_id', response.data)

    def test_rechaza_coleccion_de_otra_materia(self):
        otra_materia = Materia.objects.create(codigo='MATG9002', nombre='Otra materia')
        response = self.client.post(
            '/api/recursos/',
            {
                **self._datos_recurso(otra_materia.id),
                'storage_key': 'https://example.com/otro-recurso',
                'coleccion': self.coleccion.id,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('coleccion', response.data)

    def test_creacion_legacy_solo_con_coleccion_infiere_materia(self):
        response = self.client.post(
            '/api/recursos/',
            {**self._datos_recurso(), 'coleccion': self.coleccion.id},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['materia_id'], self.materia.id)

    def test_lista_recursos_sin_coleccion_y_con_paginacion(self):
        self.client.post(
            '/api/recursos/', self._datos_recurso(self.materia.id), format='json',
        )
        response = self.client.get(f'/api/recursos/?materia_id={self.materia.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['results'][0]['materia_id'], self.materia.id)
        self.assertIsNone(response.data['results'][0]['coleccion'])

    def test_rechaza_sin_materia_ni_coleccion(self):
        response = self.client.post(
            '/api/recursos/', self._datos_recurso(), format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('materia_id', response.data)

    def test_rechaza_archivo_y_storage_key_simultaneos(self):
        response = self.client.post(
            '/api/recursos/',
            {
                **self._datos_recurso(self.materia.id),
                'archivo': SimpleUploadedFile('guia.pdf', b'%PDF-1.4'),
            },
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('archivo', response.data)
        self.assertIn('storage_key', response.data)

    def test_rechaza_enlace_sin_storage_key(self):
        datos = self._datos_recurso(self.materia.id)
        datos.pop('storage_key')
        response = self.client.post('/api/recursos/', datos, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('storage_key', response.data)
