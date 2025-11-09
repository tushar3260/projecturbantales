import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { motion } from "framer-motion";

const logoUrl =
  "https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png";

export default function SellerResetPasswordOTP() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
      const res = await fetch(
        `${apiBase}/api/sellers/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ OTP sent successfully to your email!");
        setTimeout(() => {
          navigate(`/seller/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(data.error || "❌ Failed to send OTP. Seller not found.");
      }
    } catch {
      setError("⚠️ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <form
          className="bg-white shadow-2xl p-8 rounded-3xl space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="text-center">
            <img src={logoUrl} className="mx-auto w-32 mb-4" alt="UrbanTales" />
            <h2 className="text-2xl font-bold text-[#070A52] mb-2">
              Forgot Your Password?
            </h2>
            <p className="text-sm text-gray-500">
              Enter your registered seller email to receive a verification OTP
            </p>
          </div>

          <div className="relative">
            <input
              type="email"
              className="w-full border-2 border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-[#070A52] transition"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your seller email"
              required
            />
            <span className="absolute right-4 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </span>
          </div>

          <button
            className="w-full py-3 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? <HashLoader color="#fff" size={20} /> : "Send OTP"}
          </button>

          {msg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-600 bg-green-50 p-3 rounded-lg"
            >
              {msg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600 bg-red-50 p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <div className="text-center">
            <a href="/sellerlogin" className="text-sm text-[#070A52] hover:underline">
              ← Back to Login
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
