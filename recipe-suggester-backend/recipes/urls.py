from django.urls import path
from .views import (
    IngredientListCreate, PantryItemListCreate, PantryItemRetrieveUpdateDelete,
    RecipeListCreate, RecipeListPaginatedByDiet, RecipeRetrieveUpdateDelete, RecipeListMinimalView,
    ReviewListCreate, RecipeFavoritesList, BrowseRecipesView, toggle_favorite
)

urlpatterns = [
    path('ingredients/', IngredientListCreate.as_view(), name='ingredient-list-create'),
    path('pantry/', PantryItemListCreate.as_view(), name='pantry-list-create'),
    path('pantry/<int:pk>/', PantryItemRetrieveUpdateDelete.as_view(), name='pantry-item-detail'),
    path('recipes/', RecipeListCreate.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', RecipeRetrieveUpdateDelete.as_view(), name='recipe-detail'),
    path('recipes/minimal/', RecipeListMinimalView.as_view(), name='recipe-list-minimal'),
    path("recipes/<int:pk>/reviews/", ReviewListCreate.as_view(), name="review-list-create"),
    path("recipes/favorites/", RecipeFavoritesList.as_view(), name="recipe-favorites"),
    path('recipes/paginated/', RecipeListPaginatedByDiet.as_view(), name='paginated-recipes'),
    path('recipes/browse/', BrowseRecipesView.as_view(), name='browse-recipes'),
    path('recipes/<int:recipe_id>/toggle-favorite/', toggle_favorite, name='toggle-favorite'),
]