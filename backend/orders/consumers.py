import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Order, RestaurantUser

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.restaurant_uuid = self.scope['url_route']['kwargs']['restaurant_uuid']
        self.terminal_id = self.scope['url_route']['kwargs']['terminal_id']
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        
        self.room_group_name = f'order_{self.restaurant_uuid}_{self.terminal_id}_{self.order_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Enviar estado inicial
        order_data = await self.get_order()
        if order_data:
            await self.send(text_data=json.dumps(order_data))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def get_order(self):
        try:
            restaurant = RestaurantUser.objects.get(restaurant_uuid=self.restaurant_uuid)
            order = Order.objects.get(
                restaurant_user=restaurant,
                terminal_id=self.terminal_id,
                order_id=self.order_id
            )
            return {
                'id': order.id,
                'uuid': str(order.uuid),
                'order_id': order.order_id,
                'customer_name': order.customer_name,
                'terminal_id': order.terminal_id,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'first_viewed_at': order.first_viewed_at.isoformat() if order.first_viewed_at else None,
                'last_viewed_at': order.last_viewed_at.isoformat() if order.last_viewed_at else None,
                'restaurant_user': order.restaurant_user.id,
            }
        except (RestaurantUser.DoesNotExist, Order.DoesNotExist):
            return None

    async def order_update(self, event):
        await self.send(text_data=json.dumps(event['order_data']))