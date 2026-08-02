from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Rango, Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    list_display = ('pseudonimo', 'correo_institucional', 'rol', 'karma_acumulado', 'is_active', 'is_staff')
    search_fields = ('pseudonimo', 'correo_institucional')
    ordering = ('pseudonimo',)
    list_filter = ('rol', 'is_active', 'is_staff')

    fieldsets = (
        (None, {'fields': ('correo_institucional', 'password')}),
        ('Perfil', {'fields': ('pseudonimo', 'microsoft_id', 'rol', 'karma_acumulado')}),
        ('Permisos', {'fields': ('is_active', 'is_staff')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('correo_institucional', 'pseudonimo', 'rol', 'password1', 'password2'),
        }),
    )
    filter_horizontal = ()


@admin.register(Rango)
class RangoAdmin(admin.ModelAdmin):
    list_display = ('nombre_rango', 'karma_minimo')
    ordering = ('karma_minimo',)
