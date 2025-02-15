from django.db import models

class Recipe(models.Model):
    title = models.CharField(max_length=255)
    ingredients = models.TextField()  # Store as a comma-separated string
    instructions = models.TextField()
    image = models.URLField(blank=True, null=True)
    cooking_time = models.IntegerField()  # in minutes

    def __str__(self):
        return self.title
