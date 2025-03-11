from django.urls import path
from .views import (
    IngredientListCreate, PantryItemListCreate, PantryItemRetrieveUpdateDelete,
    RecipeListCreate, RecipeRetrieveUpdateDelete, GenerateShoppingListView
)

urlpatterns = [
    path('ingredients/', IngredientListCreate.as_view(), name='ingredient-list-create'),
    path('pantry/', PantryItemListCreate.as_view(), name='pantry-list-create'),
    path('pantry/<int:pk>/', PantryItemRetrieveUpdateDelete.as_view(), name='pantry-item-detail'),
    path('recipes/', RecipeListCreate.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', RecipeRetrieveUpdateDelete.as_view(), name='recipe-detail'),
    path('recipes/<int:recipe_id>/shopping-list/', GenerateShoppingListView.as_view(), name="generate_shopping_list"),
]
