from django.db import models

from .storage import RecursoRawMediaStorage


class Coleccion(models.Model):
    titulo = models.CharField(max_length=150)
    materia = models.ForeignKey(
        'institution.Materia', on_delete=models.RESTRICT, db_column='materia_id',
        related_name='colecciones',
    )
    profesor = models.ForeignKey(
        'institution.Profesor', on_delete=models.RESTRICT, db_column='profesor_id',
        related_name='colecciones',
    )
    descripcion = models.TextField(null=True, blank=True)
    anio_semestre = models.CharField(max_length=20)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'colecciones'
        ordering = ['-anio_semestre', 'titulo']

    def __str__(self):
        return self.titulo


class Recurso(models.Model):
    class Categoria(models.TextChoices):
        NOTA = 'nota'
        PRUEBA = 'prueba'
        PROYECTO = 'proyecto'

    class TipoRecurso(models.TextChoices):
        PDF = 'pdf'
        ZIP = 'zip'
        LINK = 'link'

    nombre_archivo = models.CharField(max_length=255)
    storage_key = models.CharField(max_length=255, unique=True)
    archivo = models.FileField(
        upload_to='recursos/%Y/%m/', null=True, blank=True, max_length=255,
        storage=RecursoRawMediaStorage(),
    )
    categoria = models.CharField(max_length=20, choices=Categoria.choices)
    tipo_recurso = models.CharField(
        max_length=20, choices=TipoRecurso.choices, default=TipoRecurso.PDF,
    )
    usuario = models.ForeignKey(
        'accounts.Usuario', on_delete=models.SET_NULL, null=True, blank=True,
        db_column='usuario_id', related_name='recursos',
    )
    coleccion = models.ForeignKey(
        Coleccion, on_delete=models.CASCADE, null=True, blank=True,
        db_column='coleccion_id', related_name='recursos',
    )
    descripcion = models.TextField(null=True, blank=True)
    consejo_estudio = models.TextField(null=True, blank=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'recursos'
        ordering = ['-fecha_subida']

    def __str__(self):
        return self.nombre_archivo
