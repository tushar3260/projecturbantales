import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendSellerOtpMail } from "../utils/SellersendOtpMail.js";
import { OAuth2Client } from "google-auth-library"; // For Google Token verification

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Set your Google Client ID

function generateUsername(fullName) {
  const base = fullName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
}

function createJwt(seller) {
  return jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });
}

// Seller Signup
export async function signup(req, res) {
  try {
    const { fullName, username, email, phone, shopName, address, bio, password } = req.body;

    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ error: "Seller with this email already exists!" });

    // Unique username generation
    let autoUsername = username || generateUsername(fullName);
    let _username = autoUsername;
    let taken = await Seller.findOne({ username: _username });
    while (taken) {
      _username = autoUsername.replace(/-\d+$/, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      taken = await Seller.findOne({ username: _username });
    }

    const hash = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      fullName, username: _username, email, phone, shopName, address, bio, password: hash
    });

    const token = createJwt(seller);

    res.status(201).json({
      token,
      seller: {
        _id: seller._id,
        fullName,
        username: _username,
        email,
        phone,
        shopName,
        address,
        bio
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Seller Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = createJwt(seller);

    res.json({
      token,
      seller: {
        _id: seller._id,
        fullName: seller.fullName,
        username: seller.username,
        email: seller.email,
        phone: seller.phone,
        shopName: seller.shopName,
        address: seller.address,
        bio: seller.bio
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}

// Google Seller Auth (LOGIN / SIGNUP)
export async function googleSellerAuth(req, res) {
  try {
    const { tokenId } = req.body;
    if (!tokenId) return res.status(400).json({ error: "No token provided" });

    // Verify Google token (frontend should provide this using Google sign-in, not Admin SDK)
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: tokenId, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: "Google account missing email" });

    // If seller doesn't exist, create auto
    let seller = await Seller.findOne({ email });
    if (!seller) {
      let username = generateUsername(name || "seller");
      let taken = await Seller.findOne({ username });
      while (taken) {
        username = "seller-" + Math.floor(1000 + Math.random() * 9000);
        taken = await Seller.findOne({ username });
      }
      seller = await Seller.create({
        fullName: name,
        username,
        email,
        bio: "",
        shopName: "",
        address: "",
        phone: "",
        avatar: picture || ""
      });
    }

    const token = createJwt(seller);

    res.json({
      token,
      seller: {
        _id: seller._id,
        fullName: seller.fullName,
        username: seller.username,
        email: seller.email,
        shopName: seller.shopName,
        bio: seller.bio,
        address: seller.address,
        phone: seller.phone,
        avatar: seller.avatar
      }
    });

  } catch (err) {
    res.status(400).json({ error: "Google login failed" });
  }
}

// Request OTP
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    seller.otp = otp;
    seller.otpExpiry = otpExpiry;
    await seller.save();

    await sendSellerOtpMail({ to: email, otp });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP email" });
  }
}

// Reset password with OTP
export async function resetPasswordWithOtp(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    if (!seller.otp || seller.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });
    if (seller.otpExpiry < Date.now())
      return res.status(400).json({ error: "OTP expired" });

    seller.password = await bcrypt.hash(newPassword, 10);
    seller.otp = null;
    seller.otpExpiry = null;
    await seller.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Password reset failed" });
  }
}

// Verify OTP only (for pre-password step)
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    if (!seller.otp || seller.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });
    if (seller.otpExpiry < Date.now())
      return res.status(400).json({ error: "OTP expired" });
    res.json({ message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
}
