from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/(?P<restaurant_uuid>[^/]+)/(?P<terminal_id>[^/]+)/(?P<order_id>[^/]+)/$', consumers.OrderConsumer.as_asgi()),
]