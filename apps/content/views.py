from django.http import FileResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.accounts.permissions import IsModeradorOrAdmin

from .models import Coleccion, Recurso
from .serializers import (
    ColeccionSerializer,
    RecursoCreateSerializer,
    RecursoDetailSerializer,
    RecursoListSerializer,
)


class ColeccionViewSet(viewsets.ModelViewSet):
    queryset = Coleccion.objects.select_related('materia', 'profesor').all()
    serializer_class = ColeccionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['titulo', 'anio_semestre']

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        materia_id = params.get('materia_id')
        if materia_id:
            qs = qs.filter(materia_id=materia_id)
        profesor_id = params.get('profesor_id')
        if profesor_id:
            qs = qs.filter(profesor_id=profesor_id)
        return qs


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = (
        Recurso.objects
        .select_related('usuario', 'coleccion')
        .prefetch_related('valoraciones')
        .all()
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['nombre_archivo', 'descripcion', 'consejo_estudio']

    def get_serializer_class(self):
        if self.action == 'list':
            return RecursoListSerializer
        if self.action == 'create':
            return RecursoCreateSerializer
        return RecursoDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        materia_id = params.get('materia_id')
        if materia_id:
            qs = qs.filter(coleccion__materia_id=materia_id)

        coleccion_id = params.get('coleccion_id')
        if coleccion_id:
            qs = qs.filter(coleccion_id=coleccion_id)

        categoria = params.get('categoria')
        if categoria:
            qs = qs.filter(categoria=categoria)

        tipo_recurso = params.get('tipo_recurso')
        if tipo_recurso:
            qs = qs.filter(tipo_recurso=tipo_recurso)

        usuario_id = params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)

        solo_activos = params.get('solo_activos', 'true')
        if solo_activos.lower() in ('true', '1'):
            qs = qs.filter(activo=True)

        return qs

    @action(detail=True, methods=['post'], permission_classes=[IsModeradorOrAdmin])
    def toggle_activo(self, request, pk=None):
        recurso = self.get_object()
        recurso.activo = not recurso.activo
        recurso.save(update_fields=['activo'])
        estado = 'activo' if recurso.activo else 'inactivo'
        return Response({
            'status': 'ok',
            'activo': recurso.activo,
            'mensaje': f'El recurso ahora está {estado}.',
        })

    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        recurso = get_object_or_404(Recurso, pk=pk)
        if not recurso.archivo:
            return Response(
                {'error': 'Este recurso no tiene archivo adjunto.'},
                status=404,
            )
        return FileResponse(
            recurso.archivo.open('rb'),
            as_attachment=True,
            filename=recurso.nombre_archivo,
        )

    @action(detail=True, methods=['get'])
    def compartir(self, request, pk=None):
        recurso = self.get_object()
        url = request.build_absolute_uri(f'/api/recursos/{recurso.id}/')
        return Response({
            'url': url,
            'mensaje': 'Enlace generado correctamente.',
        })
