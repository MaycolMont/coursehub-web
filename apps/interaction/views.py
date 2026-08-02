from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.accounts.permissions import IsModeradorOrAdmin

from .models import Guardado, ReporteRecurso, Valoracion
from .serializers import (
    GuardadoSerializer,
    ReporteRecursoSerializer,
    ReporteUpdateSerializer,
    ValoracionSerializer,
)


class ValoracionViewSet(viewsets.ModelViewSet):
    queryset = Valoracion.objects.select_related('usuario', 'recurso').all()
    serializer_class = ValoracionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        recurso_id = params.get('recurso_id')
        if recurso_id:
            qs = qs.filter(recurso_id=recurso_id)
        usuario_id = params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class GuardadoViewSet(viewsets.ModelViewSet):
    queryset = Guardado.objects.select_related('usuario', 'recurso').all()
    serializer_class = GuardadoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.usuario != request.user:
            return Response(
                {'error': 'No puedes eliminar el guardado de otro usuario.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


class ReporteRecursoViewSet(viewsets.ModelViewSet):
    queryset = ReporteRecurso.objects.select_related('usuario', 'recurso').all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return ReporteUpdateSerializer
        return ReporteRecursoSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        estado = params.get('estado')
        if estado:
            qs = qs.filter(estado=estado)
        recurso_id = params.get('recurso_id')
        if recurso_id:
            qs = qs.filter(recurso_id=recurso_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['patch', 'post'], permission_classes=[IsModeradorOrAdmin])
    def atender(self, request, pk=None):
        reporte = self.get_object()
        reporte.estado = ReporteRecurso.Estado.ATENDIDO
        reporte.save(update_fields=['estado'])
        return Response({'status': 'ok', 'estado': reporte.estado})

    @action(detail=True, methods=['patch', 'post'], permission_classes=[IsModeradorOrAdmin])
    def desestimar(self, request, pk=None):
        reporte = self.get_object()
        reporte.estado = ReporteRecurso.Estado.DESESTIMADO
        reporte.save(update_fields=['estado'])
        return Response({'status': 'ok', 'estado': reporte.estado})
