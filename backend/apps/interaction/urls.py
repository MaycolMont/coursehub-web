from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GuardadoViewSet, ReporteRecursoViewSet, ValoracionViewSet

router = DefaultRouter()
router.register(r'valoraciones', ValoracionViewSet)
router.register(r'guardados', GuardadoViewSet)
router.register(r'reportes', ReporteRecursoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
