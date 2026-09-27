import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
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