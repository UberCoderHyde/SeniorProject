from django.db import models
from django.conf import settings
import re
from rapidfuzz import process, fuzz

class Ingredient(models.Model):
    name = models.CharField(max_length=1000, unique=True)
    is_meat = models.BooleanField(default=False)
    is_dairy = models.BooleanField(default=False)
    contains_gluten = models.BooleanField(default=False)
    is_vegan_safe = models.BooleanField(default=True)
    is_nut_free = models.BooleanField(default=True)
    is_keto_friendly = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @property
    def dietary_tags(self):
        tags = set()
        if self.is_meat:
            tags.add('contains_meat')
        if self.is_dairy:
            tags.add('contains_dairy')
        if self.contains_gluten:
            tags.add('contains_gluten')
        if not self.is_vegan_safe:
            tags.add('not_vegan')
        if not self.is_nut_free:
            tags.add('contains_nuts')
        if self.is_keto_friendly:
            tags.add('keto_friendly')
        else:
            tags.add('not_keto')

        return tags or {'unknown'}

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
    recipeIngred = models.TextField()
    image = models.ImageField(upload_to='recipes/Images/', blank=True, null=True)

    def __str__(self):
        return self.title

    @property
    def cleaned_ingredients(self):
        lines = self.recipeIngred.split('\n')
        known_ingredients = [name.lower() for name in Ingredient.objects.values_list('name', flat=True)]
        matched_ingredients = []

    def __str__(self):
        unit_display = f" {self.ingredient.unit}" if self.ingredient.unit else ""
        return f"{self.quantity}{unit_display} of {self.ingredient.name}"
    
    @property
    def cleaned_ingredients(self):
        lines = self.recipeIngred.split('\n')
        known_ingredients = [name.lower() for name in Ingredient.objects.values_list('name', flat=True)]
        matched_ingredients = []

        for line in lines:
            line = line.lower()
            line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
            words = line.split()
            if not words:
                continue

            for i in range(len(words), 0, -1):
                candidate = ' '.join(words[:i])
                result = process.extractOne(
                    candidate,
                    known_ingredients,
                    scorer=fuzz.partial_ratio,
                    score_cutoff=70
                )
                if result:
                    match, score, _ = result
                    try:
                        matched_ingredients.append(Ingredient.objects.get(name__iexact=match))
                    except Ingredient.DoesNotExist:
                        pass
                    break  # stop on first match

        return matched_ingredients
    

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
