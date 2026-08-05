import io
import os
import uuid
import zipfile

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.accounts.models import Rango, Usuario
from apps.content.models import Coleccion, Recurso
from apps.institution.models import Carrera, CarreraMateria, Facultad, Materia, Profesor


FACULTADES = [
    (1, 'Facultad de Ingeniería en Electricidad y Computación (FIEC)'),
    (2, 'Facultad de Ingeniería en Mecánica y Ciencias de la Producción (FIMCP)'),
    (3, 'Facultad de Ciencias Sociales y Humanísticas (FCSH)'),
    (4, 'Facultad de Ciencias Naturales y Matemáticas (FCNM)'),
    (5, 'Facultad de Ciencias de la Vida (FCV)'),
    (6, 'Facultad de Ingeniería en Ciencias de la Tierra (FICT)'),
    (7, 'Facultad de Ingeniería Marítima y Ciencias del Mar (FIMCM)'),
    (8, 'Facultad de Arte, Diseño y Comunicación Audiovisual (FADCOM)'),
]

CARRERAS = [
    (1, 'Ciencia de Datos e Inteligencia Artificial', 1),
    (2, 'Computación', 1),
]

MATERIAS = [
    (1, 'MATG1045', 'Cálculo de Una Variable'),
    (2, 'MATG1049', 'Álgebra Lineal'),
    (3, 'INDG1033', 'Análisis y Resolución de Problemas'),
    (4, 'CCPG1043', 'Fundamentos de Programación'),
    (5, 'MATG1046', 'Cálculo Vectorial'),
    (6, 'TICG1018', 'Sistema de Bases de Datos'),
    (7, 'CCPG1052', 'Programación Orientada a Objetos'),
    (8, 'CCPG1034', 'Estructuras de Datos'),
    (9, 'CCPG1046', 'Interacción Humano Computador'),
    (10, 'CCPG1036', 'Análisis de Algoritmos'),
    (11, 'SOFG1006', 'Desarrollo de Aplicaciones Web y Móviles'),
    (12, 'SOFG1007', 'Ingeniería de Software I'),
    (13, 'CCPG1809', 'Inteligencia Artificial'),
    (14, 'CCPG1810', 'Sistemas Distribuidos y Computación en la Nube'),
    (15, 'CCPG1812', 'Seguridad de la Información'),
    (16, 'IDIG1006', 'Inglés I'),
    (17, 'IDIG1007', 'Inglés II'),
    (18, 'IDIG1008', 'Inglés III'),
    (19, 'IDIG1009', 'Inglés IV'),
    (20, 'IDIG1010', 'Inglés V'),
    (21, 'IDIG2012', 'Comunicación'),
    (22, 'CDIAG1003', 'Fundamentos de Ciencia de Datos e Inteligencia Artificial'),
    (23, 'ESTG1036', 'Estadística I'),
    (24, 'CDIAG1002', 'Machine Learning'),
    (25, 'CDIAG1001', 'Algoritmos de Optimización'),
    (26, 'ESTG1037', 'Estadística II'),
    (27, 'ADMG1801', 'Emprendimiento e Innovación (CDIA)'),
    (28, 'CDIAG1804', 'Visualización de Información'),
    (29, 'ESTG1801', 'Datos y Pronósticos'),
    (30, 'CDIAG1806', 'Ética en Ciencia de Datos y Sistemas Inteligentes'),
    (31, 'ADSG1801', 'Ciencias de la Sostenibilidad (CDIA)'),
    (32, 'CDIAG1802', 'Estrategia de Datos'),
    (33, 'CDIAG1807', 'Deep Learning'),
    (34, 'TLMG1801', 'Ambientes Inteligentes'),
    (35, 'CDIAG1808', 'Sistemas de Machine Learning'),
    (36, 'TICG1801', 'Bases de Datos Avanzadas'),
    (37, 'CDIAG1809', 'Procesamiento de Lenguaje Natural'),
    (38, 'CDIAG1812', 'Materia Integradora de Ciencia de Datos e Inteligencia Artificial'),
    (39, 'FISG1005', 'Física: Mecánica'),
    (40, 'CCPG1039', 'Computación y Sociedad'),
    (41, 'EYAG1037', 'Fundamentos de Electricidad y Sistemas Digitales'),
    (42, 'MATG1051', 'Matemáticas Discretas'),
    (43, 'CCPG1042', 'Diseño de Software'),
    (44, 'CCPG1049', 'Organización de Computadores'),
    (45, 'CCPG1051', 'Programación de Sistemas'),
    (46, 'ESTG1034', 'Estadística'),
    (47, 'TLMG1032', 'Redes de Datos'),
    (48, 'CCPG1056', 'Sistemas Operativos'),
    (49, 'ADMG1005', 'Emprendimiento e Innovación'),
    (50, 'CCPG1053', 'Seguridad de la Información (Comp)'),
    (51, 'CCPG1048', 'Metodología de la Investigación en Computación'),
    (52, 'SOFG1009', 'Lenguajes de Programación'),
    (53, 'SOFG1008', 'Ingeniería de Software II'),
    (54, 'ADSG1026', 'Ciencias de la Sostenibilidad'),
    (55, 'CCPG1054', 'Sistemas de Información'),
    (56, 'CCPG1041', 'Dirección de Proyectos Informáticos'),
    (57, 'CCPG1035', 'Materia Integradora de Computación'),
]

# Materias de Ciencia de Datos e IA (carrera 1)
CDIA_MATERIAS = [
    'INDG1033', 'MATG1045', 'MATG1049', 'CCPG1043', 'IDIG1006',
    'TICG1018', 'MATG1046', 'CDIAG1003', 'CCPG1052', 'IDIG1007',
    'CCPG1034', 'ESTG1036', 'CCPG1046', 'IDIG2012',
    'CDIAG1002', 'IDIG1008', 'CCPG1036', 'SOFG1006', 'SOFG1007',
    'CDIAG1001', 'ESTG1037', 'IDIG1009', 'ADMG1801',
    'CDIAG1804', 'ESTG1801', 'CDIAG1806', 'CCPG1809',
    'IDIG1010', 'CCPG1810', 'ADSG1801', 'CCPG1812',
    'CDIAG1802', 'CDIAG1807', 'TLMG1801',
    'CDIAG1808', 'TICG1801', 'CDIAG1809', 'CDIAG1812',
]

# Materias de Computación (carrera 2)
COMP_MATERIAS = [
    'MATG1045', 'FISG1005', 'INDG1033', 'CCPG1043', 'IDIG1006',
    'MATG1049', 'MATG1046', 'CCPG1039', 'CCPG1052', 'IDIG1007',
    'EYAG1037', 'MATG1051', 'CCPG1034', 'CCPG1042', 'TICG1018',
    'IDIG1008', 'CCPG1049', 'CCPG1051', 'ESTG1034', 'CCPG1046',
    'TLMG1032', 'IDIG1009', 'CCPG1056', 'CCPG1036', 'SOFG1006',
    'SOFG1007', 'ADMG1005', 'IDIG1010', 'CCPG1053', 'CCPG1048',
    'SOFG1009', 'SOFG1008', 'ADSG1026', 'CCPG1809',
    'CCPG1054', 'CCPG1810', 'CCPG1041', 'CCPG1035',
]

CODIGO_TO_CARRERA = {
    'CDIA': CDIA_MATERIAS,
    'COMP': COMP_MATERIAS,
}

CODIGO_MATERIA_MAP = {}

PROFESORES = [
    'Ing. Chang',
    'Ing. Cedeño',
    'Ing. Salazar',
    'Ing. Mendoza',
    'Ing. Vera',
]

RANGOS = [
    ('Novato', 0),
    ('Colaborador', 100),
    ('Héroe de la FIEC', 300),
    ('Leyenda ESPOL', 500),
]

ESTUDIANTES_DEMO = [
    ('anmgarci@espol.edu.ec', 'anmgarci', 850),
    ('maleon@espol.edu.ec', 'maleon', 420),
    ('smedina@espol.edu.ec', 'smedina', 260),
    ('dromero@espol.edu.ec', 'dromero', 120),
    ('pmontes@espol.edu.ec', 'pmontes', 45),
]

# (codigo_materia, titulo_coleccion, indice_profesor) -> colecciones demo.
DEMO_COLECCIONES = [
    ('MATG1045', 'Apuntes de Cálculo de Una Variable', 0),
    ('MATG1049', 'Guías y exámenes de Álgebra Lineal', 1),
    ('CCPG1043', 'Material de Fundamentos de Programación', 2),
    ('TICG1018', 'Recursos de Sistemas de Bases de Datos', 3),
    ('CCPG1034', 'Ejercicios de Estructuras de Datos', 4),
    ('CCPG1809', 'Laboratorios de Inteligencia Artificial', 0),
]

# (coleccion_titulo, categoria, tipo_recurso, nombre_archivo, storage_key,
#  autor_correo, descripcion, consejo_estudio) -> recursos demo.
# Para links, storage_key es la URL; para archivos, es un slug único.
DEMO_RECURSOS = [
    ('Apuntes de Cálculo de Una Variable', 'nota', 'pdf',
     'Apuntes de límites y derivadas', 'seed-pdf-calculo-limites',
     'anmgarci@espol.edu.ec',
     'Resumen de límites, continuidad y derivadas con ejemplos resueltos.',
     'Practica derivadas todos los días, es la base de los siguientes temas.'),
    ('Apuntes de Cálculo de Una Variable', 'prueba', 'link',
     'Prueba 1 resuelta (2025)', 'https://drive.google.com/drive/folders/coursehub-calculo-pruebas',
     'maleon@espol.edu.ec',
     'Prueba 1 del 2025 con resoluciones paso a paso.',
     'Revisa los errores más comunes antes de rendir.'),
    ('Apuntes de Cálculo de Una Variable', 'proyecto', 'zip',
     'Proyecto final: series de Taylor', 'seed-zip-calculo-proyecto',
     'smedina@espol.edu.ec',
     'Proyecto de series de Taylor con código de ejemplo.',
     'Empiecen el proyecto con tiempo, el análisis numérico toma varias horas.'),
    ('Guías y exámenes de Álgebra Lineal', 'nota', 'pdf',
     'Guía de espacios vectoriales', 'seed-pdf-algebra-espacios',
     'maleon@espol.edu.ec',
     'Guía completa de espacios vectoriales y transformaciones lineales.',
     'Resuelve ejercicios de subespacios con distintas dimensiones.'),
    ('Guías y exámenes de Álgebra Lineal', 'prueba', 'link',
     'Exámenes pasados', 'https://drive.google.com/drive/folders/coursehub-algebra-examenes',
     'dromero@espol.edu.ec',
     'Colección de exámenes de años anteriores.',
     'El examen suele combinar dos temas en un mismo ejercicio.'),
    ('Material de Fundamentos de Programación', 'nota', 'pdf',
     'Guía de Python desde cero', 'seed-pdf-programacion-python',
     'smedina@espol.edu.ec',
     'Guía introductoria a Python con ejercicios de tarea.',
     'No avances hasta dominar bucles y condicionales.'),
    ('Material de Fundamentos de Programación', 'proyecto', 'link',
     'Proyecto: sistema de notas', 'https://github.com/cursohub/proyecto-notas',
     'anmgarci@espol.edu.ec',
     'Repositorio de ejemplo del proyecto de notas.',
     'Usa funciones pequeñas y prueba cada una por separado.'),
    ('Recursos de Sistemas de Bases de Datos', 'nota', 'zip',
     'Talleres de SQL resueltos', 'seed-zip-sql-talleres',
     'dromero@espol.edu.ec',
     'Talleres de SQL con consultas de ejemplo.',
     'Practica JOIN y subconsultas, son la parte que más pesa.'),
    ('Recursos de Sistemas de Bases de Datos', 'prueba', 'link',
     'Modelos entidad-relación (ejemplos)', 'https://drive.google.com/drive/folders/coursehub-bd-mer',
     'pmontes@espol.edu.ec',
     'Ejemplos resueltos de diagramas MER.',
     'Define bien las cardinalidades antes de crear tablas.'),
    ('Ejercicios de Estructuras de Datos', 'nota', 'pdf',
     'Apuntes de listas enlazadas', 'seed-pdf-eda-listas',
     'anmgarci@espol.edu.ec',
     'Implementación de listas enlazadas simples y dobles.',
     'Dibuja la estructura cada vez que te atores en un puntero.'),
    ('Ejercicios de Estructuras de Datos', 'prueba', 'zip',
     'Exámenes resueltos', 'seed-zip-eda-examenes',
     'maleon@espol.edu.ec',
     'Exámenes pasados con soluciones.',
     'Memoriza la complejidad de cada operación.'),
    ('Laboratorios de Inteligencia Artificial', 'nota', 'pdf',
     'Laboratorio 1: regresión lineal', 'seed-pdf-ia-lab1',
     'smedina@espol.edu.ec',
     'Laboratorio de regresión lineal con NumPy.',
     'Comprende la función de costo antes de usar las librerías.'),
    ('Laboratorios de Inteligencia Artificial', 'proyecto', 'link',
     'Dataset para el proyecto final', 'https://www.kaggle.com/datasets/coursehub-demo',
     'pmontes@espol.edu.ec',
     'Dataset público sugerido para el proyecto final.',
     'Documenta la limpieza de datos, pesa mucho en la rúbrica.'),
]

# (autor_correo, storage_key, estrellas) -> valoraciones demo.
DEMO_VALORACIONES = [
    ('anmgarci@espol.edu.ec', 'seed-pdf-calculo-limites', 5),
    ('maleon@espol.edu.ec', 'seed-pdf-calculo-limites', 4),
    ('smedina@espol.edu.ec', 'seed-pdf-calculo-limites', 5),
    ('dromero@espol.edu.ec', 'seed-pdf-calculo-limites', 4),
    ('pmontes@espol.edu.ec', 'seed-pdf-calculo-limites', 5),
    ('anmgarci@espol.edu.ec', 'seed-pdf-programacion-python', 4),
    ('maleon@espol.edu.ec', 'seed-pdf-programacion-python', 5),
    ('smedina@espol.edu.ec', 'seed-pdf-programacion-python', 4),
    ('anmgarci@espol.edu.ec', 'seed-pdf-eda-listas', 5),
    ('maleon@espol.edu.ec', 'seed-pdf-eda-listas', 3),
    ('smedina@espol.edu.ec', 'seed-pdf-ia-lab1', 5),
    ('dromero@espol.edu.ec', 'seed-pdf-ia-lab1', 4),
    ('anmgarci@espol.edu.ec', 'seed-pdf-algebra-espacios', 4),
    ('maleon@espol.edu.ec', 'seed-zip-calculo-proyecto', 5),
]


class Command(BaseCommand):
    help = 'Pobla la BD con facultades, carreras y materias de ESPOL'

    def handle(self, *args, **options):
        self._seed_facultades()
        self._seed_carreras()
        self._seed_materias()
        self._seed_carreras_materias()
        self._seed_profesores()
        self._seed_rangos()
        self._seed_estudiantes_demo()
        self._seed_colecciones()
        self._seed_recursos()
        self._seed_valoraciones()
        self._seed_admin()
        self.stdout.write(self.style.SUCCESS('Seed completado exitosamente.'))

    def _seed_facultades(self):
        for pk, nombre in FACULTADES:
            Facultad.objects.update_or_create(
                id=pk, defaults={'nombre': nombre},
            )
        self.stdout.write(f'  {len(FACULTADES)} facultades creadas.')

    def _seed_carreras(self):
        for pk, nombre, facultad_id in CARRERAS:
            Carrera.objects.update_or_create(
                id=pk,
                defaults={'nombre': nombre, 'facultad_id': facultad_id},
            )
        self.stdout.write(f'  {len(CARRERAS)} carreras creadas.')

    def _seed_materias(self):
        for pk, codigo, nombre in MATERIAS:
            materia, _ = Materia.objects.update_or_create(
                id=pk, defaults={'codigo': codigo, 'nombre': nombre},
            )
            CODIGO_MATERIA_MAP[codigo] = materia
        self.stdout.write(f'  {len(MATERIAS)} materias creadas.')

    def _seed_carreras_materias(self):
        count = 0
        for codigo in CDIA_MATERIAS:
            materia = CODIGO_MATERIA_MAP.get(codigo)
            if not materia:
                self.stdout.write(self.style.WARNING(f'  Materia {codigo} no encontrada, saltando.'))
                continue
            _, created = CarreraMateria.objects.get_or_create(
                carrera_id=1, materia=materia,
            )
            if created:
                count += 1

        for codigo in COMP_MATERIAS:
            materia = CODIGO_MATERIA_MAP.get(codigo)
            if not materia:
                self.stdout.write(self.style.WARNING(f'  Materia {codigo} no encontrada, saltando.'))
                continue
            _, created = CarreraMateria.objects.get_or_create(
                carrera_id=2, materia=materia,
            )
            if created:
                count += 1

        self.stdout.write(f'  {count} relaciones carrera-materia creadas.')

    def _seed_profesores(self):
        for pk, nombre in enumerate(PROFESORES, start=1):
            Profesor.objects.update_or_create(
                id=pk, defaults={'nombre': nombre},
            )
        self.stdout.write(
            self.style.WARNING(
                f'  {len(PROFESORES)} profesores de ejemplo creados '
                '(reemplazar con datos reales).'
            )
        )

    def _seed_rangos(self):
        for nombre, karma_minimo in RANGOS:
            Rango.objects.update_or_create(
                nombre_rango=nombre,
                defaults={'karma_minimo': karma_minimo},
            )
        self.stdout.write(f'  {len(RANGOS)} rangos creados.')

    def _seed_estudiantes_demo(self):
        count = 0
        for correo, pseudonimo, karma in ESTUDIANTES_DEMO:
            usuario, created = Usuario.objects.get_or_create(
                correo_institucional=correo,
                defaults={
                    'pseudonimo': pseudonimo,
                    'rol': Usuario.Rol.ESTUDIANTE,
                    'karma_acumulado': karma,
                },
            )
            if created:
                usuario.set_password('123456')
                usuario.save(update_fields=['password'])
                count += 1
        self.stdout.write(
            f'  {count} estudiantes demo creados '
            '(password: 123456, usar solo el usuario como login).'
        )

    def _seed_colecciones(self):
        count = 0
        for codigo, titulo, profesor_idx in DEMO_COLECCIONES:
            materia = Materia.objects.filter(codigo=codigo).first()
            if not materia:
                continue
            _, created = Coleccion.objects.get_or_create(
                titulo=titulo,
                materia=materia,
                defaults={
                    'profesor_id': profesor_idx + 1,
                    'anio_semestre': '2026-1S',
                },
            )
            if created:
                count += 1
        self.stdout.write(f'  {count} colecciones demo creadas.')

    def _seed_recursos(self):
        count = 0
        for (
            coleccion_titulo, categoria, tipo, nombre_archivo,
            storage_key, autor_correo, descripcion, consejo,
        ) in DEMO_RECURSOS:
            coleccion = Coleccion.objects.filter(titulo=coleccion_titulo).first()
            autor = Usuario.objects.filter(correo_institucional=autor_correo).first()
            if not coleccion or not autor:
                continue
            recurso, created = Recurso.objects.get_or_create(
                storage_key=storage_key,
                defaults={
                    'coleccion': coleccion,
                    'usuario': autor,
                    'categoria': categoria,
                    'tipo_recurso': tipo,
                    'nombre_archivo': nombre_archivo,
                    'descripcion': descripcion,
                    'consejo_estudio': consejo,
                },
            )
            if created:
                if tipo == 'pdf':
                    recurso.archivo = ContentFile(
                        self._pdf_bytes(nombre_archivo),
                        name=f'seed_{storage_key}.pdf',
                    )
                elif tipo == 'zip':
                    recurso.archivo = ContentFile(
                        self._zip_bytes(nombre_archivo),
                        name=f'seed_{storage_key}.zip',
                    )
                recurso.save()
                count += 1
        self.stdout.write(f'  {count} recursos demo creados.')

    def _seed_valoraciones(self):
        from apps.interaction.models import Valoracion

        count = 0
        for autor_correo, storage_key, estrellas in DEMO_VALORACIONES:
            autor = Usuario.objects.filter(correo_institucional=autor_correo).first()
            recurso = Recurso.objects.filter(storage_key=storage_key).first()
            if not autor or not recurso:
                continue
            _, created = Valoracion.objects.get_or_create(
                usuario=autor,
                recurso=recurso,
                defaults={'estrellas': estrellas},
            )
            if created:
                count += 1
        self.stdout.write(f'  {count} valoraciones demo creadas.')

    def _pdf_bytes(self, texto):
        lines = [
            f'BT /F1 16 Tf 72 700 Td ({texto[:60]} - CourseHub) Tj ET',
        ]
        stream = b'\n'.join(line.encode() for line in lines) + b'\n'
        objects = [
            b'<< /Type /Catalog /Pages 2 0 R >>',
            b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            (
                b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] '
                b'/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>'
            ),
            b'<< /Length ' + str(len(stream)).encode() + b' >>\nstream\n' + stream + b'endstream',
            b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ]
        out = [b'%PDF-1.4\n']
        offsets = [0]
        for i, obj in enumerate(objects, start=1):
            offsets.append(len(out[0]))
            out[0] += f'{i} 0 obj\n'.encode() + obj + b'\nendobj\n'
        xref = len(out[0])
        out[0] += b'xref\n0 6\n0000000000 65535 f \n'
        for off in offsets[1:]:
            out[0] += f'{off:010d} 00000 n \n'.encode()
        out[0] += (
            f'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
        )
        return out[0]

    def _zip_bytes(self, nombre):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('README.txt', f'{nombre} - material de CourseHub (demo)\n')
            zf.writestr('ejercicios.txt', '1) Resuelva los ejercicios propuestos.\n')
        return buffer.getvalue()

    def _seed_admin(self):
        correo = os.environ.get('SEED_ADMIN_EMAIL', 'admin@espol.edu.ec')
        password = os.environ.get('SEED_ADMIN_PASSWORD', 'AdminEspol2026!')
        pseudonimo = os.environ.get('SEED_ADMIN_PSEUDONIMO', 'Admin_CourseHub')

        admin, created = Usuario.objects.get_or_create(
            correo_institucional=correo,
            defaults={
                'pseudonimo': pseudonimo,
                'rol': Usuario.Rol.ADMINISTRADOR,
                'is_staff': True,
                'microsoft_id': str(uuid.uuid4()),
            },
        )
        if created:
            admin.set_password(password)
            admin.save(update_fields=['password'])
            self.stdout.write(f'  Usuario admin creado: {correo}')
        else:
            admin.rol = Usuario.Rol.ADMINISTRADOR
            admin.is_staff = True
            admin.save(update_fields=['rol', 'is_staff'])
            self.stdout.write(f'  Usuario admin actualizado: {correo}')
