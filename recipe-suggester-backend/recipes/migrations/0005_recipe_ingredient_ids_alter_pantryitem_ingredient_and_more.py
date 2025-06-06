# Generated by Django 5.0.1 on 2025-04-24 15:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipes', '0004_recipe_dietary_tags_review'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='ingredient_ids',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='pantryitem',
            name='ingredient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pantry_items', to='recipes.ingredient'),
        ),
        migrations.AlterField(
            model_name='review',
            name='rating',
            field=models.IntegerField(choices=[(1, '1 star'), (2, '2 star'), (3, '3 star'), (4, '4 star'), (5, '5 star')]),
        ),
    ]
