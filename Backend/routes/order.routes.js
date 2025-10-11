import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createOrder,
  getUserOrders,
  cancelOrder,
  returnOrder,
  cancelReturn
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);
router.post("/:id/cancel", verifyToken, cancelOrder);
router.post("/:id/return", verifyToken, returnOrder);
router.post("/:id/cancelReturn", verifyToken, cancelReturn);

export default router;
