from django.contrib import admin

from .models import Rango, Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('pseudonimo', 'rol', 'karma_acumulado', 'fecha_registro')
    search_fields = ('pseudonimo', 'correo_institucional', 'microsoft_id')
    list_filter = ('rol',)


@admin.register(Rango)
class RangoAdmin(admin.ModelAdmin):
    list_display = ('nombre_rango', 'karma_minimo')
    ordering = ('karma_minimo',)
