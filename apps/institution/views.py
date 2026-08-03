from django.db import models

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Carrera, CarreraMateria, Facultad, Materia, MateriaProfesor, Profesor
from .serializers import (
    CarreraMateriaSerializer,
    CarreraSerializer,
    FacultadSerializer,
    MateriaListSerializer,
    MateriaProfesorSerializer,
    MateriaSerializer,
    ProfesorSerializer,
)


class FacultadViewSet(viewsets.ModelViewSet):
    queryset = Facultad.objects.all()
    serializer_class = FacultadSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['nombre']


class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.select_related('facultad').all()
    serializer_class = CarreraSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['nombre']

    def get_queryset(self):
        qs = super().get_queryset()
        facultad_id = self.request.query_params.get('facultad_id')
        if facultad_id:
            qs = qs.filter(facultad_id=facultad_id)
        return qs


class ProfesorViewSet(viewsets.ModelViewSet):
    queryset = Profesor.objects.all()
    serializer_class = ProfesorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['nombre']


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.prefetch_related(
        'carreramateria_set__carrera__facultad',
    ).all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['codigo', 'nombre']

    def get_serializer_class(self):
        if self.action in ('list', 'catalogo'):
            return MateriaListSerializer
        return MateriaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        carrera_id = params.get('carrera_id')
        if carrera_id:
            qs = qs.filter(carreramateria__carrera_id=carrera_id)

        facultad_id = params.get('facultad_id')
        if facultad_id:
            qs = qs.filter(carreramateria__carrera__facultad_id=facultad_id)

        activo = params.get('activo')
        if activo is not None:
            qs = qs.filter(activo=activo.lower() in ('true', '1'))

        search = params.get('search')
        if search:
            qs = qs.filter(
                models.Q(codigo__icontains=search) |
                models.Q(nombre__icontains=search)
            )

        return qs.distinct()

    @action(detail=False, methods=['get'])
    def catalogo(self, request):
        qs = self.filter_queryset(self.get_queryset().filter(activo=True))
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class CarreraMateriaViewSet(viewsets.ModelViewSet):
    queryset = CarreraMateria.objects.select_related(
        'carrera__facultad', 'materia',
    ).all()
    serializer_class = CarreraMateriaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        carrera_id = params.get('carrera_id')
        if carrera_id:
            qs = qs.filter(carrera_id=carrera_id)
        materia_id = params.get('materia_id')
        if materia_id:
            qs = qs.filter(materia_id=materia_id)
        return qs


class MateriaProfesorViewSet(viewsets.ModelViewSet):
    queryset = MateriaProfesor.objects.select_related('materia', 'profesor').all()
    serializer_class = MateriaProfesorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        materia_id = self.request.query_params.get('materia_id')
        if materia_id:
            qs = qs.filter(materia_id=materia_id)
        profesor_id = self.request.query_params.get('profesor_id')
        if profesor_id:
            qs = qs.filter(profesor_id=profesor_id)
        return qs
