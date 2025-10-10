import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { v4 as uuidv4 } from "uuid"; // install uuid package

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("Received order for user:", userId);
    console.log("Request body:", req.body);

    const cart = await Cart.findOne({ userId });
    console.log("User cart:", cart);
    if (!cart || !cart.items || cart.items.length === 0) {
      console.log("Cart is empty or not found");
      return res.status(400).json({ message: "Cart is empty, cannot create order" });
    }

    const {
      name,
      mobile,
      address,
      instructions,
      paymentMethod,
      paymentStatus,
      totalAmount,
    } = req.body;

    if (!name || !mobile || !address || !paymentMethod || !paymentStatus || !totalAmount) {
      console.log("Missing required order info");
      return res.status(400).json({ message: "Missing order details" });
    }

    const orderId = uuidv4();

    const newOrder = new Order({
      orderId,
      userId,
      items: cart.items,
      orderStatus: paymentStatus === "Successful" ? "Placed" : "Pending",
      paymentMethod,
      paymentStatus,
      totalAmount,
      name,
      mobile,
      address,
      instructions,
    });

    await newOrder.save();
    console.log("Order saved:", newOrder);

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      message: "Server error creating order",
      errorMessage: error.message,
      stack: error.stack,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (["Placed", "Shipped", "Out for Delivery"].includes(order.orderStatus) === false) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ message: "Order not eligible for return" });
    }

    if (!order.deliveredAt) {
      return res.status(400).json({ message: "Delivery date missing" });
    }

    const daysSinceDelivery = (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 4) {
      return res.status(400).json({ message: "Return period expired" });
    }

    order.orderStatus = "Returned";
    await order.save();

    res.status(200).json({ message: "Return processed successfully" });
  } catch (error) {
    console.error("Error processing return:", error);
    res.status(500).json({ message: "Error processing return" });
  }
};
