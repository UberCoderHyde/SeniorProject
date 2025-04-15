from django.contrib.auth.models import AbstractUser 
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # is the user subscribed to the newsletter?
    is_subscribed = models.BooleanField(default=True)
    
    # Add a many-to-many field for favorite recipes.
    favorite_recipes = models.ManyToManyField(
        'recipes.Recipe',  # Reference to your Recipe model (adjust if the app name is different)
        blank=True,
        related_name='favorited_by'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email

    def add_favorite(self, recipe):
        """Add a recipe to the user's favorites."""
        self.favorite_recipes.add(recipe)
        self.save()

    def remove_favorite(self, recipe):
        """Remove a recipe from the user's favorites."""
        self.favorite_recipes.remove(recipe)
        self.save()
