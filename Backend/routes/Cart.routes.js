import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateQtyInCart,
  clearCart // <-- NEW
} from "../controllers/Cart.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.post("/remove", verifyToken, removeFromCart);
router.post("/update", verifyToken, updateQtyInCart);
router.post("/clear", verifyToken, clearCart); // <-- NEW

export default router;
