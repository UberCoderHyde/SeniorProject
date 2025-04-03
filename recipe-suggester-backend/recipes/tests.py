from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from recipes.models import Recipe, Ingredient
import re
User = get_user_model()

class RecipeViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='pass1234')
        self.client.force_authenticate(user=self.user)

        # Sample ingredients and recipes
        ing1 = Ingredient.objects.create(name='Carrot')
        ing2 = Ingredient.objects.create(name='Beef', is_meat=True)

        self.recipe1 = Recipe.objects.create(title="Vegan Delight", instructions="Chop and mix", recipeIngred="Carrot\nWater")
        self.recipe2 = Recipe.objects.create(title="Beef Stew", instructions="Cook beef", recipeIngred="Beef\nSalt")
        self.recipe1.save()
        self.recipe2.save()
        self.user.favorite_recipes.add(self.recipe1)

    def test_get_minimal_recipes(self):
        res = self.client.get('/api/recipes/minimal/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_random_recipes(self):
        res = self.client.get('/api/recipes/minimal/?random=true')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_dietary_filter_vegetarian(self):
        res = self.client.get('/api/recipes/minimal/?diet=vegetarian')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_trending_recipes(self):
        res = self.client.get('/api/recipes/minimal/?trending=true')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_favorite_recipes(self):
        res = self.client.get('/api/recipes/minimal/?favorite=true')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_paginated_view_limit(self):
        for i in range(60):
            Recipe.objects.create(title=f"Paginated Recipe {i}", instructions="Test")
        res = self.client.get('/api/recipes/paginated/?page=1')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(res.data['results']), 50)

    def test_empty_state_on_invalid_diet(self):
        res = self.client.get('/api/recipes/minimal/?diet=nonexistentdiet')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_empty_state_on_favorite_no_data(self):
        self.user.favorite_recipes.clear()
        res = self.client.get('/api/recipes/minimal/?favorite=true')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_cache_random(self):
        res1 = self.client.get('/api/recipes/minimal/?random=true')
        res2 = self.client.get('/api/recipes/minimal/?random=true')
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)

    def test_cache_trending(self):
        res1 = self.client.get('/api/recipes/minimal/?trending=true')
        res2 = self.client.get('/api/recipes/minimal/?trending=true')
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)
