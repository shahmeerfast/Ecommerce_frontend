import React from 'react'
import { useShopContext } from '../../context/ShopContext'
import axios from '../../config/axios'
import { toast } from 'react-toastify'

const MyOrders = () => {
  const { orders, token, fetchOrders } = useShopContext()

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.post('/api/order/seller-status', { orderId, status }, { headers: { token } })
      toast.success(`Order marked as ${status}`)
      fetchOrders && fetchOrders()
    } catch (err) {
      toast.error('Failed to update order status')
    }
  }

  const updatePaymentStatus = async (orderId, payment) => {
    try {
      await axios.post('/api/order/seller-payment-status', { orderId, payment }, { headers: { token } })
      toast.success(`Payment status updated`)
      fetchOrders && fetchOrders()
    } catch (err) {
      toast.error('Failed to update payment status')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Orders</h2>
      {orders?.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => {
            const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = itemsTotal + (order.deliveryFee || 0);
            return (
            <div key={order._id} className="border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Order #{order._id}</h3>
                  <span className="text-gray-600">{order.date ? new Date(order.date).toLocaleDateString() : ''}</span>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-gray-600">₦{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t pt-2">
                  <p className="font-semibold">Total: ₦{total}</p>
                  <p className="text-gray-600">Delivery Fee: ₦{order.deliveryFee}</p>
                  <p className="text-gray-600">Buyer Address: {order.deliveryAddress}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Status:</span>
                    <span className={`px-2 py-1 rounded text-white ${order.status === 'Order Placed' ? 'bg-yellow-500' : order.status === 'Dispatched' ? 'bg-blue-500' : order.status === 'Delivered' ? 'bg-green-600' : 'bg-gray-400'}`}>{order.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Payment Status:</span>
                    <span className={`px-2 py-1 rounded text-white ${order.payment ? 'bg-green-600' : 'bg-red-500'}`}>{order.payment ? 'Received' : 'Pending'}</span>
                    {!order.payment && (
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                        onClick={() => updatePaymentStatus(order._id, true)}
                      >
                        Mark as Received
                      </button>
                    )}
                  </div>
                  {order.status !== 'Delivered' && (
                    <div className="flex gap-2 mt-2">
                      {order.status !== 'Dispatched' && (
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded"
                          onClick={() => updateOrderStatus(order._id, 'Dispatched')}
                        >
                          Mark as Dispatched
                        </button>
                      )}
                      {order.status === 'Dispatched' && (
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded"
                          onClick={() => updateOrderStatus(order._id, 'Delivered')}
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default MyOrders