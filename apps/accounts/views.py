import uuid

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Rango, Usuario
from .serializers import (
    ChangePasswordSerializer,
    CourseHubTokenObtainPairSerializer,
    RangoSerializer,
    RegisterSerializer,
    UsuarioProfileSerializer,
    UsuarioPublicSerializer,
)


class RangoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rango.objects.all()
    serializer_class = RangoSerializer
    permission_classes = [AllowAny]
    ordering = ['karma_minimo']


class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'me':
            return UsuarioProfileSerializer
        return UsuarioPublicSerializer

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = UsuarioProfileSerializer(request.user)
            return Response(serializer.data)
        serializer = UsuarioProfileSerializer(
            request.user, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def guardados(self, request):
        recursos = request.user.guardados.select_related('recurso').all()
        from apps.content.serializers import RecursoListSerializer
        serializer = RecursoListSerializer(
            [g.recurso for g in recursos], many=True, context={'request': request},
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def karma(self, request):
        rango = Rango.objects.filter(
            karma_minimo__lte=request.user.karma_acumulado
        ).order_by('-karma_minimo').first()
        siguiente = Rango.objects.filter(
            karma_minimo__gt=request.user.karma_acumulado
        ).order_by('karma_minimo').first()
        data = {
            'karma_acumulado': request.user.karma_acumulado,
            'rango_actual': RangoSerializer(rango).data if rango else None,
            'siguiente_rango': RangoSerializer(siguiente).data if siguiente else None,
            'progreso': (
                None if not siguiente else round(
                    (request.user.karma_acumulado / siguiente.karma_minimo) * 100, 1
                )
            ),
        }
        return Response(data)


class RegisterView(APIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        correo = serializer.validated_data['correo']
        pseudonimo = serializer.validated_data['pseudonimo']

        if Usuario.objects.filter(correo_institucional=correo).exists():
            return Response(
                {'error': 'Este correo ya está registrado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Usuario.objects.filter(pseudonimo=pseudonimo).exists():
            return Response(
                {'error': 'Este pseudónimo ya está en uso.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario = Usuario(
            correo_institucional=correo,
            pseudonimo=pseudonimo,
            microsoft_id=str(uuid.uuid4()),
        )
        usuario.set_password(serializer.validated_data['password'])
        usuario.save()

        refresh = RefreshToken.for_user(usuario)
        return Response({
            'usuario': UsuarioProfileSerializer(usuario).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    serializer_class = CourseHubTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CourseHubTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {'error': 'Se requiere el token refresh.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response(
                {'error': 'Token inválido o ya revocado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'mensaje': 'Sesión cerrada correctamente.'})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UsuarioProfileSerializer(request.user).data)

    def patch(self, request):
        serializer = UsuarioProfileSerializer(
            request.user, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['password_actual']):
            return Response(
                {'error': 'La contraseña actual es incorrecta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.set_password(serializer.validated_data['password_nueva'])
        request.user.save(update_fields=['password'])
        return Response({'mensaje': 'Contraseña actualizada correctamente.'})
