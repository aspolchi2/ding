from rest_framework import serializers
from .models import Order
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "restaurant_name",
            "password",
        ]

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            phone=validated_data["phone"],
            restaurant_name=validated_data["restaurant_name"],
        )

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        # Buscar el usuario por email
        user = User.objects.filter(email=email).first()

        # Verificar usuario y contraseña
        if not user or not user.check_password(password):
            raise serializers.ValidationError("Email o contraseña incorrectos.")

        # Verificar si está activo
        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está desactivada.")

        data["user"] = user
        return data

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = [
            'uuid',
            'created_at',
            'first_viewed_at',
            'last_viewed_at',
            'restaurant_user'
        ]

class OrderPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            'order_id',
            'customer_name',
            'status',
        )
        
class OrderLookupSerializer(serializers.Serializer):
    restaurant_uuid = serializers.UUIDField()
    order_id = serializers.CharField()