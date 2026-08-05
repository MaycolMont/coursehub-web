from django.contrib import admin

from .models import Coleccion, Recurso


@admin.register(Coleccion)
class ColeccionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'materia', 'profesor', 'anio_semestre', 'activo')
    search_fields = ('titulo', 'materia__nombre', 'profesor__nombre')
    list_filter = ('activo', 'anio_semestre', 'materia')


@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ('nombre_archivo', 'categoria', 'tipo_recurso', 'usuario', 'fecha_subida', 'activo')
    search_fields = ('nombre_archivo', 'descripcion')
    list_filter = ('categoria', 'tipo_recurso', 'activo', 'fecha_subida')
