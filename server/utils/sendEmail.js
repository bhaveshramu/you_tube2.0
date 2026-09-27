import nodemailer from "nodemailer";

export const sendSubscriptionEmail = async (
  email,
  name,
  plan,
  paymentId,
  orderId
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
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

    console.log("Subscription email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Subscription email sending failed!");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    throw error;
  }
};