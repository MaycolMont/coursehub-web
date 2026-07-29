from rest_framework import serializers

from .models import Rango, Usuario


class RangoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rango
        fields = '__all__'


class UsuarioPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'pseudonimo', 'karma_acumulado', 'rol', 'fecha_registro']


class UsuarioProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'microsoft_id', 'correo_institucional', 'pseudonimo',
            'karma_acumulado', 'rol', 'fecha_registro',
        ]
        read_only_fields = [
            'microsoft_id', 'karma_acumulado', 'rol', 'fecha_registro',
        ]


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    pseudonimo = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_correo(self, value):
        if not value.endswith('@espol.edu.ec'):
            raise serializers.ValidationError(
                'Debe utilizar su correo institucional de la ESPOL.'
            )
        return value
