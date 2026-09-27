import { Resend } from "resend";

export const sendSubscriptionEmail = async (
  email,
  name,
  plan,
  paymentId,
  orderId
) => {
  try {
    console.log("Sending subscription email with Resend...");

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "YourTube <onboarding@resend.dev>",
      to: [email],
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

    if (error) {
      console.error("Resend subscription email error:", error);
      throw new Error(
        error.message || "Failed to send subscription email"
      );
    }

    console.log("Subscription email sent:", data?.id);

    return data;
  } catch (error) {
    console.error("Subscription email sending failed:", error);
    throw error;
  }
};