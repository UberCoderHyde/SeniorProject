from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.db.models import Avg, Count, Q, Prefetch
import random

from .models import Ingredient, PantryItem, Recipe, Review
from .serializers import (
    IngredientSerializer, PantryItemSerializer, RecipeSerializer,
    RecipeListSerializer, RecipeSuggestionSerializer, ReviewSerializer,
    RecipeCreateSerializer
)

# Toggle favorite recipes (existing)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def toggle_favorite(request, recipe_id):
    try:
        recipe = Recipe.objects.get(id=recipe_id)
    except Recipe.DoesNotExist:
        return Response({"detail": "Recipe not found."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if recipe in user.favorite_recipes.all():
        user.favorite_recipes.remove(recipe)
        return Response({"favorited": False})
    else:
        user.favorite_recipes.add(recipe)
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

# Task #47: Toggle a pantry ingredient in/out
class TogglePantryItem(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, ingredient_id):
        user = request.user
        try:
            pi = PantryItem.objects.get(user=user, ingredient_id=ingredient_id)
            pi.delete()
            return Response({"ingredient_id": ingredient_id, "in_pantry": False}, status=status.HTTP_200_OK)
        except PantryItem.DoesNotExist:
            PantryItem.objects.create(user=user, ingredient_id=ingredient_id)
            return Response({"ingredient_id": ingredient_id, "in_pantry": True}, status=status.HTTP_201_CREATED)

# Task #53: Trending ingredients
class TrendingIngredientsView(generics.ListAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return (
            Ingredient.objects
            .annotate(pantry_count=Count('pantry_items'))
            .order_by('-pantry_count')[:10]
        )

# Recipe list & detail
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

# Minimal list for carousels, with search, diet, trending, favorite, random
class RecipeListMinimalView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )
        params = self.request.query_params

        if params.get('search'):
            q = params['search']
            qs = qs.filter(Q(title__icontains=q) | Q(recipeIngred__icontains=q)).distinct()

        if params.get('diet'):
            qs = qs.filter(dietary_tags__contains=[params['diet']]).distinct()[:20]

        elif params.get('trending') == 'true':
            cached = cache.get("trending_recipes")
            if cached is not None:
                return cached
            top = qs.annotate(num_reviews=Count('reviews')).order_by('-num_reviews')[:20]
            cache.set("trending_recipes", top, 300)
            return top

        elif params.get('favorite') == 'true' and self.request.user.is_authenticated:
            return self.request.user.favorite_recipes.annotate(
                average_rating=Avg("reviews__rating"),
                review_count=Count("reviews")
            ).distinct()[:20]

        elif params.get('random') == 'true':
            cached = cache.get("random_recipes")
            if cached is not None:
                return cached
            ids = list(qs.values_list('id', flat=True))
            sample = random.sample(ids, min(len(ids), 20))
            rand_qs = qs.filter(id__in=sample)
            cache.set("random_recipes", rand_qs, 300)
            return rand_qs

        return qs.distinct()[:20]

# Reviews
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

# Pagination helper
class LimitedPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 50

# Browse view
class BrowseRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = LimitedPagination

    def get_queryset(self):
        return Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        ).order_by('id')

# Task #54 & #55: Suggestions
class SuggestRecipesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1) what ingredients the user already has
        have_ids = set(
            PantryItem.objects
            .filter(user=request.user)
            .values_list('ingredient_id', flat=True)
        )

        suggestions = []
        # 2) loop every recipe, use its cleaned_ingredients list
        for recipe in Recipe.objects.all():
            ingredients = recipe.cleaned_ingredients  # list of Ingredient instances
            req_ids = {ing.id for ing in ingredients}
            missing_ids = req_ids - have_ids

            suggestions.append({
                'id': recipe.id,
                'title': recipe.title,
                'image': recipe.image.url if recipe.image else None,
                'missing_count': len(missing_ids),
                'missing_ingredients': [
                    ing.name for ing in ingredients
                    if ing.id in missing_ids
                ]
            })

        # 3) sort by fewest missing ingredients first
        suggestions.sort(key=lambda s: s['missing_count'])

        # 4) optional filters
        if request.query_params.get('can_make') == 'true':
            suggestions = [s for s in suggestions if s['missing_count'] == 0]

        if (t := request.query_params.get('threshold')) is not None:
            try:
                thr = int(t)
                suggestions = [s for s in suggestions if s['missing_count'] <= thr]
            except ValueError:
                # ignore non-integer thresholds
                pass

        # 5) serialize & return
        return Response(RecipeSuggestionSerializer(suggestions, many=True).data)
    
class GroceryListView(APIView):
    """
    GET /api/grocery-list/?recipes=1,2,3
    Returns the deduplicated list of ingredients the user is missing
    across the given recipe IDs.
    """
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
            return Response(
                {"detail": "Invalid recipe IDs format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # What the user already has:
        have = set(
            PantryItem.objects
            .filter(user=request.user)
            .values_list('ingredient_id', flat=True)
        )

        missing_ids = set()
        # For each recipe, collect missing ingredient IDs via cleaned_ingredients
        for recipe in Recipe.objects.filter(id__in=ids):
            req_ids = {ing.id for ing in recipe.cleaned_ingredients}
            missing_ids |= (req_ids - have)

        # Serialize the missing ingredients
        missing_qs = Ingredient.objects.filter(id__in=missing_ids).order_by('name')
        serializer = IngredientSerializer(missing_qs, many=True)
        return Response(serializer.data)
    
class CreateRecipeView(APIView):
    def post(self, request):
        #extract incoming request data.
        serializer = RecipeCreateSerializer(data=request.data)
        #validate the input data
        if serializer.is_valid():
            #Save the recipe.
            serializer.save()
            #return success reponse
            return Response({'message': 'Recipe created successfully', 'data': serializer.data}, status=status.HTTP_201_CREATED)
        #return error response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)