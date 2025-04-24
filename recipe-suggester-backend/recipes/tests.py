# recipes/tests.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from recipes.models import Recipe, Ingredient, PantryItem
from unittest.mock import patch, PropertyMock

User = get_user_model()


class SuggestRecipesViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester", email="t@test.com", password="pass"
        )
        self.client.force_authenticate(self.user)

        # Ingredients
        self.ing_a = Ingredient.objects.create(name="A")
        self.ing_b = Ingredient.objects.create(name="B")
        self.ing_c = Ingredient.objects.create(name="C")

        # Create recipes
        self.r1 = Recipe.objects.create(title="R1", instructions="", recipeIngred="")
        self.r2 = Recipe.objects.create(title="R2", instructions="", recipeIngred="")

        # Pantry: user only has A
        PantryItem.objects.create(user=self.user, ingredient=self.ing_a)

    def test_missing_counts(self):
        url = reverse("recipe-suggestions")

        with patch.object(Recipe, "cleaned_ingredients", new_callable=PropertyMock) as mock_cleaned:
            mock_cleaned.side_effect = [
                [self.ing_a, self.ing_b],  # R1
                [self.ing_b, self.ing_c],  # R2
            ]
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, status.HTTP_200_OK)
            data = resp.json()
            self.assertEqual(data[0]["title"], "R1")
            self.assertEqual(data[0]["missing_count"], 1)
            self.assertEqual(data[1]["title"], "R2")
            self.assertEqual(data[1]["missing_count"], 2)

    def test_can_make_filter(self):
        url = reverse("recipe-suggestions") + "?can_make=true"

        with patch.object(Recipe, "cleaned_ingredients", new_callable=PropertyMock) as mock_cleaned:
            mock_cleaned.side_effect = [
                [self.ing_a, self.ing_b],  # R1 → missing B
                [self.ing_b, self.ing_c],  # R2 → missing B,C
            ]
            resp = self.client.get(url)
            self.assertEqual(resp.json(), [])  # nothing can be made

    def test_threshold_filter(self):
        url = reverse("recipe-suggestions") + "?threshold=1"

        with patch.object(Recipe, "cleaned_ingredients", new_callable=PropertyMock) as mock_cleaned:
            mock_cleaned.side_effect = [
                [self.ing_a, self.ing_b],  # R1 → 1 missing
                [self.ing_b, self.ing_c],  # R2 → 2 missing
            ]
            resp = self.client.get(url)
            data = resp.json()
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["title"], "R1")


class CreateRecipeViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="creator", email="c@test.com", password="pass"
        )
        self.client.force_authenticate(self.user)
        self.url = reverse("recipe-create")

    def test_requires_auth(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_recipe_success(self):
        payload = {
            "title": "New",
            "recipeIngred": "A\nB",
            "instructions": "Do this\nThen that"
        }
        resp = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()["data"]
        self.assertEqual(data["title"], "New")
        self.assertIn("id", data)
