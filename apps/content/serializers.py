from django.db.models import Avg

from rest_framework import serializers

from .models import Coleccion, Recurso


class ColeccionSerializer(serializers.ModelSerializer):
    usuario_pseudonimo = serializers.CharField(
        source='usuario.pseudonimo', read_only=True, default=None,
    )

    class Meta:
        model = Coleccion
        fields = '__all__'
        read_only_fields = ['fecha_subida']


class RecursoListSerializer(serializers.ModelSerializer):
    usuario_pseudonimo = serializers.CharField(
        source='usuario.pseudonimo', read_only=True, default='Anónimo',
    )
    valoraciones_count = serializers.IntegerField(
        source='valoraciones.count', read_only=True,
    )
    promedio_estrellas = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = [
            'id', 'nombre_archivo', 'categoria', 'tipo_recurso',
            'usuario', 'usuario_pseudonimo', 'coleccion',
            'descripcion', 'consejo_estudio', 'fecha_subida',
            'activo', 'valoraciones_count', 'promedio_estrellas',
        ]

    def get_promedio_estrellas(self, obj):
        avg = obj.valoraciones.aggregate(avg=Avg('estrellas'))['estrellas__avg']
        return round(avg, 1) if avg else None


class RecursoDetailSerializer(serializers.ModelSerializer):
    usuario_pseudonimo = serializers.CharField(
        source='usuario.pseudonimo', read_only=True, default='Anónimo',
    )
    coleccion_titulo = serializers.CharField(
        source='coleccion.titulo', read_only=True, default=None,
    )

    class Meta:
        model = Recurso
        fields = '__all__'


class RecursoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = [
            'nombre_archivo', 'storage_key', 'categoria', 'tipo_recurso',
            'coleccion', 'descripcion', 'consejo_estudio',
        ]

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
