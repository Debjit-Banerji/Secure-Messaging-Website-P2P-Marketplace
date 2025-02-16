# api/migrations/0002_update_user_schema.py
from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_superuser',
            field=models.BooleanField(default=False, verbose_name='superuser status'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_staff',
            field=models.BooleanField(default=False, verbose_name='staff status'),
        ),
        migrations.AddField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='active'),
        ),
        migrations.AddField(
            model_name='user',
            name='date_joined',
            field=models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined'),
        ),
    ]
