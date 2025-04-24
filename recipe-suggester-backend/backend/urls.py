from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from django.conf.urls.static import static
from django.conf import settings
from users.views import UserProfileView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('recipes.urls')),
    path("api/users/profile/", UserProfileView.as_view(), name="user-profile"),

    path('api/users/', include('users.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
