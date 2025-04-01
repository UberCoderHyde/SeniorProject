from rest_framework import generics, permissions
from django.db.models import Q
from .models import Ingredient, PantryItem, Recipe, Review  # plus FavoriteRecipe if you have one
from .serializers import (
    IngredientSerializer, PantryItemSerializer, RecipeSerializer,
    RecipeListSerializer, ReviewSerializer
)
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import random

class IngredientListCreate(generics.ListCreateAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

@method_decorator(csrf_exempt, name='dispatch')
class PantryItemListCreate(generics.ListCreateAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ingredient = serializer.validated_data.get("ingredient")
        # Avoid duplicate pantry items for the user.
        if PantryItem.objects.filter(user=self.request.user, ingredient=ingredient).exists():
            return
        serializer.save(user=self.request.user)

class PantryItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)

class RecipeListCreate(generics.ListCreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.all()
        query = self.request.query_params.get('query')
        if query:
            # Search recipes by title or by one of its ingredients.
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(ingredients__name__icontains=query)
            ).distinct()
        elif self.request.query_params.get('random') == 'true':
            queryset = queryset.order_by('?')[:20]
        return queryset

class RecipeRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class RecipeListMinimalView(generics.ListAPIView):
    """
    Returns a minimal list of recipes (id, title, image, ingredients) for faster loading.
    Supports 'random=true', 'query', and dietary filters.
    """
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.all()
        query = self.request.query_params.get('query')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(ingredients__name__icontains=query)
            ).distinct()
        elif self.request.query_params.get('random') == 'true':
            recipe_ids = list(queryset.values_list('id', flat=True))
            if len(recipe_ids) > 20:
                random_ids = random.sample(recipe_ids, 20)
                queryset = queryset.filter(id__in=random_ids)
        elif self.request.query_params.get('diet'):
            # Assuming your Recipe model or related data contains dietary info
            diet = self.request.query_params.get('diet')
            queryset = queryset.filter(dietary__icontains=diet).distinct()
        return queryset

# View for Reviews remains unchanged.
class ReviewListCreate(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permissions_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        recipe_id = self.kwargs["recipe_id"]
        return Review.objects.filter(recipe_id=recipe_id)
    
    def perform_create(self, serializer):
        recipe_id = self.kwargs["recipe_id"]
        serializer.save(user=self.request.user, recipe_id=recipe_id)

class RecipeFavoritesList(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.favorite_recipes.all()
