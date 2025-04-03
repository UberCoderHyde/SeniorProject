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
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'instructions', 'image', 'recipeIngred',
            'cleaned_ingredients', 'average_rating', 'review_count'
        ]


class RecipeListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    cleaned_ingredients = IngredientSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'image', 'cleaned_ingredients',
            'average_rating', 'review_count'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.email")
    recipe = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "user", "recipe", "rating", "review_text", "timestamp"]