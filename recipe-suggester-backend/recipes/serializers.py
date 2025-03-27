from rest_framework import serializers, generics, permissions
from .models import Ingredient, PantryItem, Recipe, RecipeIngredient, Review
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'description']

class PantryItemSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingredient.objects.all(), source='ingredient', write_only=True
    )

    class Meta:
        model = PantryItem
        fields = ['id', 'ingredient', 'ingredient_id']

class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient', 'quantity']

class RecipeSerializer(serializers.ModelSerializer):
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False)  # Updated field name

    class Meta:
        model = Recipe
        # Replace image_url with image
        fields = ['id', 'title', 'instructions', 'image', 'recipe_ingredients']
 
class RecipeListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'image', 'ingredients']

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
