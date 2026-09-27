import nodemailer from "nodemailer";
import dns from "dns";

export const sendOTPEmail = async (email, otp) => {
  try {
    // Resolve Gmail SMTP to IPv4
    const { address } = await dns.promises.lookup("smtp.gmail.com", {
      family: 4,
    });

    console.log("Gmail SMTP IPv4:", address);

    // Create Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: address,
      port: 587,
      secure: false,

      // Timeout settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,

      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },

      tls: {
        servername: "smtp.gmail.com",
      },
    });

    console.log("Attempting to send OTP email to:", email);

    // Send OTP email
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "YourTube Login Verification OTP",
      html: `
        <h2>YourTube Login Verification</h2>

        <p>Your OTP for verifying this new login is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>

        <p>
          If you did not attempt to log in,
          please secure your account.
        </p>
      `,
    });

    console.log("OTP email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("OTP email sending failed!");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error command:", error.command);

    throw error;
  }
};