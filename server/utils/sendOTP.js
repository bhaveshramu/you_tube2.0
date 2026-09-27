import nodemailer from "nodemailer";
import dns from "dns";

export const sendOTPEmail = async (email, otp) => {
  try {
    const { address } = await dns.promises.lookup(
      "smtp.gmail.com",
      {
        family: 4,
      }
    );

    console.log("Gmail SMTP IPv4:", address);
    console.log("About to create SMTP transporter...");

    const transporter = nodemailer.createTransport({
      host: address,
      port: 587,
      secure: false,

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

    console.log("SMTP transporter created.");
    console.log("About to call sendMail...");

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "YourTube Login Verification OTP",
      html: `
        <h2>YourTube Login Verification</h2>

        <p>Your OTP for verifying this new login is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for 5 minutes.</p>

        <p>If you did not attempt to log in,
        please secure your account.</p>
      `,
    });

    console.log(
      "OTP email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "OTP email sending failed!"
    );

    console.error(
      "Error code:",
      error.code
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      "Error command:",
      error.command
    );

    throw error;
  }
};