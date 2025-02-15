from django.urls import path
from .views import RegisterUserView, ProfileView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('profile/<int:pk>/', ProfileView.as_view(), name='profile'),
]
