import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { v4 as uuidv4 } from "uuid"; // install uuid package

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty, cannot create order" });
    }
    const {
      name, mobile, address, instructions,
      paymentMethod, paymentStatus, totalAmount,
    } = req.body;
    if (!name || !mobile || !address || !paymentMethod || !paymentStatus || !totalAmount) {
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
      name, mobile, address, instructions,
    });
    await newOrder.save();
    cart.items = [];
    await cart.save();
    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error creating order", errorMessage: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    // Allow cancel only if status matches business logic
    if (!["Placed", "Shipped", "Out for Delivery", "Pending"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }
    order.orderStatus = "Cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.body.reason || "";
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
    order.returnStatus = "Requested";
    order.returnReason = reason;
    await order.save();
    res.status(200).json({ message: "Return processed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error processing return" });
  }
};

export const cancelReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order || order.orderStatus !== "Returned" || order.returnStatus !== "Requested") {
      return res.status(400).json({ message: "Cannot cancel return" });
    }
    order.orderStatus = "Delivered";
    order.returnStatus = "";
    order.returnReason = "";
    await order.save();
    res.status(200).json({ message: "Return cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling return" });
  }
};
