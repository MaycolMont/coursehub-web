from django.test import TestCase

from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Usuario
from apps.content.models import Recurso


def crear_usuario(correo, pseudonimo):
    return Usuario.objects.create_user(
        correo_institucional=correo, pseudonimo=pseudonimo, password='test1234',
    )


def crear_recurso(autor):
    return Recurso.objects.create(
        nombre_archivo='Apuntes de prueba',
        storage_key=f'seed-test-{autor.id}',
        categoria=Recurso.Categoria.NOTA,
        tipo_recurso=Recurso.TipoRecurso.LINK,
        url='https://example.com/apuntes',
        usuario=autor,
    )


class ValoracionKarmaTests(TestCase):
    def setUp(self):
        self.autor = crear_usuario('autor@espol.edu.ec', 'autor')
        self.estudiante = crear_usuario('estudiante@espol.edu.ec', 'estudiante')
        self.recurso = crear_recurso(self.autor)
        self.client = APIClient()

    def _calificar(self, usuario, estrellas):
        self.client.force_authenticate(usuario)
        return self.client.post(
            '/api/valoraciones/',
            {'recurso': self.recurso.id, 'estrellas': estrellas},
            format='json',
        )

    def test_valoracion_5_estrellas_premia_al_autor(self):
        response = self._calificar(self.estudiante, 5)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['karma_otorgado'], 5)
        self.autor.refresh_from_db()
        self.assertEqual(self.autor.karma_acumulado, 5)

    def test_valoracion_4_estrellas_premia_con_menos_karma(self):
        response = self._calificar(self.estudiante, 4)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['karma_otorgado'], 3)
        self.autor.refresh_from_db()
        self.assertEqual(self.autor.karma_acumulado, 3)

    def test_valoracion_baja_no_otorga_karma(self):
        response = self._calificar(self.estudiante, 2)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['karma_otorgado'], 0)
        self.autor.refresh_from_db()
        self.assertEqual(self.autor.karma_acumulado, 0)

    def test_autovaloracion_es_rechazada_sin_karma(self):
        response = self._calificar(self.autor, 5)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.autor.refresh_from_db()
        self.assertEqual(self.autor.karma_acumulado, 0)
        self.assertEqual(Recurso.objects.get(pk=self.recurso.pk).valoraciones.count(), 0)
