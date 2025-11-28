"use client"

import { useState, useEffect } from "react"
import { OrderList } from "../components/OrderList"
import { CreateOrderForm } from "../components/CreateOrderForm"

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleOrderCreated = (newOrder: any) => {
    setOrders(prev => [newOrder, ...prev])
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchOrders()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard Restaurant</h1>
          <p className="text-zinc-600">Gestiona tus pedidos en tiempo real</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OrderList 
              orders={orders} 
              loading={loading}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
          <div>
            <CreateOrderForm onOrderCreated={handleOrderCreated} />
          </div>
        </div>
      </div>
    </div>
  )
}