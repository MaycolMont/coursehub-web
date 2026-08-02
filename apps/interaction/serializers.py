from rest_framework import serializers

from .models import Guardado, ReporteRecurso, Valoracion


class ValoracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Valoracion
        fields = '__all__'
        read_only_fields = ['usuario']

    def validate_estrellas(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('La calificación debe ser entre 1 y 5.')
        return value

    def validate(self, attrs):
        usuario = self.context['request'].user
        recurso = attrs.get('recurso')
        if recurso:
            qs = Valoracion.objects.filter(usuario=usuario, recurso=recurso)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    'Ya has calificado este recurso. Edita tu valoración existente.'
                )
        return attrs

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


class GuardadoSerializer(serializers.ModelSerializer):
    recurso_titulo = serializers.CharField(
        source='recurso.nombre_archivo', read_only=True,
    )

    class Meta:
        model = Guardado
        fields = '__all__'
        read_only_fields = ['usuario']

    def validate(self, attrs):
        usuario = self.context['request'].user
        recurso = attrs.get('recurso')
        if recurso:
            qs = Guardado.objects.filter(usuario=usuario, recurso=recurso)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    'Este recurso ya está en tus guardados.'
                )
        return attrs

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


class ReporteRecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteRecurso
        fields = '__all__'
        read_only_fields = ['usuario', 'fecha_reporte', 'estado']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['usuario'] = request.user
        return super().create(validated_data)


class ReporteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReporteRecurso
        fields = ['estado']
