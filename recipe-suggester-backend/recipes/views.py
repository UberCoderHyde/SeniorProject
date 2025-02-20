from rest_framework import generics, permissions
from .models import Ingredient, PantryItem
from .serializers import IngredientSerializer, PantryItemSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from decimal import Decimal

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
        # Get the ingredient and quantity from the validated data.
        ingredient = serializer.validated_data.get("ingredient")
        quantity = serializer.validated_data.get("quantity")
        
        # Check if a pantry item for this ingredient already exists for the user.
        try:
            pantry_item = PantryItem.objects.get(user=self.request.user, ingredient=ingredient)
            # If it exists, update the quantity by adding the new amount.
            pantry_item.quantity = pantry_item.quantity + Decimal(quantity)
            pantry_item.save()
        except PantryItem.DoesNotExist:
            # If it doesn't exist, create a new record.
            serializer.save(user=self.request.user)

class PantryItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)
