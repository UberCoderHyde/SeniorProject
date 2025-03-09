from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('recipes.urls')),
    path('api/users/', include('users.urls')),
    # If you're using the custom login view in users, you don't need the default token endpoint.
]
