import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export const sendSubscriptionEmail = async (
  email,
  name,
  plan,
  paymentId,
  orderId
) => {
  try {
    console.log("Sending subscription email with MailerSend...");

    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    const sentFrom = new Sender(
      "info@test-eqvygm06nodl0p7w.mlsender.net",
      "YourTube"
    );

    const recipients = [
      new Recipient(email, name || "YourTube User"),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("YourTube Subscription Upgrade Successful")
      .setHtml(`
        <h2>Subscription Upgrade Successful 🎉</h2>

        <p>Hello ${name || "User"},</p>

        <p>Your YourTube subscription has been successfully upgraded.</p>

        <h3>Subscription Details</h3>

        <p><strong>Plan:</strong> ${plan}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>

        <p>Thank you for using YourTube!</p>

        <p>
          Regards,<br>
          <strong>YourTube Team</strong>
        </p>
      `)
      .setText(`
YourTube Subscription Upgrade Successful

Hello ${name || "User"},

Your YourTube subscription has been successfully upgraded.

Plan: ${plan}
Payment ID: ${paymentId}
Order ID: ${orderId}

Thank you for using YourTube!

Regards,
YourTube Team
      `);

    const response = await mailerSend.email.send(emailParams);

    console.log("Subscription email sent successfully:", response);

    return response;
  } catch (error) {
    console.error("MailerSend subscription email error:", error);
    throw error;
  }
};