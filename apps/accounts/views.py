from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Rango, Usuario
from .serializers import (
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


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
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

        usuario = Usuario.objects.create(
            microsoft_id=correo,
            correo_institucional=correo,
            pseudonimo=pseudonimo,
        )
        return Response(
            UsuarioProfileSerializer(usuario).data,
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        correo = request.data.get('correo', '')
        if not correo.endswith('@espol.edu.ec'):
            return Response(
                {'error': 'Debe utilizar su correo institucional de la ESPOL.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            usuario = Usuario.objects.get(correo_institucional=correo)
        except Usuario.DoesNotExist:
            # Simulated: auto-create on first login for dev
            import uuid
            base = correo.split('@')[0][:45]
            pseudonimo = f'{base}_{uuid.uuid4().hex[:4]}'
            usuario = Usuario.objects.create(
                microsoft_id=correo,
                correo_institucional=correo,
                pseudonimo=pseudonimo,
            )

        return Response({
            'mensaje': 'Inicio de sesión exitoso.',
            'token': f'sim-token-{usuario.id}-{usuario.microsoft_id}',
            'usuario': UsuarioProfileSerializer(usuario).data,
        })
