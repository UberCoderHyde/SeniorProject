from django.urls import path
from .views import LoginUserView, RegisterUserView, user_profile

urlpatterns = [
    path('login/', LoginUserView.as_view(), name='login'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('profile/', user_profile, name='user-profile'),
]
