import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { motion } from "framer-motion";

const logoUrl =
  "https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png";

export default function SellerResetPasswordConfirm() {
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email");
  const otp = params.get("otp");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 1) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (strength === 2) return { strength: 50, label: "Fair", color: "bg-yellow-500" };
    if (strength === 3) return { strength: 75, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (newPassword.length < 8) {
      setError("❌ Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirm) {
      setError("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const res = await fetch(
  `${apiBase}/api/sellers/auth/reset-password`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  }
);

      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/sellerlogin"), 2000);
      } else {
        setError(data.error || "❌ Error resetting password. Please try again.");
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <form
          className="bg-white shadow-2xl p-8 rounded-3xl space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="text-center">
            <img src={logoUrl} className="mx-auto w-32 mb-4" alt="UrbanTales" />
            <h2 className="text-2xl font-bold text-[#070A52] mb-2">
              Create New Password
            </h2>
            <p className="text-sm text-gray-500">
              Enter a strong password for your seller account
            </p>
          </div>

          {/* New Password Field */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border-2 border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-[#070A52] transition pr-12"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
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

          {/* Password Strength Indicator */}
          {newPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Password Strength:</span>
                <span className={`font-semibold ${
                  passwordStrength.label === "Strong" ? "text-green-600" :
                  passwordStrength.label === "Good" ? "text-blue-600" :
                  passwordStrength.label === "Fair" ? "text-yellow-600" : "text-red-600"
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${passwordStrength.strength}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${passwordStrength.color}`}
                />
              </div>
            </motion.div>
          )}

          {/* Confirm Password Field */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type={showConfirm ? "text" : "password"}
              className="w-full border-2 border-gray-200 py-3 px-4 rounded-xl focus:outline-none focus:border-[#070A52] transition pr-12"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? (
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

          {/* Password Match Indicator */}
          {confirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs flex items-center space-x-1 ${
                newPassword === confirm ? "text-green-600" : "text-red-600"
              }`}
            >
              {newPassword === confirm ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Passwords do not match</span>
                </>
              )}
            </motion.div>
          )}

          <button
            className="w-full py-3 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? <HashLoader color="#fff" size={20} /> : "Reset Password"}
          </button>

          {msg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-600 bg-green-50 p-3 rounded-lg text-sm font-semibold"
            >
              {msg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600 bg-red-50 p-3 rounded-lg text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
