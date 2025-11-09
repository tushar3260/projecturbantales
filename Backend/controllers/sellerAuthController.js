import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendSellerOtpMail } from "../utils/SellersendOtpMail.js";
import { OAuth2Client } from "google-auth-library"; // For Google Token verification
import { sendSellerWelcomeMail } from "../utils/sendSellerWelcomeMail.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Set your Google Client ID

// 🔧 Generate unique username
function generateUsername(fullName) {
  const base = fullName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
}

// 🔐 Create JWT
function createJwt(seller) {
  return jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });
}

// 🧾 SELLER SIGNUP
export async function signup(req, res) {
  try {
    const { fullName, username, email, phone, shopName, address, bio, password } = req.body;

    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ error: "Seller with this email already exists!" });

    // Generate a unique username
    let autoUsername = username || generateUsername(fullName);
    let _username = autoUsername;
    let taken = await Seller.findOne({ username: _username });
    while (taken) {
      _username = autoUsername.replace(/-\d+$/, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      taken = await Seller.findOne({ username: _username });
    }

    // Hash password and create seller
    const hash = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      fullName,
      username: _username,
      email,
      phone,
      shopName,
      address,
      bio,
      password: hash,
    });

    // Generate JWT
    const token = createJwt(seller);

    // ✅ Send Welcome Email (non-blocking)
    try {
      await sendSellerWelcomeMail(email, fullName);
      console.log(`✅ Seller welcome email sent to ${email}`);
    } catch (mailError) {
      console.error("⚠️ Failed to send seller welcome email:", mailError.message);
    }

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
        bio,
      },
    });
  } catch (err) {
    console.error("❌ Seller Signup Error:", err);
    res.status(400).json({ error: err.message });
  }
}

// 🔑 SELLER LOGIN
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
        bio: seller.bio,
      },
    });
  } catch (err) {
    console.error("❌ Seller Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

// 🌐 GOOGLE SELLER AUTH (LOGIN / SIGNUP)
export async function googleSellerAuth(req, res) {
  try {
    console.log("Google Seller Login REQ BODY:", req.body);
    const tokenId = req.body.tokenId || req.body.credential;
    if (!tokenId) return res.status(400).json({ error: "No token provided" });

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: "Google account missing email" });

    // If seller doesn't exist, auto-create
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
        avatar: picture || "",
      });

      // ✅ Send Welcome Email (only for new sellers)
      try {
        await sendSellerWelcomeMail(email, name);
        console.log(`✅ Seller welcome email sent (Google) to ${email}`);
      } catch (mailError) {
        console.error("⚠️ Failed to send Google seller welcome email:", mailError.message);
      }
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
        avatar: seller.avatar,
      },
    });
  } catch (err) {
    console.error("❌ Google Seller Auth Error:", err);
    res.status(400).json({ error: "Google login failed" });
  }
}

// 📩 REQUEST PASSWORD RESET (Send OTP)
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

    seller.otp = otp;
    seller.otpExpiry = otpExpiry;
    await seller.save();

    await sendSellerOtpMail({ to: email, otp });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
}

// 🔄 RESET PASSWORD WITH OTP
export async function resetPasswordWithOtp(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    if (!seller.otp || seller.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (seller.otpExpiry < Date.now()) return res.status(400).json({ error: "OTP expired" });

    seller.password = await bcrypt.hash(newPassword, 10);
    seller.otp = null;
    seller.otpExpiry = null;
    await seller.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Password Reset Error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
}

// 🔎 VERIFY OTP ONLY
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    if (!seller.otp || seller.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (seller.otpExpiry < Date.now()) return res.status(400).json({ error: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("❌ OTP Verification Error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
}
