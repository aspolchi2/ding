from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order
from .serializers import OrderSerializer, OrderPublicSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
import qrcode, io, base64
from django.shortcuts import redirect

QR_BASE_URL = "http://127.0.0.1:8000/terminal_qr/"
ORDER_BASE_URL = "http://127.0.0.1:8000/view_order/"

class OrderViewSet(viewsets.ViewSet):
    lookup_field = 'order_id'

    def list(self, request):
        orders = Order.objects.all().order_by('-created_at')  # ordenados del más nuevo al más viejo
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def retrieve(self, request, uuid=None):
        order = get_object_or_404(Order, uuid=uuid)
        order.last_viewed_at = timezone.now()  # 👈 actualiza la fecha/hora
        order.save(update_fields=["last_viewed_at"])  # 👈 guarda solo ese campo
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def create(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()

            # ✅ Generar URL con UUID
            qr_url = f"{QR_BASE_URL}{order.terminal_id}"

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
        order = get_object_or_404(Order, order_id=order_id)
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TerminalQRViewSet(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        """
        Cuando el cliente escanea el QR físico de la terminal,
        se lo redirige al último pedido creado en esa terminal que aún no fue visto.
        """
        order = Order.objects.filter(
            terminal_id=pk,
            first_viewed_at__isnull=True
        ).order_by('-created_at').first()

        if order:
            order.first_viewed_at = timezone.now()
            order.save(update_fields=["first_viewed_at"])
            order_url = f"{ORDER_BASE_URL}{order.order_id}"
            return redirect(order_url)

        return Response(
            {"detail": "No hay pedidos disponibles para esta terminal."},
            status=status.HTTP_404_NOT_FOUND
        )

class ViewOrderViewSet(viewsets.ViewSet):
    lookup_field = 'order_id'

    def retrieve(self, request, order_id=None):
        """
        Devuelve el estado actual del pedido (ej: PENDING, READY, RETRIEVED)
        para mostrar en la app web del cliente.
        """
        order = get_object_or_404(Order, order_id=order_id)
        serializer = OrderPublicSerializer(order)
        return Response(serializer.data)