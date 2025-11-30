from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, RestaurantUser
from .serializers import OrderSerializer, OrderPublicSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
import qrcode, io, base64
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, OrderLookupSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model

#QR_BASE_URL = "https://ding-6hg3.onrender.com/qr/"
QR_BASE_URL = "https://ding-3ota.vercel.app/r/"
ORDER_BASE_URL = "https://ding-3ota.vercel.app/view_order/"

class RestaurantListViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        restaurantes = RestaurantUser.objects.all().values(
            "restaurant_name",
            "restaurant_uuid"
        )

        return Response(list(restaurantes))

class OrderViewSet(viewsets.ViewSet):
    lookup_field = 'order_id'
    permission_classes = [IsAuthenticated]

    def list(self, request):
        orders = Order.objects.filter(restaurant_user=request.user).order_by('-created_at')  # ordenados del más nuevo al más viejo
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def retrieve(self, request, order_id=None):
        order = get_object_or_404(Order, order_id=order_id, restaurant_user=request.user)
        order.last_viewed_at = timezone.now()  # 👈 actualiza la fecha/hora
        order.save(update_fields=["last_viewed_at"])  # 👈 guarda solo ese campo
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def create(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save(restaurant_user=request.user)

            # ✅ Generar URL con UUID
            #qr_url = f"{QR_BASE_URL}{order.terminal_id}"
            qr_url = f"{QR_BASE_URL}{request.user.restaurant_uuid}/terminal/{order.terminal_id}"

            # ✅ Generar QR
            qr = qrcode.make(qr_url)
            buffered = io.BytesIO()
            qr.save(buffered, format="PNG")

            # ✅ Codificar en base64 para devolverlo como string
            img_base64 = base64.b64encode(buffered.getvalue()).decode()

            # ✅ Devolver QR junto con los datos del pedido
            return Response({
                "uuid": str(order.uuid),
                "order_id": order.order_id,
                "customer_name": order.customer_name,
                "terminal_id": order.terminal_id,
                "status": order.status,
                "created_at": order.created_at,
                "qr_url": qr_url,
                "qr_base64": img_base64
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, order_id=None):
        order = get_object_or_404(Order, order_id=order_id, restaurant_user=request.user)
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        orders = Order.objects.filter(restaurant_user=request.user)
        count = orders.count()
        orders.delete()

        return Response(
            {"message": f"Se eliminaron {count} pedidos."},
            status=status.HTTP_200_OK
        )

class TerminalQRViewSet(viewsets.ViewSet):
    def retrieve(self, request, restaurant_uuid=None, terminal_id=None):
        """
        Cuando el cliente escanea el QR físico de la terminal,
        se lo redirige al último pedido creado en esa terminal que aún no fue visto.
        """
        restaurant = get_object_or_404(RestaurantUser, restaurant_uuid=restaurant_uuid)
        
        order = Order.objects.filter(
            restaurant_user=restaurant,
            terminal_id=terminal_id,
            first_viewed_at__isnull=True
        ).order_by('-created_at').first()

        if order:
            order.first_viewed_at = timezone.now()
            order.save(update_fields=["first_viewed_at"])

            order_url = f"{ORDER_BASE_URL}{order.order_id}"
            return redirect(order_url)

        return Response(
            {"detail": "No hay pedidos para esta terminal."},
            status=status.HTTP_404_NOT_FOUND
        )

class ViewOrderViewSet(viewsets.ViewSet):
    #lookup_field = 'restaurant_uuid'

    # def retrieve(self, request, order_id=None):
    #     """
    #     Devuelve el estado actual del pedido (ej: PENDING, READY, RETRIEVED)
    #     para mostrar en la app web del cliente.
    #     """
    #     order = get_object_or_404(Order, order_id=order_id)
    #     serializer = OrderPublicSerializer(order)
    #     return Response(serializer.data)

    def list(self, request):
        # opcional: devolver algo o dejarlo vacío
        return Response({"detail": "OK"})
    
    def create(self, request, order_id=None):
        """
        Busca un pedido usando restaurant_uuid + order_id.
        Permite que el cliente recupere su pedido manualmente.
        """
        print(request.data)
        serializer = OrderLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        restaurant_uuid = serializer.validated_data['restaurant_uuid']
        #order_id = serializer.validated_data['order_id']
        terminal_id = serializer.validated_data['terminal_id']

        # Buscar restaurante
        user = RestaurantUser.objects.filter(
            restaurant_uuid=restaurant_uuid
        ).first()

        if not user:
            return Response(
                {"error": "El restaurante no existe."},
                status=400
            )

        order = Order.objects.filter(
                restaurant_user=user,
                terminal_id=terminal_id
            ).order_by('-created_at').first()

        if not order:
            return Response(
                {"error": "No existe un pedido con ese ID para este restaurante."},
                status=404
            )
        
        if not order.first_viewed_at:
            order.first_viewed_at = timezone.now()
            order.save(update_fields=["first_viewed_at"])

        return Response(OrderPublicSerializer(order).data)

    # ---------------------------------------------
    # 💥 NUEVO MÉTODO EXTRA: revisar un pedido exacto
    # ---------------------------------------------
    @action(detail=True, methods=['post'], url_path='check')
    def check_order(self, request, pk=None):
        """
        Busca un pedido específico: order_id + restaurant_uuid + terminal_id.
        pk = order_id desde la URL
        """
        # pk = <order_id> capturado por DRF en la URL

        serializer = OrderLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        restaurant_uuid = serializer.validated_data["restaurant_uuid"]
        terminal_id = serializer.validated_data["terminal_id"]

        # Buscar restaurante
        user = RestaurantUser.objects.filter(
            restaurant_uuid=restaurant_uuid
        ).first()

        if not user:
            return Response({"error": "El restaurante no existe"}, status=400)

        # Buscar un pedido con TODOS los filtros:
        order = Order.objects.filter(
            restaurant_user=user,
            terminal_id=terminal_id,
            order_id=pk
        ).first()

        if not order:
            return Response({"error": "No existe un pedido que matchee los 3 valores"}, status=404)

        return Response(OrderPublicSerializer(order).data)

class AuthViewSet(viewsets.ViewSet):

    permission_classes = [AllowAny]  # cambiar según acción

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Usuario registrado correctamente",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login exitoso",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "restaurant_name": user.restaurant_name,
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Devuelve datos del usuario logueado"""
        user = request.user
        return Response({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "restaurant_name": user.restaurant_name,
        })