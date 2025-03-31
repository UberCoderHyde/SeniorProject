import csv
from django.core.management.base import BaseCommand
from recipes.models import Ingredient

class Command(BaseCommand):
    help = "Import or update ingredients with dietary tags from a CSV file."

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help="Path to the CSV file containing ingredients and tags.")

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            created = 0
            updated = 0
            skipped = 0

            for row in reader:
                name = row.get('name')
                if not name:
                    self.stdout.write(self.style.WARNING("Skipping row without a name"))
                    skipped += 1
                    continue

                defaults = {
                    'is_meat': row.get('is_meat', '').lower() == 'true',
                    'is_dairy': row.get('is_dairy', '').lower() == 'true',
                    'contains_gluten': row.get('contains_gluten', '').lower() == 'true',
                    'is_vegan_safe': row.get('is_vegan_safe', '').lower() == 'true',
                    'is_nut_free': row.get('is_nut_free', '').lower() == 'true',
                    'is_keto_friendly': row.get('is_keto_friendly', '').lower() == 'true',
                }

                ingredient, created_flag = Ingredient.objects.update_or_create(
                    name=name.strip(),
                    defaults=defaults
                )

                if created_flag:
                    created += 1
                    self.stdout.write(self.style.SUCCESS(f"Created: {name}"))
                else:
                    updated += 1
                    self.stdout.write(self.style.NOTICE(f"Updated: {name}"))

            self.stdout.write(self.style.SUCCESS(
                f"Import complete: {created} created, {updated} updated, {skipped} skipped."
            ))
