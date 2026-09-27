import nodemailer from "nodemailer";
import "../config/env.js";
export const sendSubscriptionEmail = async (
  email,
  name,
  plan,
  paymentId,
  orderId
) => {

  console.log("EMAIL:", process.env.EMAIL);
  console.log(
    "EMAIL_PASSWORD:",
    process.env.EMAIL_PASSWORD ? "wlvwaqdomfvpphdq" : "Missing"
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Subscription Upgrade Successful",

    html: `
      <h2>Hello ${name},</h2>

      <p>Your subscription has been upgraded successfully.</p>

      <ul>
        <li><b>Plan:</b> ${plan}</li>
        <li><b>Payment ID:</b> ${paymentId}</li>
        <li><b>Order ID:</b> ${orderId}</li>
      </ul>

      <p>Thank you for using YourTube.</p>
    `,
  });
};