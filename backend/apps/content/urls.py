from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ColeccionViewSet, RecursoViewSet

router = DefaultRouter()
router.register(r'colecciones', ColeccionViewSet)
router.register(r'recursos', RecursoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
