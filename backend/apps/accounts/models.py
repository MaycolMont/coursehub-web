from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


class Rango(models.Model):
    nombre_rango = models.CharField(max_length=50, unique=True)
    karma_minimo = models.IntegerField()

    class Meta:
        db_table = 'rangos'

    def __str__(self):
        return self.nombre_rango


class UsuarioManager(BaseUserManager):
    def create_user(self, correo_institucional, password=None, **extra_fields):
        if not correo_institucional:
            raise ValueError('El correo institucional es obligatorio.')
        correo_institucional = self.normalize_email(correo_institucional)
        user = self.model(
            correo_institucional=correo_institucional, **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo_institucional, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('rol', Usuario.Rol.ADMINISTRADOR)
        return self.create_user(correo_institucional, password, **extra_fields)


class Usuario(AbstractBaseUser):
    class Rol(models.TextChoices):
        ESTUDIANTE = 'estudiante'
        MODERADOR = 'moderador'
        ADMINISTRADOR = 'administrador'

    microsoft_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    correo_institucional = models.EmailField(unique=True)
    pseudonimo = models.CharField(max_length=50, unique=True)
    karma_acumulado = models.IntegerField(default=0)
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.ESTUDIANTE)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'correo_institucional'
    REQUIRED_FIELDS = ['pseudonimo']

    objects = UsuarioManager()

    class Meta:
        db_table = 'usuarios'

    def __str__(self):
        return self.pseudonimo

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff
