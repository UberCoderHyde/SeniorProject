from rest_framework import serializers
from .models import Ingredient, PantryItem

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'description']

class PantryItemSerializer(serializers.ModelSerializer):
    # Show detailed ingredient info when reading.
    ingredient = IngredientSerializer(read_only=True)
    # When creating/updating, use ingredient_id.
    ingredient_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(),
        source='ingredient',
        write_only=True
    )
    formatted_quantity = serializers.SerializerMethodField()

    class Meta:
        model = PantryItem
        fields = ['id', 'ingredient', 'ingredient_id', 'quantity', 'formatted_quantity']

    def get_formatted_quantity(self, obj):
        return obj.formatted_quantity
