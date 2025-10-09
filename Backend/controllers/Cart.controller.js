import Cart from "../models/Cart.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    const subtotal = cart?.items?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;
    if (!cart) return res.status(200).json({ items: [], subtotal: 0 });
    res.status(200).json({ items: cart.items, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  const { item } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [item] });
    } else {
      const existingItem = cart.items.find((i) => i.id === item.id);
      if (existingItem) existingItem.qty += item.qty;
      else cart.items.push(item);
    }
    await cart.save();
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    res.status(200).json({ msg: "Item added", cart, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { itemId } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });
    cart.items = cart.items.filter((item) => item.id !== itemId);
    await cart.save();
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    res.status(200).json({ msg: "Item removed", cart, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Update quantity in cart
export const updateQtyInCart = async (req, res) => {
  const { itemId, qty } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    item.qty = qty;
    await cart.save();
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    res.status(200).json({ msg: "Quantity updated", cart, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Clear user's cart after successful payment
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.userId },
      { $set: { items: [] } }
    );
    res.status(200).json({ msg: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
