import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000/api";

export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Please login to view your orders.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then(data => {
        setOrders(data.orders);
        setFilterOrders(data.orders, filterStatus);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const setFilterOrders = (ordersList, status) => {
    if (status === "all") {
      setFilteredOrders(ordersList);
    } else {
      setFilteredOrders(ordersList.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase()));
    }
  };

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    setFilterOrders(orders, status);
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Cancel failed');
      setOrders(prev => prev.map(o => o._id === id ? {...o, orderStatus: 'Cancelled'} : o));
      setFilterOrders(filteredOrders.map(o => o._id === id ? {...o, orderStatus: 'Cancelled'} : o), filterStatus);
      alert("Order cancelled successfully");
    } catch {
      alert("Failed to cancel order");
    }
  };

  const returnOrder = async (id) => {
    if (!window.confirm("Do you want to initiate a return for this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/return`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Return request failed');
      setOrders(prev => prev.map(o => o._id === id ? {...o, orderStatus: 'Returned'} : o));
      setFilterOrders(filteredOrders.map(o => o._id === id ? {...o, orderStatus: 'Returned'} : o), filterStatus);
      alert("Return request initiated");
    } catch {
      alert("Failed to process return");
    }
  };

  const canReturn = (order) => {
    if (!order.deliveredAt) return false;
    if (order.orderStatus !== 'Delivered') return false;
    const daysSinceDelivery = (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery >= 0 && daysSinceDelivery <= 4;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen font-semibold text-red-600">
          {error}
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Your Orders
        </h1>
        <div className="mb-5 flex justify-center space-x-4">
          <select 
            value={filterStatus} 
            onChange={handleFilterChange} 
            className="border rounded px-3 py-1"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="placed">Placed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map(order => (
              <div 
                key={order._id} 
                className="border shadow rounded cursor-pointer p-4 hover:bg-gray-50"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex space-x-4 overflow-x-auto max-w-xs">
                    {order.items.map(item => (
                      <img 
                        key={item.id} 
                        src={item.image} 
                        alt={item.name} 
                        title={item.name}
                        className="w-20 h-20 rounded object-cover"
                      />
                    ))}
                  </div>
                  <p className="mt-2 md:mt-0 font-semibold text-gray-700">
                    Status: <span 
                      className={`font-bold ${
                        order.orderStatus.toLowerCase() === 'delivered' ? 'text-green-600' :
                        order.orderStatus.toLowerCase() === 'cancelled' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </p>
                  <p className="mt-2 md:mt-0 font-semibold text-gray-700">
                    Total: ₹{order.totalAmount}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <section className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-6 z-50">
            <div className="bg-white p-6 rounded max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button 
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl font-bold"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>

              <h2 className="text-2xl font-semibold mb-4">Order Details</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Products</h3>
                  <ul className="space-y-4 max-h-80 overflow-y-auto">
                    {selectedOrder.items.map(item => (
                      <li key={item.id} className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover"/>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p>Qty: {item.qty}</p>
                          <p>Price: ₹{item.price}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Details</h3>
                  <p><strong>Name:</strong> {selectedOrder.name}</p>
                  <p><strong>Mobile:</strong> {selectedOrder.mobile}</p>
                  <p><strong>Address:</strong> {selectedOrder.address}</p>
                  <p><strong>Instructions:</strong> {selectedOrder.instructions || "None"}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
                  <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus || "N/A"}</p>
                  <p><strong>Order Status:</strong> {selectedOrder.orderStatus}</p>
                  {selectedOrder.deliveredAt && (
                    <p><strong>Delivered On:</strong> {new Date(selectedOrder.deliveredAt).toLocaleDateString()}</p>
                  )}
                  <p><strong>Tracking Info:</strong> {selectedOrder.trackingInfo || "Not available"}</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                {selectedOrder.orderStatus !== "Cancelled" && selectedOrder.orderStatus !== "Delivered" && (
                  <button 
                    onClick={() => {
                      cancelOrder(selectedOrder._id);
                      setSelectedOrder(null);
                    }} 
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
                {canReturn(selectedOrder) && (
                  <button 
                    onClick={() => {
                      returnOrder(selectedOrder._id);
                      setSelectedOrder(null);
                    }} 
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Return Order
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
