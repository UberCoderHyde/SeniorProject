# Generated by Django 5.1.6 on 2025-02-18 05:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='recipe',
            name='image_url',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pics/'),
        ),
    ]
