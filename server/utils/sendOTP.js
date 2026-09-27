import { Resend } from "resend";

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log("Sending OTP email with Resend...");

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "YourTube <onboarding@resend.dev>",
      to: [email],
      subject: "YourTube Login Verification OTP",
      html: `
        <h2>YourTube Login Verification</h2>
        <p>Your OTP for login verification is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      throw new Error(error.message || "Failed to send OTP email");
    }

    console.log("OTP email sent successfully:", data?.id);
    return data;
  } catch (error) {
    console.error("OTP email sending failed:", error);
    throw error;
  }
};