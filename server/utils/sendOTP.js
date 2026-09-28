import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("Sending OTP email with MailerSend...");

    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    const sentFrom = new Sender(
      "info@test-eqvygm06nodl0p7w.mlsender.net",
      "YourTube"
    );

    const recipients = [
      new Recipient(email, "YourTube User"),
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("YourTube Login Verification OTP")
      .setHtml(`
        <h2>YourTube Login Verification</h2>

        <p>Your OTP for login verification is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>

        <p>If you did not request this OTP, you can ignore this email.</p>
      `)
      .setText(
        `YourTube Login Verification\n\nYour OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.`
      );

    const response = await mailerSend.email.send(emailParams);

    console.log("OTP email sent successfully:", response);

    return response;
  } catch (error) {
    console.error("MailerSend OTP email error:", error);
    throw error;
  }
};