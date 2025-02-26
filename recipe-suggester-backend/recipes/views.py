from decimal import Decimal
from rest_framework import generics, permissions
from .models import Ingredient, PantryItem
from .serializers import IngredientSerializer, PantryItemSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

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
        # Retrieve the ingredient and quantity from validated data.
        ingredient = serializer.validated_data.get("ingredient")
        quantity = serializer.validated_data.get("quantity")
        try:
            # Check if a pantry item already exists for this ingredient and user.
            pantry_item = PantryItem.objects.get(user=self.request.user, ingredient=ingredient)
            # Update the quantity.
            pantry_item.quantity = pantry_item.quantity + Decimal(quantity)
            pantry_item.save()
            # Set serializer.instance so that the representation uses the updated model instance.
            serializer.instance = pantry_item
        except PantryItem.DoesNotExist:
            # If it doesn't exist, create a new record.
            serializer.save(user=self.request.user)

class PantryItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)
