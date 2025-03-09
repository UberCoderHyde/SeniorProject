from decimal import Decimal
from rest_framework import generics, permissions
from .models import Ingredient, PantryItem, Recipe
from .serializers import IngredientSerializer, PantryItemSerializer, RecipeSerializer

class IngredientListCreate(generics.ListCreateAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class PantryItemListCreate(generics.ListCreateAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Try to update an existing pantry item instead of creating a duplicate.
        ingredient = serializer.validated_data.get("ingredient")
        quantity = serializer.validated_data.get("quantity")
        try:
            pantry_item = PantryItem.objects.get(user=self.request.user, ingredient=ingredient)
            pantry_item.quantity = pantry_item.quantity + Decimal(quantity)
            pantry_item.save()
            serializer.instance = pantry_item  # set the serializer's instance for representation
        except PantryItem.DoesNotExist:
            serializer.save(user=self.request.user)

class PantryItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)

class RecipeListCreate(generics.ListCreateAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class RecipeRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
