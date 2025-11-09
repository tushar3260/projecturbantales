import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { motion } from "framer-motion";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const logoUrl = "https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png";

export default function UserVerifyOtp() {
  const [otp, setOTP] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(2 * 60); // 2 min for users
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (timer <= 0) {
      setError("❌ OTP has expired. Please request a new one.");
      setOTP(""); // Clear OTP
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ OTP verified successfully! Redirecting...");
        setTimeout(
          () =>
            navigate(
              `/reset-password/confirm?email=${encodeURIComponent(
                email
              )}&otp=${otp}`
            ),
          1000
        );
      } else {
        setError(data.msg || "❌ Invalid or expired OTP.");
        setOTP("");
      }
    } catch {
      setError("⚠️ Server error. Try again later.");
      setOTP("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("🔁 New OTP sent to your email! If not in Inbox, check Spam/Junk folder.");
        setTimer(120); // 2 minute for user
        setOTP("");
      } else {
        setError(data.msg || "Failed to resend OTP.");
      }
    } catch {
      setError("⚠️ Server error. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-blue-100">
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
              User OTP Verification
            </h2>
            <p className="text-sm text-gray-500">
              Enter the 6-digit OTP sent to <br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
            <p className="text-xs text-blue-700 bg-blue-50 border-l-4 border-blue-300 px-2 py-1 mt-2 rounded">
              If you don’t find your email in your inbox, please check your Spam/Junk folder.
            </p>
          </div>
          <div className="flex justify-center items-center space-x-2">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                maxLength={1}
                type="text"
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#070A52] focus:outline-none transition"
                value={otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/, "");
                  if (val) {
                    const newOtp = otp.split("");
                    newOtp[i] = val;
                    setOTP(newOtp.join("").slice(0, 6));
                    if (i < 5 && val) {
                      e.target.nextSibling?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    if (!otp[i] && i > 0) {
                      const newOtp = otp.split("");
                      newOtp[i - 1] = "";
                      setOTP(newOtp.join(""));
                      e.target.previousSibling?.focus();
                    } else if (otp[i]) {
                      const newOtp = otp.split("");
                      newOtp[i] = "";
                      setOTP(newOtp.join(""));
                    }
                  }
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <div className="text-center">
            {timer > 0 ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-[#070A52]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className={`text-sm font-semibold ${timer < 20 ? 'text-red-500' : 'text-gray-600'}`}>
                  OTP expires in {formatTime(timer)}
                </span>
              </div>
            ) : (
              <p className="text-red-500 text-sm font-semibold">❌ OTP Expired</p>
            )}
          </div>
          <button
            className="w-full py-3 bg-gradient-to-r from-[#070A52] to-[#FFCC00] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            type="submit"
            disabled={loading || otp.length !== 6}
          >
            {loading ? <HashLoader color="#fff" size={20} /> : "Verify OTP"}
          </button>
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Didn't receive code?{" "}
                <button
                  type="button"
                  className="text-[#070A52] font-semibold hover:underline"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? "Resending..." : "Resend"}
                </button>
              </p>
            ) : (
              <button
                type="button"
                className="text-sm bg-gradient-to-r from-[#070A52] to-[#FFCC00] text-white px-6 py-2 rounded-full hover:shadow-md transition"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            )}
          </div>
          {msg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-600 bg-green-50 p-3 rounded-lg text-sm"
            >
              {msg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600 bg-red-50 p-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}


