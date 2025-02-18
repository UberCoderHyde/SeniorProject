from rest_framework import serializers
from .models import Ingredient, PantryItem

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'description']

class PantryItemSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
        source='ingredient',
        write_only=True
    )

    class Meta:
        model = PantryItem
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity']
