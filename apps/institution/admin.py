from django.contrib import admin

from .models import Carrera, CarreraMateria, Facultad, Materia, MateriaProfesor, Profesor


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
    list_display = ('codigo', 'nombre', 'listar_carreras', 'activo')
    search_fields = ('codigo', 'nombre')
    list_filter = ('activo',)

    def listar_carreras(self, obj):
        return ', '.join(obj.carreras.values_list('nombre', flat=True))
    listar_carreras.short_description = 'Carreras'


@admin.register(CarreraMateria)
class CarreraMateriaAdmin(admin.ModelAdmin):
    list_display = ('carrera', 'materia')
    search_fields = ('carrera__nombre', 'materia__nombre', 'materia__codigo')


@admin.register(Profesor)
class ProfesorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activo')
    search_fields = ('nombre',)
    list_filter = ('activo',)


@admin.register(MateriaProfesor)
class MateriaProfesorAdmin(admin.ModelAdmin):
    list_display = ('materia', 'profesor')
    search_fields = ('materia__nombre', 'profesor__nombre')
