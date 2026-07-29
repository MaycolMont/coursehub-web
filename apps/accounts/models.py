from django.db import models


class Rango(models.Model):
    nombre_rango = models.CharField(max_length=50, unique=True)
    karma_minimo = models.IntegerField()

    class Meta:
        db_table = 'rangos'

    def __str__(self):
        return self.nombre_rango


class Usuario(models.Model):
    class Rol(models.TextChoices):
        ESTUDIANTE = 'estudiante'
        MODERADOR = 'moderador'
        ADMINISTRADOR = 'administrador'

    microsoft_id = models.CharField(max_length=255, unique=True)
    correo_institucional = models.EmailField(max_length=150, null=True, blank=True)
    pseudonimo = models.CharField(max_length=50, unique=True)
    karma_acumulado = models.IntegerField(default=0)
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.ESTUDIANTE)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usuarios'

    def __str__(self):
        return self.pseudonimo
