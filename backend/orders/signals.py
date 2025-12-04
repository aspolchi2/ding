from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order

@receiver(post_save, sender=Order)
def order_updated(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    room_group_name = f'order_{instance.restaurant_user.restaurant_uuid}_{instance.terminal_id}_{instance.order_id}'
    
    order_data = {
        'id': instance.id,
        'uuid': str(instance.uuid),
        'order_id': instance.order_id,
        'customer_name': instance.customer_name,
        'terminal_id': instance.terminal_id,
        'status': instance.status,
        'created_at': instance.created_at.isoformat(),
        'first_viewed_at': instance.first_viewed_at.isoformat() if instance.first_viewed_at else None,
        'last_viewed_at': instance.last_viewed_at.isoformat() if instance.last_viewed_at else None,
        'restaurant_user': instance.restaurant_user.id,
    }
    
    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'order_update',
            'order_data': order_data
        }
    )