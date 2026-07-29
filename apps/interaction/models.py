from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Valoracion(models.Model):
    usuario = models.ForeignKey(
        'accounts.Usuario', on_delete=models.CASCADE, db_column='usuario_id',
        related_name='valoraciones',
    )
    recurso = models.ForeignKey(
        'content.Recurso', on_delete=models.CASCADE, db_column='recurso_id',
        related_name='valoraciones',
    )
    estrellas = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )

    class Meta:
        db_table = 'valoraciones'
        unique_together = ('usuario', 'recurso')

    def __str__(self):
        return f'{self.usuario} -> {self.recurso}: {self.estrellas}'


class Guardado(models.Model):
    usuario = models.ForeignKey(
        'accounts.Usuario', on_delete=models.CASCADE, db_column='usuario_id',
        related_name='guardados',
    )
    recurso = models.ForeignKey(
        'content.Recurso', on_delete=models.CASCADE, db_column='recurso_id',
        related_name='guardados',
    )

    class Meta:
        db_table = 'guardados'
        unique_together = ('usuario', 'recurso')

    def __str__(self):
        return f'{self.usuario} guardó {self.recurso}'


class ReporteRecurso(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente'
        ATENDIDO = 'atendido'
        DESESTIMADO = 'desestimado'

    recurso = models.ForeignKey(
        'content.Recurso', on_delete=models.CASCADE, db_column='recurso_id',
        related_name='reportes',
    )
    usuario = models.ForeignKey(
        'accounts.Usuario', on_delete=models.SET_NULL, null=True, blank=True,
        db_column='usuario_id', related_name='reportes',
    )
    anonimo_nombre = models.CharField(max_length=150, null=True, blank=True)
    anonimo_correo = models.EmailField(max_length=150, null=True, blank=True)
    motivo = models.CharField(max_length=100)
    descripcion = models.TextField()
    estado = models.CharField(
        max_length=20, choices=Estado.choices, default=Estado.PENDIENTE,
    )
    fecha_reporte = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reportes_recursos'
        ordering = ['-fecha_reporte']

    def __str__(self):
        return f'Reporte {self.id} - {self.recurso}'
