import nodemailer from "nodemailer";
import dns from "dns";

export const sendOTPEmail = async (email, otp) => {
  const { address } = await dns.promises.lookup("smtp.gmail.com", {
    family: 4,
  });

  console.log("Gmail SMTP IPv4:", address);

  const transporter = nodemailer.createTransport({
    host: address,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      servername: "smtp.gmail.com",
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "YourTube Login Verification OTP",

    html: `
      <h2>YourTube Login Verification</h2>

      <p>Your OTP for verifying this new login is:</p>

      <h1>${otp}</h1>

      <p>This OTP is valid for 5 minutes.</p>

      <p>If you did not attempt to log in, please secure your account.</p>
    `,
  });
};