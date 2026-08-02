import os
import uuid

from django.db.models import Avg

from rest_framework import serializers

from .models import Coleccion, Recurso

MAX_ARCHIVO_MB = 40
MAX_ARCHIVO_BYTES = MAX_ARCHIVO_MB * 1024 * 1024
EXTENSIONES_PERMITIDAS = {'.pdf', '.zip'}
MAX_ARCHIVOS_POR_COLECCION = 5


class ColeccionSerializer(serializers.ModelSerializer):
    materia_codigo = serializers.CharField(source='materia.codigo', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.nombre', read_only=True)
    recursos_count = serializers.IntegerField(source='recursos.count', read_only=True)

    class Meta:
        model = Coleccion
        fields = '__all__'


class RecursoArchivoUrlMixin:
    def get_archivo_url(self, obj):
        if not obj.archivo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.archivo.url)
        return obj.archivo.url


class RecursoListSerializer(RecursoArchivoUrlMixin, serializers.ModelSerializer):
    usuario_pseudonimo = serializers.CharField(
        source='usuario.pseudonimo', read_only=True, default='Anónimo',
    )
    valoraciones_count = serializers.IntegerField(
        source='valoraciones.count', read_only=True,
    )
    promedio_estrellas = serializers.SerializerMethodField()
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = [
            'id', 'nombre_archivo', 'categoria', 'tipo_recurso',
            'usuario', 'usuario_pseudonimo', 'coleccion',
            'descripcion', 'consejo_estudio', 'fecha_subida',
            'activo', 'archivo_url', 'valoraciones_count', 'promedio_estrellas',
        ]

    def get_promedio_estrellas(self, obj):
        avg = obj.valoraciones.aggregate(avg=Avg('estrellas'))['avg']
        return round(avg, 1) if avg else None


class RecursoDetailSerializer(RecursoArchivoUrlMixin, serializers.ModelSerializer):
    usuario_pseudonimo = serializers.CharField(
        source='usuario.pseudonimo', read_only=True, default='Anónimo',
    )
    coleccion_titulo = serializers.CharField(
        source='coleccion.titulo', read_only=True, default=None,
    )
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = '__all__'


class RecursoCreateSerializer(RecursoArchivoUrlMixin, serializers.ModelSerializer):
    usuario_pseudonimo = serializers.CharField(
        source='usuario.pseudonimo', read_only=True, default='Anónimo',
    )
    archivo = serializers.FileField(required=False, allow_null=True)
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = [
            'id', 'nombre_archivo', 'storage_key', 'archivo', 'archivo_url',
            'categoria', 'tipo_recurso', 'coleccion', 'descripcion',
            'consejo_estudio', 'usuario', 'usuario_pseudonimo', 'fecha_subida',
        ]
        read_only_fields = ['id', 'usuario', 'usuario_pseudonimo', 'fecha_subida']
        extra_kwargs = {
            'nombre_archivo': {'required': False, 'allow_blank': True},
            'storage_key': {'required': False, 'allow_blank': True},
        }

    def validate_archivo(self, value):
        if value is None:
            return value
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in EXTENSIONES_PERMITIDAS:
            raise serializers.ValidationError(
                'Solo se permiten archivos PDF o ZIP.'
            )
        if value.size > MAX_ARCHIVO_BYTES:
            raise serializers.ValidationError(
                f'El archivo supera el límite de {MAX_ARCHIVO_MB} MB.'
            )
        return value

    def validate(self, attrs):
        tipo = attrs.get('tipo_recurso')
        archivo = attrs.get('archivo')
        storage_key = attrs.get('storage_key')
        coleccion = attrs.get('coleccion')

        if tipo in (Recurso.TipoRecurso.PDF, Recurso.TipoRecurso.ZIP):
            if not archivo:
                raise serializers.ValidationError({
                    'archivo': 'Debes adjuntar un archivo para este tipo de recurso.'
                })
            self._validar_limites_coleccion(tipo, coleccion)
        elif tipo == Recurso.TipoRecurso.LINK:
            if archivo:
                raise serializers.ValidationError({
                    'archivo': 'Un recurso tipo enlace no puede llevar archivo adjunto.'
                })
            if not storage_key or not storage_key.startswith(('http://', 'https://')):
                raise serializers.ValidationError({
                    'storage_key': 'Un recurso tipo enlace requiere una URL válida (http/https).'
                })
        return attrs

    def _validar_limites_coleccion(self, tipo, coleccion):
        if not coleccion:
            return
        archivos = coleccion.recursos.exclude(tipo_recurso=Recurso.TipoRecurso.LINK)
        if archivos.count() >= MAX_ARCHIVOS_POR_COLECCION:
            raise serializers.ValidationError({
                'coleccion': f'Esta colección ya alcanzó el límite de '
                             f'{MAX_ARCHIVOS_POR_COLECCION} archivos.'
            })
        if tipo == Recurso.TipoRecurso.ZIP and archivos.filter(
            tipo_recurso=Recurso.TipoRecurso.ZIP,
        ).exists():
            raise serializers.ValidationError({
                'archivo': 'Esta colección ya contiene un archivo ZIP.'
            })

    def create(self, validated_data):
        archivo = validated_data.pop('archivo', None)
        if archivo:
            nombre_original = os.path.basename(archivo.name)
            ext = os.path.splitext(archivo.name)[1].lower()
            archivo.name = f'{uuid.uuid4().hex}{ext}'
            validated_data['archivo'] = archivo
            validated_data['storage_key'] = archivo.name
            if not validated_data.get('nombre_archivo'):
                validated_data['nombre_archivo'] = nombre_original
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
