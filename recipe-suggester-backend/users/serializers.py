from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

# Serializer for logging in.
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

# Serializer for returning user data.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", 
            "email", 
            "username", 
            "first_name", 
            "last_name", 
            "profile_picture", 
            "bio"
        )

# Serializer for registration.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = (
            "id", "email", "username", "first_name", "last_name", "password", 
            "profile_picture", "bio"
        )

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            profile_picture=validated_data.get("profile_picture"),
            bio=validated_data.get("bio", "")
        )
        return user
