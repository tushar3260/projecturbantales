import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE = "http://localhost:3000/api";

const ORDER_STAGES = [
  "Pending",
  "Placed",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];

// Return stages unchanged
const RETURN_STAGES = [
  "Requested",
  "Pickup Scheduled",
  "Picked Up",
  "Refund Initiated",
  "Refunded",
];

// Return progress tracker
function AnimatedReturnTracker({ currentStatus }) {
  const index = RETURN_STAGES.indexOf(currentStatus);
  return (
    <div className="flex items-center space-x-4 my-4">
      {RETURN_STAGES.map((stage, i) => {
        const active = i <= index;
        return (
          <React.Fragment key={stage}>
            <motion.span
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                active ? "bg-blue-700 border-blue-700" : "bg-gray-200 border-gray-300"
              }`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              {active && (
                <motion.span
                  className="text-white text-xs select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.2 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.span>
            <motion.span
              className={`text-sm select-none ${
                active ? "text-blue-700 font-semibold" : "text-gray-500"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.25 + 0.3 }}
            >
              {stage}
            </motion.span>
            {i < RETURN_STAGES.length - 1 && (
              <motion.span
                className={`mx-2 select-none text-blue-500 font-bold`}
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ delay: i * 0.2 + 0.4 }}
              >
                →
              </motion.span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Advanced order tracker with partial stages up to cancelled point
function AnimatedOrderTracker({ currentStatus }) {
  const baseStages = [
    "Pending",
    "Placed",
    "Picked Up",
    "Out for Delivery",
    "Delivered",
  ];

  // Get index of cancellation in base stages if cancelled
  // We assume cancel status means order cancelled at currentStatus stage.
  // Show all stages upto the last resolved stage before cancel plus Cancelled
  let stagesToShow = [];
  if (currentStatus === "Cancelled") {
    // Custom handling: last confirmed stage is before Cancelled
    // Usually, the orderStatus is set to "Cancelled" so we need to define upto which stage it was cancelled
    // Let's assume "cancelledAtStage" is stored or infer from last known status.
    // Since we don't have that, show first 2 stages and then Cancelled as example.
    // Advanced usage: Actually, show all stages till the second last, just before Cancelled:
    // But we need last successful stage from order data — here we infer from order timeline or store it separately.

    // For demo: show Pending and Placed, then Cancelled — partial stages.
    stagesToShow = ["Pending", "Placed", "Cancelled"];
  } else {
    stagesToShow = baseStages;
  }

  const currIndex = stagesToShow.indexOf(currentStatus);

  return (
    <div className="flex items-center space-x-4 my-4">
      {stagesToShow.map((stage, i) => {
        const isCancelledStage = stage === "Cancelled";
        const active = (currentStatus === "Cancelled" ? i < stagesToShow.length - 1 : i <= currIndex)
          || (currentStatus === "Cancelled" && isCancelledStage);

        // Colors
        const circleColorClass = isCancelledStage
          ? "bg-red-600 border-red-600"
          : active
          ? "bg-blue-700 border-blue-700"
          : "bg-gray-200 border-gray-300";

        const textColorClass = isCancelledStage
          ? "text-red-700 font-semibold"
          : active
          ? "text-blue-700 font-semibold"
          : "text-gray-500";

        return (
          <React.Fragment key={stage}>
            <motion.span
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${circleColorClass}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              {active && (
                <motion.span
                  className="text-white text-xs select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.2 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.span>
            <motion.span
              className={`text-sm select-none ${textColorClass}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.25 + 0.3 }}
            >
              {stage}
            </motion.span>
            {i < stagesToShow.length - 1 && (
              <motion.span
                className={`mx-2 select-none ${
                  isCancelledStage ? "text-red-600" : "text-blue-500 font-bold"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 1 : 0.3 }}
                transition={{ delay: i * 0.2 + 0.4 }}
              >
                →
              </motion.span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function TrackOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [returnModal, setReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returningOrderId, setReturningOrderId] = useState(null);

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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders);
        setFilterOrders(data.orders, filterStatus);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const setFilterOrders = (ordersList, status) => {
    if (status === "all") setFilteredOrders(ordersList);
    else
      setFilteredOrders(
        ordersList.filter(
          (o) => o.orderStatus.toLowerCase() === status.toLowerCase()
        )
      );
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
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, orderStatus: "Cancelled" } : o
        )
      );
      setFilterOrders(
        orders.map((o) =>
          o._id === id ? { ...o, orderStatus: "Cancelled" } : o
        ),
        filterStatus
      );
      alert("Order cancelled successfully");
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    }
  };

  const openReturnModal = (id) => {
    setReturningOrderId(id);
    setReturnReason("");
    setReturnModal(true);
  };

  const submitReturnRequest = async () => {
    if (!returnReason) {
      alert("Please select a reason for return.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/orders/${returningOrderId}/return`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: returnReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Return request failed");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === returningOrderId
            ? {
                ...o,
                orderStatus: "Returned",
                returnStatus: "Requested",
                returnReason,
              }
            : o
        )
      );
      setFilterOrders(
        orders.map((o) =>
          o._id === returningOrderId
            ? {
                ...o,
                orderStatus: "Returned",
                returnStatus: "Requested",
                returnReason,
              }
            : o
        ),
        filterStatus
      );
      alert("Return request initiated");
      setReturnModal(false);
      setSelectedOrder(null);
    } catch (err) {
      alert(err.message || "Failed to process return");
    }
  };

  const canReturn = (order) => {
    if (!order.deliveredAt) return false;
    if (order.orderStatus !== "Delivered") return false;
    const daysSinceDelivery =
      (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery >= 0 && daysSinceDelivery <= 4;
  };

  const cancelReturnRequest = async (id) => {
    if (!window.confirm("Cancel your return request?")) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/cancelReturn`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel return failed");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, orderStatus: "Delivered", returnStatus: "", returnReason: "" }
            : o
        )
      );
      setFilterOrders(
        orders.map((o) =>
          o._id === id
            ? { ...o, orderStatus: "Delivered", returnStatus: "", returnReason: "" }
            : o
        ),
        filterStatus
      );
      alert("Return cancelled");
      setSelectedOrder(null);
    } catch (err) {
      alert(err.message || "Failed to cancel return");
    }
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
            <option value="picked up">Picked Up</option>
            <option value="out for delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="border shadow rounded cursor-pointer p-4 hover:bg-gray-50"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex space-x-4 overflow-x-auto max-w-xs">
                    {order.items.map((item) => (
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
                    Status:{" "}
                    <span
                      className={`font-bold ${
                        order.orderStatus.toLowerCase() === "delivered"
                          ? "text-green-600"
                          : order.orderStatus.toLowerCase() === "cancelled"
                          ? "text-red-600"
                          : order.orderStatus.toLowerCase() === "returned"
                          ? "text-yellow-600"
                          : "text-yellow-600"
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

                {/* Order progress tracker with partial stages for cancellation */}
                <AnimatedOrderTracker currentStatus={order.orderStatus} />

                {/* Return progress tracker if applicable */}
                {order.returnStatus && (
                  <AnimatedReturnTracker currentStatus={order.returnStatus} />
                )}
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
                    {selectedOrder.items.map((item) => (
                      <li key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover"
                        />
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
                  <p>
                    <strong>Name:</strong> {selectedOrder.name}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {selectedOrder.mobile}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedOrder.address}
                  </p>
                  <p>
                    <strong>Instructions:</strong>{" "}
                    {selectedOrder.instructions || "None"}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedOrder.paymentMethod || "N/A"}
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    {selectedOrder.paymentStatus || "N/A"}
                  </p>
                  <p>
                    <strong>Order Status:</strong> {selectedOrder.orderStatus}
                  </p>
                  {selectedOrder.deliveredAt && (
                    <p>
                      <strong>Delivered On:</strong>{" "}
                      {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                    </p>
                  )}
                  <p>
                    <strong>Tracking Info:</strong>{" "}
                    {selectedOrder.trackingInfo || "Not available"}
                  </p>
                  {selectedOrder.returnReason && (
                    <p>
                      <strong>Return Reason:</strong> {selectedOrder.returnReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Order progress tracker */}
              <AnimatedOrderTracker currentStatus={selectedOrder.orderStatus} />

              {/* Return progress tracker */}
              {selectedOrder.returnStatus && (
                <AnimatedReturnTracker currentStatus={selectedOrder.returnStatus} />
              )}

              <div className="mt-6 flex space-x-4">
                {["Placed", "Shipped", "Out for Delivery", "Pending"].includes(
                  selectedOrder.orderStatus
                ) && (
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
                    onClick={() => openReturnModal(selectedOrder._id)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Return Order
                  </button>
                )}
                {selectedOrder.orderStatus === "Returned" &&
                  selectedOrder.returnStatus === "Requested" && (
                    <button
                      onClick={() => cancelReturnRequest(selectedOrder._id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                      Cancel Return
                    </button>
                  )}
              </div>
            </div>

            {/* Return reason modal */}
            {returnModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-md w-full max-w-md shadow flex flex-col space-y-4">
                  <h3 className="font-semibold text-lg">Return Order</h3>
                  <label>
                    Select a Reason for Return:
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="mt-2 border px-2 py-1 w-full"
                    >
                      <option value="">Select reason</option>
                      <option value="Damaged product">Damaged product</option>
                      <option value="Wrong item sent">Wrong item sent</option>
                      <option value="Quality not as expected">
                        Quality not as expected
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  {returnReason === "Other" && (
                    <input
                      className="border px-2 py-1 w-full"
                      type="text"
                      placeholder="Describe the reason"
                      onChange={(e) => setReturnReason(e.target.value)}
                    />
                  )}
                  <div className="flex space-x-4 mt-2">
                    <button
                      className="bg-yellow-700 px-4 py-1 rounded text-white"
                      onClick={submitReturnRequest}
                      disabled={!returnReason}
                    >
                      Submit
                    </button>
                    <button
                      className="bg-gray-500 px-4 py-1 rounded text-white"
                      onClick={() => setReturnModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
