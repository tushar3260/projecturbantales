import nodemailer from "nodemailer";
export const sendResetPasswordOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });
  const html = `
    <div style="background:#fff;border:2px solid #FFCC00;padding:1.5rem 2.5rem;border-radius:18px;max-width:400px;margin:2rem auto;">
      <img src="https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_
" alt="UrbanTales" style="width:140px;margin-bottom:14px;"/>
      <h2 style="color:#070A52;">Password Reset Request</h2>
      <div style="font-size:16px;margin:1rem 0;">Your OTP is:</div>
      <div style="font-size:36px;font-weight:bold;letter-spacing:0.6rem;color:#FFCC00;margin:8px 0 18px;font-family:monospace;">${otp}</div>
      <div style="font-size:14px;">This OTP is valid for <b>1 minute</b> only.<br/>If you didn’t request a reset, safely ignore this email.<br/><br/><span style="color:#909090;"><b>UrbanTales Security Team</b></span></div>
    </div>
  `;
  await transporter.sendMail({
    from: '"UrbanTales" <no-reply@urbantales.com>',
    to: email,
    subject: "UrbanTales Reset Password OTP",
    html
  });
};
