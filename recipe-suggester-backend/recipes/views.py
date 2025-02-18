from rest_framework import generics, permissions
from .models import Ingredient, PantryItem
from .serializers import IngredientSerializer, PantryItemSerializer

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
        serializer.save(user=self.request.user)

class PantryItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)
