from django.db import models
from django.conf import settings
from decimal import Decimal

class Ingredient(models.Model):
    name = models.CharField(max_length=255, unique=True)
    unit = models.CharField(
        max_length=50, blank=True, null=True,
        help_text="Optional measurement unit (e.g., grams, cups, lb, oz)"
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
    quantity = models.DecimalField(max_digits=6, decimal_places=2, help_text="e.g., 3.5 for 3.5 lbs")

    class Meta:
        unique_together = ('user', 'ingredient')

    def __str__(self):
        return f"{self.ingredient.name}: {self.formatted_quantity}"

    @property
    def formatted_quantity(self):
        # If unit is lb or similar, convert fractional pounds to pounds and ounces.
        if self.ingredient.unit and self.ingredient.unit.lower() in ['lb', 'lbs', 'pound', 'pounds']:
            pounds = int(self.quantity)
            ounces = round((float(self.quantity) - pounds) * 16)
            if ounces == 16:
                pounds += 1
                ounces = 0
            return f"{pounds} lb{'s' if pounds != 1 else ''} {ounces} oz"
        return f"{self.quantity} {self.ingredient.unit or ''}"

class Recipe(models.Model):
    title = models.CharField(max_length=255)
    instructions = models.TextField()
    image_url = models.URLField(blank=True, null=True)
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
