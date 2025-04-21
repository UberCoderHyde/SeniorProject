import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.template.loader import render_to_string
from recipes.models import Recipe

class Command(BaseCommand):
    help = "Send a weekly recipe newsletter to subscribed users"

    def test_send_emails(self):
        recipe = Recipe.objects.create(
            title="Creamy Garlic Mushrooooooom Pasta",
            instructions=(
                "1. Cook the pasta in a large pot of salted boiling water until al dente. Reserve 1/2 cup of pasta water, then drain and set aside.\n\n"
                "2. In a large skillet over medium heat, melt the butter and olive oil together. Add the minced garlic and sauté for about 1 minute until fragrant.\n\n"
                "3. Add the sliced mushrooms and cook until tender and golden brown, about 6-8 minutes. Season with salt, pepper, and thyme.\n\n"
                "4. Pour in the heavy cream and bring to a gentle simmer. Stir occasionally and let it thicken for 3-5 minutes.\n\n"
                "5. Add the cooked pasta into the skillet and toss well to coat. If the sauce is too thick, add a splash of the reserved pasta water.\n\n"
                "6. Stir in the grated Parmesan cheese until melted and smooth. Taste and adjust seasoning if needed.\n\n"
                "7. Serve hot, garnished with fresh parsley and more cheese if desired."
            ),
            recipeIngred=(
                "Fettuccine pasta\n"
                "Olive oil\n"
                "Butter\n"
                "Garlic (minced)\n"
                "Mushrooms (sliced)\n"
                "Heavy cream\n"
                "Parmesan cheese (grated)\n"
                "Fresh thyme\n"
                "Salt\n"
                "Black pepper\n"
                "Fresh parsley"
            ),
            image=None,  
        )
        subject = f"Weekly Recipe - {recipe.title}"

        email_addresses = ["nikhi.v.anu@gmail.com"]

        for email in email_addresses:
            unsubscribe_url = (
                f"{settings.SITE_URL}/api/users/unsubscribe/?user_id={email}/"
            )
            message = render_to_string(
                "recipes/newsletter.html",
                {
                    "recipe": recipe,
                    "unsubscribe_url": unsubscribe_url,
                },
            )

            subject = recipe.title 
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
                html_message=message,
            )
            self.stdout.write(self.style.SUCCESS(f"Sent email to {email}"))

    def handle(self, *args, **options):
        self.test_send_emails()