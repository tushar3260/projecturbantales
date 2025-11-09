import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendWelcomeMail = async (email, fullName) => {
  const html = `
    <div style="background: #f7f7f7; padding: 30px; font-family: 'Segoe UI', sans-serif;">
      <div style="max-width: 600px; background: white; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #070A52; padding: 25px; text-align: center;">
          <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png"
            alt="UrbanTales Logo" style="width: 120px; margin-bottom: 10px;" />
          <h1 style="color: #FFCC00; font-size: 22px; margin: 0;">Welcome to UrbanTales</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px 40px;">
          <h2 style="color: #070A52; margin-bottom: 10px;">Hey ${fullName || "there"},</h2>
          <p style="color: #333; font-size: 15px; line-height: 1.7;">
            We're thrilled to have you on board! 🎉<br/>
            Welcome to <strong>UrbanTales</strong> — your one-stop destination for premium urban lifestyle products.
          </p>

          <div style="background: #f9f9f9; border-left: 4px solid #FFCC00; padding: 15px 20px; margin: 20px 0; border-radius: 10px;">
            <p style="margin: 0; color: #555; font-size: 15px;">
              Explore exclusive collections, track your orders, and enjoy a seamless shopping experience.
            </p>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://urbantales.netlify.app/" 
              style="background-color: #070A52; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: 0.3s;">
              Start Shopping
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 13px; color: #777; text-align: center;">
            If you have any questions, feel free to reach out at 
            <a href="mailto:urbantales4@gmail.com" style="color:#070A52; text-decoration:none;">urbantales4@gmail.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #070A52; color: white; text-align: center; padding: 15px;">
          <p style="margin: 0; font-size: 13px;">© ${new Date().getFullYear()} UrbanTales. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  `;

  await sgMail.send({
    to: email,
    from: {
      email: "urbantales4@gmail.com", // must be verified on SendGrid
      name: "UrbanTales",
    },
    subject: "🎉 Welcome to UrbanTales!",
    html,
  });
};
