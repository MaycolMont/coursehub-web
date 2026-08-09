"""
Punto de entrada WSGI para AlwaysData (Passenger).

AlwaysData detecta esta ruta de la aplicacion en Web > Sites (tipo Python WSGI).
Este archivo debe vivir en la raiz de la app, junto a manage.py.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coursehub.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
