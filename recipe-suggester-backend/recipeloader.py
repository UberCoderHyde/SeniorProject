import csv
import os
import sys
import ast
import django
from django.core.files import File

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from recipes.models import Recipe

def find_image_file(image_directory, image_name):
    """
    Attempts to locate an image file in image_directory.
    If image_name has no extension, it tries common extensions.
    """
    base_path = os.path.join(image_directory, image_name)
    if os.path.splitext(image_name)[1]:  # Already has extension
        return base_path if os.path.exists(base_path) else None

    for ext in ['.jpg', '.jpeg', '.png', '.gif']:
        candidate = base_path + ext
        if os.path.exists(candidate):
            return candidate
    return None

def import_recipes(csv_filepath, image_directory):
    """
    Imports recipes from a CSV with cleaned ingredient strings and optional image names.
    """
    with open(csv_filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row.get('Title', '').strip()
            instructions = row.get('Instructions', '').strip()
            image_name = row.get('Image_Name', '').strip()

            if not title:
                print("⚠️ Skipping row with missing title.")
                continue

            # Create or update the Recipe
            recipe_obj, created = Recipe.objects.get_or_create(
                title=title,
                defaults={'instructions': instructions}
            )
            if not created:
                recipe_obj.instructions = instructions

            # Parse Cleaned_Ingredients and store in recipeIngred
            cleaned_raw = row.get('Cleaned_Ingredients', '').strip()
            try:
                cleaned_list = ast.literal_eval(cleaned_raw)
                if isinstance(cleaned_list, list):
                    recipe_obj.recipeIngred = '\n'.join(cleaned_list)
                else:
                    raise ValueError("Parsed Cleaned_Ingredients is not a list.")
            except Exception as e:
                print(f"❌ Error parsing ingredients for '{title}': {e}")
                recipe_obj.recipeIngred = ''

            recipe_obj.save()

            # Attach image if not already present
            image_filepath = find_image_file(image_directory, image_name)
            if image_filepath:
                if not recipe_obj.image or not recipe_obj.image.name:
                    with open(image_filepath, 'rb') as f:
                        recipe_obj.image.save(os.path.basename(image_filepath), File(f), save=True)
                    print(f"✅ Uploaded image for '{title}'")
                else:
                    print(f"📌 '{title}' already has an image.")
            else:
                if image_name:
                    print(f"🚫 Image not found for '{title}': tried '{image_name}' in {image_directory}")
                else:
                    print(f"ℹ️ No image provided for '{title}'")

            print(f"✔️ Imported: {title}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python import_recipes_with_images.py <path_to_csv_file> <image_directory>")
    else:
        csv_filepath = sys.argv[1]
        image_directory = sys.argv[2]
        import_recipes(csv_filepath, image_directory)
