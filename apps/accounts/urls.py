from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LoginView, RangoViewSet, RegisterView, UsuarioViewSet

router = DefaultRouter()
router.register(r'rangos', RangoViewSet)
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
]
