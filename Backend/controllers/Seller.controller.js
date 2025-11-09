// controllers/seller.controller.js
import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendSellerWelcomeMail } from "../utils/sendSellerWelcomeMail.js"; // ✅ Import mail utility

// =============================
// ✅ Seller Signup
// =============================
export const sellerSignup = async (req, res) => {
  const { fullName, username, email, phone, password } = req.body;

  try {
    // Check existing seller
    const existing = await Seller.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller
    const seller = await Seller.create({
      fullName,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Send Welcome Email
    try {
      await sendSellerWelcomeMail(email, fullName);
      console.log(`✅ Seller welcome email sent to ${email}`);
    } catch (mailError) {
      console.error(
        "⚠️ Failed to send seller welcome email:",
        mailError.message
      );
    }

    // Response
    res.status(201).json({
      message: "Seller account created successfully.",
      user: seller,
      token,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
};

// =============================
// ✅ Seller Login
// =============================
export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const seller = await Seller.findOne({ email });
    if (!seller)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      user: seller,
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};
