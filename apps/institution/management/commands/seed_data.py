from django.core.management.base import BaseCommand

from apps.institution.models import Carrera, CarreraMateria, Facultad, Materia


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


class Command(BaseCommand):
    help = 'Pobla la BD con facultades, carreras y materias de ESPOL'

    def handle(self, *args, **options):
        self._seed_facultades()
        self._seed_carreras()
        self._seed_materias()
        self._seed_carreras_materias()
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
