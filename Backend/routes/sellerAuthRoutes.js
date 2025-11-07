import express from "express";
import { signup, login, requestPasswordReset, resetPasswordWithOtp, verifyOtp } from "../controllers/sellerAuthController.js";
import { googleSellerAuth } from '../controllers/sellerAuthController.js';

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithOtp);
router.post("/verify-otp", verifyOtp);
router.post('/google-login', googleSellerAuth);
export default router;
