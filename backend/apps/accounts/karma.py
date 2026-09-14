from django.db.models import F

KARMA_SUBIR_RECURSO = 10
KARMA_ESTRELLAS = {5: 5, 4: 3}


def puntos_por_estrellas(estrellas):
    return KARMA_ESTRELLAS.get(estrellas, 0)


def otorgar_karma(usuario, puntos):
    if usuario is None or puntos <= 0:
        return 0
    usuario.karma_acumulado = F('karma_acumulado') + puntos
    usuario.save(update_fields=['karma_acumulado'])
    usuario.refresh_from_db(fields=['karma_acumulado'])
    return usuario.karma_acumulado