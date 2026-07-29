from django.db import models


class Facultad(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'facultades'
        verbose_name_plural = 'facultades'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Carrera(models.Model):
    nombre = models.CharField(max_length=150)
    facultad = models.ForeignKey(
        Facultad, on_delete=models.RESTRICT, db_column='facultad_id',
        related_name='carreras',
    )

    class Meta:
        db_table = 'carreras'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Materia(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=150)
    carrera = models.ForeignKey(
        Carrera, on_delete=models.RESTRICT, db_column='carrera_id',
        related_name='materias',
    )
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'materias'
        ordering = ['codigo']

    def __str__(self):
        return f'{self.codigo} - {self.nombre}'


class Profesor(models.Model):
    nombre = models.CharField(max_length=150)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = 'profesores'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class MateriaProfesor(models.Model):
    materia = models.ForeignKey(
        Materia, on_delete=models.RESTRICT, db_column='materia_id',
    )
    profesor = models.ForeignKey(
        Profesor, on_delete=models.RESTRICT, db_column='profesor_id',
    )

    class Meta:
        db_table = 'materias_profesores'
        unique_together = ('materia', 'profesor')
        verbose_name_plural = 'materias_profesores'

    def __str__(self):
        return f'{self.materia} - {self.profesor}'
