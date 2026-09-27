import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    default: "",
  },

  state: {
    type: String,
    default: "",
  },

  deviceId: {
    type: String,
    default: "",
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

const OTP =
  mongoose.models.OTP ||
  mongoose.model("OTP", otpSchema);

export default OTP;