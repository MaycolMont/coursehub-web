from django.contrib import admin

from .models import Carrera, Facultad, Materia, MateriaProfesor, Profesor


@admin.register(Facultad)
class FacultadAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo')
    search_fields = ('nombre',)
    list_filter = ('activo',)


@admin.register(Carrera)
class CarreraAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'facultad')
    search_fields = ('nombre',)
    list_filter = ('facultad',)


@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'carrera', 'activo')
    search_fields = ('codigo', 'nombre')
    list_filter = ('carrera', 'activo')


@admin.register(Profesor)
class ProfesorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo')
    search_fields = ('nombre',)
    list_filter = ('activo',)


@admin.register(MateriaProfesor)
class MateriaProfesorAdmin(admin.ModelAdmin):
    list_display = ('materia', 'profesor')
    search_fields = ('materia__nombre', 'profesor__nombre')
