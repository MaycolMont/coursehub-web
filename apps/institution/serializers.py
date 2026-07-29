from rest_framework import serializers

from .models import Carrera, Facultad, Materia, MateriaProfesor, Profesor


class FacultadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facultad
        fields = '__all__'


class CarreraSerializer(serializers.ModelSerializer):
    facultad_nombre = serializers.CharField(source='facultad.nombre', read_only=True)

    class Meta:
        model = Carrera
        fields = '__all__'


class ProfesorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profesor
        fields = '__all__'


class MateriaListSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.CharField(source='carrera.nombre', read_only=True)
    facultad_nombre = serializers.CharField(source='carrera.facultad.nombre', read_only=True)
    recursos_count = serializers.IntegerField(source='recursos.count', read_only=True)

    class Meta:
        model = Materia
        fields = [
            'id', 'codigo', 'nombre', 'carrera', 'carrera_nombre',
            'facultad_nombre', 'activo', 'recursos_count',
        ]


class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = '__all__'


class MateriaProfesorSerializer(serializers.ModelSerializer):
    materia_codigo = serializers.CharField(source='materia.codigo', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.nombre', read_only=True)

    class Meta:
        model = MateriaProfesor
        fields = '__all__'
