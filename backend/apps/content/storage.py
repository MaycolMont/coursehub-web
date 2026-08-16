import os

import cloudinary.uploader
from cloudinary_storage.storage import RawMediaCloudinaryStorage
from django.core.files.uploadedfile import UploadedFile


class RecursoRawMediaStorage(RawMediaCloudinaryStorage):
    def _save(self, name, content):
        name = self._normalise_name(name)
        name = self._prepend_prefix(name)
        uploaded_name = os.path.basename(name)
        content = UploadedFile(content, uploaded_name)
        response = self._upload(name, content)
        return response['public_id']

    def _upload(self, name, content):
        options = {
            'resource_type': self._get_resource_type(name),
            'tags': self.TAG,
            'public_id': os.path.basename(name),
        }
        folder = os.path.dirname(name)
        if folder:
            options['folder'] = folder
        return cloudinary.uploader.upload(content, **options)
