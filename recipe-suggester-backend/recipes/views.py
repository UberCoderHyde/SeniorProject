from rest_framework import generics, permissions
from .models import Ingredient, PantryItem, Recipe
from .serializers import IngredientSerializer, PantryItemSerializer, RecipeSerializer, RecipeListSerializer
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
        # Check if the pantry item already exists for this user.
        if PantryItem.objects.filter(user=self.request.user, ingredient=ingredient).exists():
            # Option 1: Do nothing (ignore duplicate)
            # Option 2: Raise an error or return a custom response.
            # For this example, we'll simply not create a duplicate.
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
        if self.request.query_params.get('random') == 'true':
            # Order randomly and limit the result to 20 recipes.
            queryset = queryset.order_by('?')[:20]
        return queryset

class RecipeRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class RecipeListMinimalView(generics.ListAPIView):
    """
    Returns a minimal list of recipes (id, title, image, ingredients)
    for faster loading. Supports a 'random=true' query parameter to
    return 20 random recipes.
    """
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.all().prefetch_related('ingredients')
        if self.request.query_params.get('random') == 'true':
            # Get all IDs quickly.
            recipe_ids = list(queryset.values_list('id', flat=True))
            if len(recipe_ids) > 20:
                # Randomly sample 20 IDs.
                random_ids = random.sample(recipe_ids, 20)
                queryset = queryset.filter(id__in=random_ids)
        return queryset
