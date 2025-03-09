from rest_framework import serializers
from .models import Ingredient, PantryItem, Recipe, RecipeIngredient

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'description']

class PantryItemSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(), source='ingredient', write_only=True
    )
    formatted_quantity = serializers.SerializerMethodField()

    class Meta:
        model = PantryItem
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'formatted_quantity']

    def get_formatted_quantity(self, obj):
        return obj.formatted_quantity

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient', 'quantity']

class RecipeSerializer(serializers.ModelSerializer):
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'instructions', 'image_url', 'recipe_ingredients']
