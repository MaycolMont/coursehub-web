from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CarreraViewSet,
    FacultadViewSet,
    MateriaProfesorViewSet,
    MateriaViewSet,
    ProfesorViewSet,
)

router = DefaultRouter()
router.register(r'facultades', FacultadViewSet)
router.register(r'carreras', CarreraViewSet)
router.register(r'profesores', ProfesorViewSet)
router.register(r'materias', MateriaViewSet)
router.register(r'materias-profesores', MateriaProfesorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
