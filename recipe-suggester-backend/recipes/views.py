from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.cache import cache
from django.db.models import Avg, Count, Q
import random

from .models import Ingredient, PantryItem, Recipe, Review, Note
from .serializers import (
    IngredientSerializer, PantryItemSerializer, RecipeSerializer,
    RecipeListSerializer, RecipeSuggestionSerializer, ReviewSerializer,
    RecipeCreateSerializer, NoteSerializer
)

# Toggle favorite recipes
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request, recipe_id):
    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return Response({"detail": "Recipe not found."}, status=status.HTTP_404_NOT_FOUND)

    if recipe in request.user.favorite_recipes.all():
        request.user.favorite_recipes.remove(recipe)
        return Response({"favorited": False})
    else:
        request.user.favorite_recipes.add(recipe)
        return Response({"favorited": True})

# Ingredient CRUD
class IngredientListCreate(generics.ListCreateAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Pantry CRUD
@method_decorator(csrf_exempt, name='dispatch')
class PantryItemListCreate(generics.ListCreateAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        ingredient = serializer.validated_data.get("ingredient")
        if not PantryItem.objects.filter(user=self.request.user, ingredient=ingredient).exists():
            serializer.save(user=self.request.user)

class PantryItemRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PantryItem.objects.filter(user=self.request.user)

# Toggle pantry ingredient
class TogglePantryItem(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ingredient_id):
        user = request.user
        try:
            pi = PantryItem.objects.get(user=user, ingredient_id=ingredient_id)
            pi.delete()
            return Response({"ingredient_id": ingredient_id, "in_pantry": False})
        except PantryItem.DoesNotExist:
            PantryItem.objects.create(user=user, ingredient_id=ingredient_id)
            return Response({"ingredient_id": ingredient_id, "in_pantry": True}, status=status.HTTP_201_CREATED)

# Trending ingredients
class TrendingIngredientsView(generics.ListAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Ingredient.objects.annotate(pantry_count=Count('pantry_items')).order_by('-pantry_count')[:10]

# Recipes CRUD
class RecipeListCreate(generics.ListCreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )

class RecipeRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.annotate(
        average_rating=Avg("reviews__rating"),
        review_count=Count("reviews")
    )
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Minimal list for carousels
class RecipeListMinimalView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )
        params = self.request.query_params

        if (q := params.get('search')):
            qs = qs.filter(Q(title__icontains=q) | Q(recipeIngred__icontains=q)).distinct()

        if (diet := params.get('diet')):
            return qs.filter(dietary_tags__contains=[diet]).distinct()[:20]

        if params.get('trending') == 'true':
            cached = cache.get("trending_recipes")
            if cached is not None:
                return cached
            top = qs.annotate(num_reviews=Count('reviews')).order_by('-num_reviews')[:20]
            cache.set("trending_recipes", top, 300)
            return top

        if params.get('favorite') == 'true' and self.request.user.is_authenticated:
            return self.request.user.favorite_recipes.annotate(
                average_rating=Avg("reviews__rating"),
                review_count=Count("reviews")
            ).distinct()[:20]

        if params.get('random') == 'true':
            cached = cache.get("random_recipes")
            if cached is not None:
                return cached
            ids = list(qs.values_list('id', flat=True))
            sample = random.sample(ids, min(len(ids), 20))
            rand_qs = qs.filter(id__in=sample)
            cache.set("random_recipes", rand_qs, 300)
            return rand_qs

        return qs.distinct()[:20]

# Suggestions – optimized
class SuggestRecipesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        have_ids = set(
            PantryItem.objects
            .filter(user=request.user)
            .values_list('ingredient_id', flat=True)
        )

        can_make = request.query_params.get("can_make") == "true"
        threshold = request.query_params.get("threshold")

        ingredient_map = {
            ing.id: ing.name
            for ing in Ingredient.objects.all()
        }

        suggestions = []

        for recipe in Recipe.objects.all():
            req_ids = set(recipe.ingredient_ids)
            missing_ids = req_ids - have_ids
            missing_count = len(missing_ids)

            # Only include makeable recipes if can_make=true
            if can_make:
                if missing_count == 0:
                    suggestions.append({
                        'id': recipe.id,
                        'title': recipe.title,
                        'image': recipe.image.url if recipe.image else None,
                        'missing_count': 0,
                        'missing_ingredients': []
                    })
                continue  # skip threshold/default logic when can_make=true

            # Only include almost-there recipes if threshold is set and > 0 missing
            if threshold is not None:
                try:
                    t = int(threshold)
                    if 0 < missing_count <= t:
                        suggestions.append({
                            'id': recipe.id,
                            'title': recipe.title,
                            'image': recipe.image.url if recipe.image else None,
                            'missing_count': missing_count,
                            'missing_ingredients': [ingredient_map[mid] for mid in missing_ids]
                        })
                except ValueError:
                    pass
                continue  # skip default logic if threshold filtering applied

            # Default case: include all
            suggestions.append({
                'id': recipe.id,
                'title': recipe.title,
                'image': recipe.image.url if recipe.image else None,
                'missing_count': missing_count,
                'missing_ingredients': [ingredient_map[mid] for mid in missing_ids]
            })

        suggestions.sort(key=lambda s: s['missing_count'])
        suggestions = suggestions[:20]

        return Response(RecipeSuggestionSerializer(suggestions, many=True).data)


# Grocery List
class GroceryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recipe_ids = request.query_params.get('recipes')
        if not recipe_ids:
            return Response(
                {"detail": "Please provide recipe IDs, e.g. ?recipes=1,2,3"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            ids = [int(x) for x in recipe_ids.split(',') if x.strip()]
        except ValueError:
            return Response({"detail": "Invalid recipe IDs format."}, status=status.HTTP_400_BAD_REQUEST)

        have = set(
            PantryItem.objects
            .filter(user=request.user)
            .values_list('ingredient_id', flat=True)
        )

        missing_ids = set()
        for recipe in Recipe.objects.filter(id__in=ids):
            req_ids = set(recipe.ingredient_ids)
            missing_ids |= (req_ids - have)

        missing_qs = Ingredient.objects.filter(id__in=missing_ids).order_by('name')
        return Response(IngredientSerializer(missing_qs, many=True).data)

# Recipe Creation
class CreateRecipeView(APIView):
    """
    POST /api/recipes/create/
    Allows authenticated users to create a new Recipe, including an optional image.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        serializer = RecipeCreateSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        recipe = serializer.save()
        # Re-serialize the saved instance so you get all read-only fields, IDs, etc.
        out = RecipeCreateSerializer(recipe)
        return Response(
            {'message': 'Recipe created successfully', 'data': out.data},
            status=status.HTTP_201_CREATED
        )

# Review list/create
class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(recipe_id=self.kwargs["pk"])

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, recipe_id=self.kwargs["pk"])

# Favorite recipes list
class RecipeFavoritesList(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.favorite_recipes.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )

# Browse all recipes with pagination
class BrowseRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        return Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        ).order_by('id')

class NoteDetailCRUD(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request,pk):
        try:
            note = Note.objects.get(user=request.user,recipe_id=pk)
            serializer = NoteSerializer(note)
            return Response(serializer.data)
        except Note.DoesNotExist:
            return Response({"detail": "Note Not Found."}, status=status.HTTP_404_NOT_FOUND)
        
    def post(self,request,pk):
        try:
            Note.objects.get(user=request.user,recipe_id=pk)
            return Response({"detail":"Note already exists."},status=status.HTTP_400_BAD_REQUEST)
        except Note.DoesNotExist:
            serializer = NoteSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, recipe_id=pk)
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
    def put(self,request,pk):
        try:
            note = Note.objects.get(user=request.user,recipe_id=pk)
            serializer = NoteSerializer(note,data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        except Note.DoesNotExist:
            return Response({"detail": "Note not found."},status=status.HTTP_404_NOT_FOUND)
        
    def delete(self,request,pk):
        try:
            note=Note.objects.get(user=request.user,recipe_id=pk)
            note.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Note.DoesNotExist:
            return Response({"detail": "Note not found."},status=status.HTTP_404_NOT_FOUND)