from rest_framework import serializers

from .models import Carrera, CarreraMateria, Facultad, Materia, MateriaProfesor, Profesor


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
    carreras_list = serializers.SerializerMethodField()
    recursos_count = serializers.SerializerMethodField()

    class Meta:
        model = Materia
        fields = [
            'id', 'codigo', 'nombre', 'carreras_list',
            'activo', 'recursos_count',
        ]

    def get_carreras_list(self, obj):
        return [
            {
                'id': cm.carrera.id,
                'nombre': cm.carrera.nombre,
                'facultad_nombre': cm.carrera.facultad.nombre,
            }
            for cm in obj.carreramateria_set.select_related('carrera__facultad').all()
        ]

    def get_recursos_count(self, obj):
        from django.db.models import Count, Subquery, OuterRef
        from apps.content.models import Recurso, Coleccion
        return Recurso.objects.filter(
            coleccion__in=Subquery(
                Coleccion.objects.filter(materia=obj).values('id')
            )
        ).count()


class MateriaSerializer(serializers.ModelSerializer):
    carreras = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Carrera.objects.all(),
    )

    class Meta:
        model = Materia
        fields = '__all__'


class CarreraMateriaSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.CharField(source='carrera.nombre', read_only=True)
    materia_codigo = serializers.CharField(source='materia.codigo', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)

    class Meta:
        model = CarreraMateria
        fields = '__all__'


class MateriaProfesorSerializer(serializers.ModelSerializer):
    materia_codigo = serializers.CharField(source='materia.codigo', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.nombre', read_only=True)

    class Meta:
        model = MateriaProfesor
        fields = '__all__'
