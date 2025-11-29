import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth.models import PermissionsMixin, Group, Permission

class RestaurantUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)

class RestaurantUser(AbstractBaseUser, PermissionsMixin):
    restaurant_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    restaurant_name = models.CharField(max_length=200)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    groups = models.ManyToManyField(
        Group,
        related_name="restaurant_users",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="restaurant_users_permissions",
        blank=True
    )

    objects = RestaurantUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "phone", "restaurant_name"]

    def __str__(self):
        return f"{self.restaurant_name} ({self.email})"

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pendiente'
    PREPARING = 'PREPARING', 'Preparando'
    READY = 'READY', 'Listo para retirar'
    RETRIEVED = 'RETRIEVED', 'Retirado'

class Order(models.Model):
    restaurant_user = models.ForeignKey(
        RestaurantUser,
        on_delete=models.CASCADE,
        related_name="orders",
        null=True
    )
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    order_id = models.CharField(max_length=100, null = True, blank = True)  # ID original de Fudo
    customer_name = models.CharField(max_length=100, null = True, blank = True)
    terminal_id = models.CharField(max_length=10, null = True, blank = True)  # ej: "1", "2"
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    first_viewed_at = models.DateTimeField(null=True, blank=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('restaurant_user', 'order_id')

    def __str__(self):
        return f"{self.uuid} - {self.status}"
