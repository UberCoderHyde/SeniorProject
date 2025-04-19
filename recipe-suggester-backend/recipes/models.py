from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings

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

class PantryItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pantry_items"
    )
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="pantry_items"
    )

    class Meta:
        unique_together = ('user', 'ingredient')

    def __str__(self):
        return f"{self.ingredient.name}"

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
        known = [n.lower() for n in Ingredient.objects.values_list('name', flat=True)]
        matched = []
        for line in self.recipeIngred.lower().split('\n'):
            line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
            words = line.split()
            for i in range(len(words), 0, -1):
                cand = ' '.join(words[:i])
                m = process.extractOne(cand, known, scorer=fuzz.partial_ratio, score_cutoff=70)
                if m:
                    try:
                        matched.append(Ingredient.objects.get(name__iexact=m[0]))
                    except Ingredient.DoesNotExist:
                        pass
                    break
        return matched

    def compute_dietary_tags(self):
        tags = set()
        is_vegan = True
        is_vegetarian = True
        is_nut_free = True
        is_keto = True

        for ing in self.cleaned_ingredients:
            if ing.is_meat:
                tags.add('contains_meat')
                is_vegan = False
                is_vegetarian = False
            if ing.is_dairy:
                tags.add('contains_dairy')
                is_vegan = False
            if ing.contains_gluten:
                tags.add('contains_gluten')
            if not ing.is_vegan_safe:
                tags.add('not_vegan')
                is_vegan = False
            if not ing.is_nut_free:
                tags.add('contains_nuts')
                is_nut_free = False
            if not ing.is_keto_friendly:
                is_keto = False

        if is_vegan:
            tags.add('vegan')
        if is_vegetarian:
            tags.add('vegetarian')
        if is_nut_free:
            tags.add('nut_free')
        if is_keto:
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
        choices=[(i, f"{i} star") for i in range(1,6)],
        help_text="Rating from 1 (worst) to 5 (best)"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
