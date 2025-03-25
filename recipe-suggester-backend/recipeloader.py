import csv
import ast
import os
import sys
import django
from django.core.files import File

# Set up Django environment – update with your project settings.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from recipes.models import Ingredient, Recipe, RecipeIngredient

def find_image_file(image_directory, image_name):
    """
    Attempts to locate an image file in image_directory.
    If image_name has no extension, it tries common extensions.
    """
    base_path = os.path.join(image_directory, image_name)
    # Check if the provided image_name already has an extension.
    if os.path.splitext(image_name)[1]:
        if os.path.exists(base_path):
            return base_path
        return None

    # List of common image extensions to try.
    for ext in ['.jpg', '.jpeg', '.png', '.gif']:
        candidate = base_path + ext
        if os.path.exists(candidate):
            return candidate
    return None

def import_recipes(csv_filepath, image_directory):
    """
    Reads a CSV file with recipe data (including an Image_Name column) and
    creates/updates Recipe objects along with associated Ingredients and RecipeIngredients.
    It then checks for a matching image file in the provided image_directory,
    and if found, uploads it to the recipe's ImageField.
    """
    with open(csv_filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row['Title'].strip()
            instructions = row['Instructions'].strip()
            image_name = row['Image_Name'].strip()  # may not include an extension
            
            # Create or update the Recipe.
            recipe_obj, created = Recipe.objects.get_or_create(
                title=title,
                defaults={'instructions': instructions}
            )
            if not created:
                recipe_obj.instructions = instructions
                recipe_obj.save()
            
            # Process the Cleaned_Ingredients column.
            try:
                cleaned_ingredients = ast.literal_eval(row['Cleaned_Ingredients'])
            except Exception as e:
                print(f"Error parsing Cleaned_Ingredients for '{title}': {e}")
                cleaned_ingredients = []
            
            for ingredient_str in cleaned_ingredients:
                ingredient_str = ingredient_str.strip()
                ingredient_obj, _ = Ingredient.objects.get_or_create(name=ingredient_str)
                RecipeIngredient.objects.get_or_create(
                    recipe=recipe_obj,
                    ingredient=ingredient_obj,
                    defaults={'quantity': 1.0}  # using a default quantity
                )
            
            # Attempt to find and upload the image file.
            image_filepath = find_image_file(image_directory, image_name)
            if image_filepath:
                # Only upload if the recipe doesn't already have an image.
                if not recipe_obj.image:
                    with open(image_filepath, 'rb') as f:
                        recipe_obj.image.save(os.path.basename(image_filepath), File(f), save=True)
                    print(f"Uploaded image for recipe: {title}")
                else:
                    print(f"Recipe '{title}' already has an image.")
            else:
                print(f"Image file not found for recipe '{title}': expected at {os.path.join(image_directory, image_name)} or with a common extension")
            
            print(f"Imported recipe: {title}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python import_recipes_with_images.py <path_to_csv_file> <image_directory>")
    else:
        csv_filepath = sys.argv[1]
        image_directory = sys.argv[2]
        import_recipes(csv_filepath, image_directory)
