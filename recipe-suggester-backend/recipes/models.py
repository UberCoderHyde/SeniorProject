# models.py
from django.db import models
from django.contrib.postgres.fields import ArrayField

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

class Recipe(models.Model):
    title = models.CharField(max_length=1000)
    instructions = models.TextField()
    recipeIngred = models.TextField()
    image = models.ImageField(upload_to='recipes/Images/', blank=True, null=True)
    dietary_tags = models.JSONField(default=list)  # Precomputed tags for filtering

    def __str__(self):
        return self.title

    @property
    def cleaned_ingredients(self):
        from rapidfuzz import fuzz, process
        import re
        from .models import Ingredient

        lines = self.recipeIngred.lower().split('\n')
        known_ingredients = [name.lower() for name in Ingredient.objects.values_list('name', flat=True)]
        matched_ingredients = []

        for line in lines:
            line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
            words = line.split()
            if not words:
                continue

            for i in range(len(words), 0, -1):
                candidate = ' '.join(words[:i])
                match = process.extractOne(candidate, known_ingredients, scorer=fuzz.partial_ratio, score_cutoff=70)
                if match:
                    try:
                        matched_ingredients.append(Ingredient.objects.get(name__iexact=match[0]))
                    except Ingredient.DoesNotExist:
                        pass
                    break

        return matched_ingredients

    def compute_dietary_tags(self):
        tags = set()
        for ing in self.cleaned_ingredients:
            if ing.is_meat:
                tags.add('contains_meat')
            if ing.is_dairy:
                tags.add('contains_dairy')
            if ing.contains_gluten:
                tags.add('contains_gluten')
            if not ing.is_vegan_safe:
                tags.add('not_vegan')
            if not ing.is_nut_free:
                tags.add('contains_nuts')
            if ing.is_keto_friendly:
                tags.add('keto_friendly')
        return list(tags)

    def save(self, *args, **kwargs):
        self.dietary_tags = self.compute_dietary_tags()
        super().save(*args, **kwargs)

    

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
