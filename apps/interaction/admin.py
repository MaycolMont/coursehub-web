from django.contrib import admin

from .models import Guardado, ReporteRecurso, Valoracion


@admin.register(Valoracion)
class ValoracionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'recurso', 'estrellas')
    list_filter = ('estrellas',)


@admin.register(Guardado)
class GuardadoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'recurso')
    search_fields = ('usuario__pseudonimo', 'recurso__nombre_archivo')


@admin.register(ReporteRecurso)
class ReporteRecursoAdmin(admin.ModelAdmin):
    list_display = ('id', 'recurso', 'motivo', 'estado', 'fecha_reporte')
    search_fields = ('motivo', 'descripcion')
    list_filter = ('estado', 'motivo', 'fecha_reporte')
