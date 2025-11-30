from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.urls import path, include
from orders.views import OrderViewSet, TerminalQRViewSet, ViewOrderViewSet, AuthViewSet, RestaurantListViewSet

routes = DefaultRouter()  

routes.register(r'restaurants', RestaurantListViewSet, basename='restaurants')
routes.register(r'orders', OrderViewSet, basename='orders')
#routes.register(r'terminal_qr', TerminalQRViewSet, basename='terminal_qr')
routes.register(r'view_order', ViewOrderViewSet, basename='view_order')
routes.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(routes.urls)),
    path('admin/', admin.site.urls),
    path(
        'qr/<uuid:restaurant_uuid>/<str:terminal_id>/',
        TerminalQRViewSet.as_view({'get': 'retrieve'}),
        name='qr'
    ),
]
