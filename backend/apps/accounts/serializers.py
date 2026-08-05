from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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


class ChangePasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nueva = serializers.CharField(write_only=True, min_length=6)


class CourseHubTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['correo'] = serializers.EmailField()
        self.fields.pop('correo_institucional', None)
        self.fields['password'] = serializers.CharField(style={'input_type': 'password'})

    def validate_correo(self, value):
        if not value.endswith('@espol.edu.ec'):
            raise serializers.ValidationError(
                'Debe utilizar su correo institucional de la ESPOL.'
            )
        return value

    def validate(self, attrs):
        correo = attrs.pop('correo')
        attrs['correo_institucional'] = correo
        data = super().validate(attrs)
        data['usuario'] = UsuarioProfileSerializer(self.user).data
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['pseudonimo'] = user.pseudonimo
        token['rol'] = user.rol
        return token
