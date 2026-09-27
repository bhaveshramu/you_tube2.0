import OTP from "../Modals/otp.js";
import User from "../Modals/Auth.js";

export const verifyOTP = async (req, res) => {
  const {
    email,
    otp,
    city,
    state,
    deviceId,
  } = req.body;

  try {
    const otpRecord = await OTP.findOne({
      email,
      otp,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.city = city;
    user.state = state;
    user.deviceId = deviceId;

    await user.save();

    await OTP.deleteOne({
      _id: otpRecord._id,
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      result: user,
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
};