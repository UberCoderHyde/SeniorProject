from django.urls import path
from .views import LoginUserView, RegisterUserView, UserProfileView, user_profile, unsubscribe

urlpatterns = [
    path('login/', LoginUserView.as_view(), name='login'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('profile/', user_profile, name='user-profile'),
    path('unsubscribe/', unsubscribe, name='unsubscribe'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),

]
