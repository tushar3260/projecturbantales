import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { sendResetPasswordOTP } from "../utils/sendOtpMail.js";

// REQUEST OTP (2 MINUTE EXPIRY)
export const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email not registered." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 1 * 60 * 1000; // 1 minutes
    await user.save();

    await sendResetPasswordOTP(email, otp);
    res.status(200).json({ msg: "OTP sent to your email address." });
  } catch (err) {
    console.error("Error in requestResetPassword:", err);
    res.status(500).json({ msg: "Server error while sending OTP." });
  }
};

// VERIFY OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Email not found." });

    if (user.resetOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    if (user.resetOTPExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired. Please resend." });
    }

    res.status(200).json({ msg: "OTP verified successfully." });
  } catch (err) {
    console.error("Error in verifyResetOTP:", err);
    res.status(500).json({ msg: "Server error verifying OTP." });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found." });
    if (user.resetOTP !== otp)
      return res.status(400).json({ msg: "Invalid OTP." });
    if (user.resetOTPExpires < Date.now())
      return res.status(400).json({ msg: "OTP expired. Please try again." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.status(200).json({ msg: "Password reset successful." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ msg: "Server error resetting password." });
  }
};
