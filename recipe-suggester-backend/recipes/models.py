from django.db import models
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
        return self.ingredient.name

class Recipe(models.Model):
    title = models.CharField(max_length=1000)
    instructions = models.TextField()
    recipeIngred = models.TextField()
    image = models.ImageField(upload_to='recipes/Images/', blank=True, null=True)
    dietary_tags = models.JSONField(default=list)
    ingredient_ids = models.JSONField(default=list)

    def __str__(self):
        return self.title

    @property
    def cleaned_ingredients(self):
        from rapidfuzz import fuzz, process
        import re

        known_ingredients = Ingredient.objects.all().values_list('id', 'name')
        name_map = {name.lower(): id_ for id_, name in known_ingredients}
        matched_ids = set()

        for line in self.recipeIngred.lower().splitlines():
            cleaned = re.sub(r'[^a-zA-Z\s]', '', line).strip()
            words = cleaned.split()
            for i in range(len(words), 0, -1):
                phrase = ' '.join(words[:i])
                match = process.extractOne(phrase, name_map.keys(), scorer=fuzz.partial_ratio, score_cutoff=70)
                if match:
                    matched_ids.add(name_map[match[0]])
                    break

        return Ingredient.objects.filter(id__in=matched_ids)

    def compute_dietary_tags(self):
        tags = set()
        vegan = vegetarian = nut_free = keto = True
        ingredients = Ingredient.objects.filter(id__in=self.ingredient_ids)

        for ing in ingredients:
            if ing.is_meat:
                vegan = vegetarian = False
                tags.add('contains_meat')
            if ing.is_dairy:
                vegan = False
                tags.add('contains_dairy')
            if ing.contains_gluten:
                tags.add('contains_gluten')
            if not ing.is_vegan_safe:
                vegan = False
                tags.add('not_vegan')
            if not ing.is_nut_free:
                nut_free = False
                tags.add('contains_nuts')
            if not ing.is_keto_friendly:
                keto = False

        if vegan: tags.add('vegan')
        if vegetarian: tags.add('vegetarian')
        if nut_free: tags.add('nut_free')
        if keto: tags.add('keto_friendly')

        return list(tags)

    def save(self, *args, **kwargs):
        # Only run fuzzy logic on save
        self.ingredient_ids = [ing.id for ing in self.cleaned_ingredients]
        self.dietary_tags = self.compute_dietary_tags()
        super().save(*args, **kwargs)

class Review(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    review_text = models.TextField(default="No review provided")
    rating = models.IntegerField(choices=[(i, f"{i} star") for i in range(1, 6)])
    timestamp = models.DateTimeField(auto_now_add=True)
