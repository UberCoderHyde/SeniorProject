from rest_framework import serializers
from .models import Ingredient, PantryItem, Recipe, Review

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name']


class PantryItemSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(), source='ingredient', write_only=True
    )

    class Meta:
        model = PantryItem
        fields = ['id', 'ingredient', 'ingredient_id']


class RecipeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    cleaned_ingredients = IngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'instructions', 'image', 'recipeIngred', 'cleaned_ingredients']


class RecipeListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    cleaned_ingredients = IngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'cleaned_ingredients']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_ingredients(self, obj):
        return list(obj.ingredients.values_list('name', flat=True))
    

class ReviewSerializer(serializers.ModelSerializer):
    # Show user's email for the user field
    user = serializers.ReadOnlyField(source="user.email")

    # Don't nest the recipe field with the full recipe object
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), write_only=True)

    class Meta:
        model = Review
        fields = ["id", "user", "recipe", "rating", "review_text", "timestamp"]
