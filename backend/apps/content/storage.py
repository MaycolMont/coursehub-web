import mimetypes
import os

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.base import File
from django.core.files.storage import Storage
from io import BytesIO


class SupabaseS3Storage(Storage):
    """Django storage que sube/lee archivos en Supabase Storage vía su API S3.

    Usa las credenciales S3 del bucket (access key / secret key) generadas en
    Supabase Dashboard -> Storage -> bucket -> Settings. Se conecta al endpoint
    ``.../storage/v1/s3``; la lectura del frontend usa directamente las URLs
    públicas del bucket (campo ``Recurso.url``), por lo que el bucket debe ser
    público (ver migración SQL ``supabase/migrations``).
    """

    def __init__(self):
        self.bucket = settings.SUPABASE_BUCKET
        self.endpoint_url = settings.SUPABASE_S3_ENDPOINT
        self.access_key = settings.SUPABASE_S3_ACCESS_KEY
        self.secret_key = settings.SUPABASE_S3_SECRET_KEY
        self.public_url = settings.SUPABASE_PUBLIC_URL
        self.region = 'us-east-1'
        self._client = None

    def __repr__(self):
        return f'<{self.__class__.__name__} bucket={self.bucket!r}>'

    def deconstruct(self):
        name = f'{self.__module__}.{self.__class__.__qualname__}'
        return name, (), {}

    def _get_client(self):
        if self._client is None:
            self._client = boto3.client(
                's3',
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
            )
        return self._client

    def _save(self, name, content):
        name = str(name).replace('\\', '/')
        content_type = getattr(content, 'content_type', None) or (
            mimetypes.guess_type(name)[0] or 'application/octet-stream'
        )
        content.seek(0)
        self._get_client().put_object(
            Bucket=self.bucket,
            Key=name,
            Body=content.read(),
            ContentType=content_type,
            ContentDisposition='inline',
        )
        return name

    def fix_object_metadata(self, name, content_type, content_disposition='inline'):
        """Repara los metadatos de un objeto existente para que se sirva inline.

        Los objetos migrados desde Cloudinary pueden haber quedado con
        ``Content-Type`` no renderizable o ``Content-Disposition: attachment``,
        lo que hace que el navegador descargue el PDF en vez de mostrarlo.
        Con ``CopyObject`` + ``MetadataDirective=REPLACE`` se sobrescriben las
        cabeceras del objeto sin mover los datos.
        """
        client = self._get_client()
        try:
            client.copy_object(
                Bucket=self.bucket,
                Key=name,
                CopySource={'Bucket': self.bucket, 'Key': name},
                MetadataDirective='REPLACE',
                ContentType=content_type,
                ContentDisposition=content_disposition,
            )
        except ClientError:
            obj = client.get_object(Bucket=self.bucket, Key=name)
            client.put_object(
                Bucket=self.bucket,
                Key=name,
                Body=obj['Body'].read(),
                ContentType=content_type,
                ContentDisposition=content_disposition,
            )

    def _open(self, name, mode='rb'):
        try:
            response = self._get_client().get_object(Bucket=self.bucket, Key=name)
            return File(BytesIO(response['Body'].read()), name)
        except ClientError:
            raise FileNotFoundError(name)

    def url(self, name):
        return f'{self.public_url}/storage/v1/object/public/{self.bucket}/{name}'

    def exists(self, name):
        try:
            self._get_client().head_object(Bucket=self.bucket, Key=name)
            return True
        except ClientError:
            return False

    def delete(self, name):
        self._get_client().delete_object(Bucket=self.bucket, Key=name)

    def get_available_name(self, name, max_length=None):
        return name

    @staticmethod
    def _normalise_name(name):
        return name.replace('\\', '/')