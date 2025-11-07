import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { sellerAuth, sellerProvider } from "../utils/firebase.seller";
import { motion } from "framer-motion";
import { HashLoader } from "react-spinners";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const logoUrl =
  "https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_";

export default function SellerLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle form input change
  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/sellers/auth/login`, formData);
      localStorage.setItem("sellerToken", data.token);
      navigate("/seller/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid credentials / Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In login
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(sellerAuth, sellerProvider);
      const user = result.user;
      // Get the Firebase ID Token
      const tokenId = await user.getIdToken();
      const payload = {
        tokenId, // Must send this!
        email: user.email,
        fullName: user.displayName,
        googleId: user.uid,
      };
      const { data } = await axios.post(
        `${BASE_API_URL}/api/sellers/auth/google-login`,
        payload
      );
      localStorage.setItem("sellerToken", data.token);
      navigate("/seller/dashboard");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Another sign-in is already in progress.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Pop-up blocked by browser. Please allow pop-ups and try again.");
      } else {
        setError(
          err.response?.data?.error ||
          err.message ||
          "Google login failed"
        );
      }
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
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full">
          {/* Logo and header */}
          <div className="text-center mb-6">
            <img src={logoUrl} className="mx-auto w-28 mb-4" alt="UrbanTales" />
            <h2 className="text-3xl font-bold text-[#070A52] mb-2">
              Welcome Back, Seller!
            </h2>
            <p className="text-sm text-gray-500">Sign in to manage your store</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  autoComplete="username"
                  onChange={handleChange}
                  className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#070A52] transition"
                  required
                />
                <span className="absolute right-3 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  autoComplete="current-password"
                  onChange={handleChange}
                  className="w-full p-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#070A52] transition"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/seller/forgot-password"
                className="text-sm text-[#070A52] hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              type="submit"
              disabled={loading}
            >
              {loading ? <HashLoader color="#fff" size={20} /> : "Sign In"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
            disabled={loading}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
              alt="Google"
              className="h-5 w-5"
            />
            <span className="text-gray-700">Sign in with Google</span>
          </motion.button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/seller/signup"
                className="text-[#070A52] font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
