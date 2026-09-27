import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../Modals/auth.js";
import { sendSubscriptionEmail } from "../utils/sendEmail.js";

export const createOrder = async (req, res) => {
  const { plan } = req.body;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const prices = {
    Bronze: 199,
    Silver: 499,
    Gold: 999,
  };

  try {
    const order = await razorpay.orders.create({
      amount: prices[plan] * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create Razorpay order.",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    plan,
  } = req.body;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { plan },
      { new: true }
    );

    // Try sending email, but don't fail the payment if email fails
    try {
      await sendSubscriptionEmail(
        updatedUser.email,
        updatedUser.name,
        plan,
        razorpay_payment_id,
        razorpay_order_id
      );
    } catch (emailError) {
      console.error("Email Error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed.",
    });
  }
};