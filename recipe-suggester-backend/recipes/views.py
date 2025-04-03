# views.py
from rest_framework import generics, permissions, status
from .models import Ingredient, PantryItem, Recipe, Review
from .serializers import IngredientSerializer, PantryItemSerializer, RecipeSerializer, RecipeListSerializer, ReviewSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.cache import cache
from django.db.models import Avg, Count
import random


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
        queryset = Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )
        if self.request.query_params.get('random') == 'true':
            queryset = queryset.order_by('?')[:20]
        return queryset

class RecipeRetrieveUpdateDelete(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.annotate(
        average_rating=Avg("reviews__rating"),
        review_count=Count("reviews")
    )
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class RecipeListMinimalView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )

        if self.request.query_params.get('diet'):
            diet = self.request.query_params['diet']
            return queryset.filter(dietary_tags__contains=[diet]).distinct()[:20]

        if self.request.query_params.get('favorite') == 'true':
            if self.request.user.is_authenticated:
                return self.request.user.favorite_recipes.annotate(
                    average_rating=Avg("reviews__rating"),
                    review_count=Count("reviews")
                ).distinct()[:20]
            return Recipe.objects.none()

        if self.request.query_params.get('random') == 'true':
            cached = cache.get("random_recipes")
            if cached:
                return cached
            recipe_ids = list(queryset.values_list('id', flat=True))
            if len(recipe_ids) > 20:
                sample_ids = random.sample(recipe_ids, 20)
                result = queryset.filter(id__in=sample_ids)
                cache.set("random_recipes", result, 300)
                return result
            return queryset

        return queryset.distinct()[:20]

class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        recipe_id = self.kwargs["pk"]
        return Review.objects.filter(recipe_id=recipe_id)

    def perform_create(self, serializer):
        recipe_id = self.kwargs["pk"]
        serializer.save(user=self.request.user, recipe_id=recipe_id)

class RecipeFavoritesList(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.favorite_recipes.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        )

class LimitedPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 50

class RecipeListPaginatedByDiet(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = LimitedPagination

    def get_queryset(self):
        queryset = Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        ).order_by('id')

        diet = self.request.query_params.get('diet')
        if diet:
            queryset = queryset.filter(dietary_tags__contains=[diet])
        if self.request.query_params.get('favorite') == 'true' and self.request.user.is_authenticated:
            queryset = self.request.user.favorite_recipes.annotate(
                average_rating=Avg("reviews__rating"),
                review_count=Count("reviews")
            ).order_by('id')
        if self.request.query_params.get('random') == 'true':
            queryset = queryset.order_by('?')
        return queryset.distinct()

class BrowseRecipesView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = LimitedPagination

    def get_queryset(self):
        return Recipe.objects.annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews")
        ).order_by('id')