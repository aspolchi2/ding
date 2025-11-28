import uuid
from django.db import models

class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pendiente'
    PREPARING = 'PREPARING', 'Preparando'
    READY = 'READY', 'Listo para retirar'
    RETRIEVED = 'RETRIEVED', 'Retirado'

class Order(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    order_id = models.CharField(max_length=100, null = True, blank = True, unique=True)  # ID original de Fudo
    customer_name = models.CharField(max_length=100, null = True, blank = True)
    terminal_id = models.CharField(max_length=10, null = True, blank = True)  # ej: "1", "2"
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    first_viewed_at = models.DateTimeField(null=True, blank=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.uuid} - {self.status}"
