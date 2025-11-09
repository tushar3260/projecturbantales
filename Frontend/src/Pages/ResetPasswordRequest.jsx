import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const logoUrl = "https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png";

// Simple email format validation
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("info");
  const [fade, setFade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (msg) {
      setFade(true);
      const t = setTimeout(() => setFade(false), 2200);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setType("info");

    if (!validateEmail(email)) {
      setMsg("❌ Please enter a valid email address.");
      setType("error");
      setIsValid(false);
      return;
    }

    setLoading(true);
    setIsValid(true);

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
        setMsg(
          "✅ OTP sent! Please check your inbox. If you don’t find it there, make sure to look in your Spam or Junk folder too."
        );
        setType("success");
        setTimeout(
          () => navigate(`/reset-password/otp?email=${encodeURIComponent(email)}`),
          1300
        );
      } else {
        setMsg(data.msg || "❌ Something went wrong.");
        setType("error");
      }
    } catch {
      setMsg("⚠️ Server error. Try again later.");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  const fadeAnim = fade && msg ? "transition-opacity duration-700 opacity-100" : "opacity-0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-50 to-blue-50">
      <form
        className="space-y-6 bg-white shadow-2xl p-8 rounded-3xl w-full max-w-lg animate-fade-in"
        onSubmit={handleSubmit}
      >
        <img src={logoUrl} className="mx-auto w-36 mb-4 animate-pop" alt="UrbanTales" />
        <h2 className="font-bold text-2xl mb-2 text-[#070A52] text-center">
          Reset Password
        </h2>

        {/* Info Box */}
        <div className="text-blue-700 text-xs bg-blue-50 border-l-4 border-blue-300 px-3 py-2 rounded mb-2 animate-fade-in">
          Enter your registered email to receive an OTP for password reset.<br />
          If you don’t find your mail in your inbox, please check your Spam/Junk folder.
        </div>

        <input
          className={`w-full border py-3 rounded-xl px-3 text-base focus:ring-2 focus:ring-yellow-400 transition-all ${
            isValid ? "" : "border-red-400 ring-red-500"
          }`}
          value={email}
          type="email"
          onChange={(e) => {
            setEmail(e.target.value);
            setIsValid(validateEmail(e.target.value));
          }}
          placeholder="Enter your registered email"
          required
          disabled={loading}
        />
        <button
          className="w-full py-3 font-semibold rounded-xl transition bg-gradient-to-r from-[#070A52] to-[#FFCC00] text-white hover:from-[#FFCC00] hover:to-[#070A52] mt-2 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? <HashLoader color="#fff" size={22} /> : "Send OTP"}
        </button>

        {msg && (
          <div
            className={`text-center mt-3 rounded px-3 py-2 text-base
              ${type === "success"
                ? "text-green-700 bg-green-100 border-l-4 border-green-400"
                : type === "error"
                ? "text-red-700 bg-red-100 border-l-4 border-red-400"
                : "text-blue-700 bg-blue-100 border-l-4 border-blue-300"
              }
                  ${fadeAnim}
            `}
          >
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
