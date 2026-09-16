from django.db import migrations, models
import django.db.models.deletion


def _copiar_materias_desde_colecciones(apps, schema_editor):
    recurso_model = apps.get_model('content', 'Recurso')
    recursos = recurso_model.objects.filter(
        materia__isnull=True,
        coleccion__isnull=False,
    ).select_related('coleccion')
    for recurso in recursos.iterator():
        recurso_model.objects.filter(pk=recurso.pk).update(
            materia_id=recurso.coleccion.materia_id,
        )


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0004_recurso_url_alter_recurso_archivo'),
        ('institution', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='recurso',
            name='materia',
            field=models.ForeignKey(
                blank=True,
                db_column='materia_id',
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='recursos',
                to='institution.materia',
            ),
        ),
        migrations.RunPython(
            code=_copiar_materias_desde_colecciones,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
