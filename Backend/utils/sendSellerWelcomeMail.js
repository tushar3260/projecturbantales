import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Seller Welcome Email Utility
export const sendSellerWelcomeMail = async (email, sellerName) => {
  const siteURL = "https://urbantales.netlify.app";
  const sellerDashboard = "https://urbantales.netlify.app/seller-onboarding";
  const logoURL = "https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png";

  const msg = {
    to: email,
    from: {
      email: "urbantales4@gmail.com",
      name: "UrbanTales Seller Team",
    },
    subject: `Welcome to UrbanTales Seller Platform, ${sellerName}!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f7; padding: 30px;">
        <div style="max-width: 650px; background: white; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; padding: 25px 0; background: #000; color: #fff;">
            <img src="${logoURL}" alt="UrbanTales" style="width: 130px; height: auto; margin-bottom: 10px;" />
            <h2 style="margin: 0; font-weight: 600;">Welcome to UrbanTales Sellers</h2>
          </div>

          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hey <strong>${sellerName}</strong>,</p>
            
            <p style="font-size: 15px; color: #444;">
              We’re thrilled to have you onboard as part of the <strong>UrbanTales Seller Community</strong>!  
              Your journey to showcasing unique products and reaching thousands of customers starts now 🚀
            </p>

            <p style="font-size: 15px; color: #444;">
              You can access your seller dashboard anytime to manage your store, products, and orders:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${sellerDashboard}" 
                style="background: #000; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 15px;">
                Go to Seller Dashboard
              </a>
            </div>

            <p style="font-size: 15px; color: #444;">
              Need help? Visit our <a href="${siteURL}/help" style="color:#000; text-decoration: underline;">Help Center</a> or contact our support team anytime.
            </p>

            <p style="margin-top: 25px; font-size: 15px;">
              Welcome aboard and happy selling!<br/>
              — The <strong>UrbanTales Seller Team</strong>
            </p>
          </div>

          <div style="background: #000; color: #fff; text-align: center; padding: 10px; font-size: 12px;">
            © ${new Date().getFullYear()} UrbanTales. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  await sgMail.send(msg);
};
