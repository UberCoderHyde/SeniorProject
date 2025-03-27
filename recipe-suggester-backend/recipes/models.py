from django.db import models
from django.conf import settings

class Ingredient(models.Model):
    name = models.CharField(max_length=1000, unique=True)
    unit = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="Measurement unit (e.g., grams, cups, lb, oz)"
    )
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class PantryItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="pantry_items"
    )
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'ingredient')

    def __str__(self):
        return f"{self.ingredient.name}"

class Recipe(models.Model):
    title = models.CharField(max_length=1000)
    instructions = models.TextField()
    image = models.ImageField(upload_to='recipes/Images/', blank=True, null=True)  # updated field
    ingredients = models.ManyToManyField(
        Ingredient,
        through="RecipeIngredient",
        related_name="recipes"
    )

    def __str__(self):
        return self.title

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="recipe_ingredients")
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=6, decimal_places=2, help_text="Quantity used in the recipe")

    def __str__(self):
        unit_display = f" {self.ingredient.unit}" if self.ingredient.unit else ""
        return f"{self.quantity}{unit_display} of {self.ingredient.name}"
    

class Review(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review_text = models.TextField(default="No review provided")
    rating = models.IntegerField(
        choices = [
            (1, "1 star"),
            (2, "2 star"), 
            (3, "3 star"), 
            (4, "4 star"), 
            (5, "5 star")
        ], 
        help_text="Rating from 1 (worst) to 5 (best)"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
