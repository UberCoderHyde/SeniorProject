from django.db import models
from django.conf import settings

class Ingredient(models.Model):
    name = models.CharField(max_length=255, unique=True)
    unit = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="Optional measurement unit (e.g., grams, cups)"
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
    quantity = models.DecimalField(
        max_digits=6, decimal_places=2,
        help_text="Quantity of the ingredient (e.g., 1.50)"
    )

    class Meta:
        unique_together = ('user', 'ingredient')

    def __str__(self):
        unit_display = f" {self.ingredient.unit}" if self.ingredient.unit else ""
        return f"{self.ingredient.name}: {self.quantity}{unit_display}"

class Recipe(models.Model):
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    url = models.URLField(blank=True, null=True)
    image_url = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    # Many-to-many relationship through an intermediary model
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
    quantity = models.DecimalField(
        max_digits=6, 
        decimal_places=2,
        help_text="Quantity of the ingredient used in the recipe"
    )

    def __str__(self):
        unit_display = f" {self.ingredient.unit}" if self.ingredient.unit else ""
        return f"{self.quantity}{unit_display} of {self.ingredient.name}"