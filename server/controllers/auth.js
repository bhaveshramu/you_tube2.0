import mongoose from "mongoose";
import users from "../Modals/Auth.js";
import OTP from "../Modals/otp.js";
import { sendOTPEmail } from "../utils/sendOTP.js";

const otpRequestLocks=new Map();

export const login = async (req, res) => {
  const {
    email,
    name,
    image,
    city = "",
    state = "",
    deviceId = "",
  } = req.body;

  try {
    // ==========================================
    // GET CURRENT TIME IN IST
    // ==========================================

    const currentTime = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const [hour, minute] = currentTime
      .split(":")
      .map(Number);

    const totalMinutes = hour * 60 + minute;


    // ==========================================
    // TASK 4: AUTOMATIC THEME
    // 10:00 AM - 12:00 PM = LIGHT
    // OTHER TIMES = DARK
    // ==========================================

    const lightStart = 10 * 60;
    const darkStart = 12 * 60;

    const loginTheme =
      totalMinutes >= lightStart &&
      totalMinutes < darkStart
        ? "light"
        : "dark";


    // ==========================================
    // FIND USER
    // ==========================================

    const existingUser = await users.findOne({
      email,
    });


    // ==========================================
    // NEW USER
    // ==========================================

    if (!existingUser) {
  try {
    const newUser = await users.create({
      email,
      name,
      image,
      channelname: name,
      theme: loginTheme,
      themeMode: "auto",
      city,
      state,
      deviceId,
    });

    return res.status(201).json({
      result: newUser,
      requiresOTP: false,
    });
  } catch (createError) {
    // Another login request may have created this user
    // at the same time.
    if (createError.code === 11000) {
      console.log("User was created by another simultaneous login request.");

      const userCreatedByOtherRequest = await users.findOne({ email });

      if (userCreatedByOtherRequest) {
        return res.status(200).json({
          result: userCreatedByOtherRequest,
          requiresOTP: false,
        });
      }
    }

    throw createError;
  }
}


    // ==========================================
    // CHECK NEW LOCATION / STATE / DEVICE
    // ==========================================

    const isNewCity =
      existingUser.city &&
      city &&
      existingUser.city !== city;

    const isNewState =
      existingUser.state &&
      state &&
      existingUser.state !== state;

    const isNewDevice =
      existingUser.deviceId &&
      deviceId &&
      existingUser.deviceId !== deviceId;

    const requiresOTP =
      isNewCity ||
      isNewState ||
      isNewDevice;


    console.log("Saved city:", existingUser.city);
    console.log("New city:", city);

    console.log("Saved state:", existingUser.state);
    console.log("New state:", state);

    console.log("Saved device:", existingUser.deviceId);
    console.log("New device:", deviceId);

    console.log("New city?", isNewCity);
    console.log("New state?", isNewState);
    console.log("New device?", isNewDevice);

    console.log("Requires OTP?", requiresOTP);


    // ==========================================
    // NEW LOCATION OR DEVICE
    // ==========================================

if (requiresOTP) {
  // Prevent simultaneous OTP requests for the same email
  if (otpRequestLocks.has(email)) {
    console.log(
      "OTP request already in progress. Skipping duplicate request:",
      email
    );

    return res.status(200).json({
      requiresOTP: true,
      email,
      city,
      state,
      deviceId,
      message: "OTP already being sent. Please check your email.",
    });
  }

  // Lock this email
  otpRequestLocks.set(email, true);

  try {
    // Check if a valid OTP already exists
    const existingOTP = await OTP.findOne({
      email,
      expiresAt: { $gt: new Date() },
    });

    if (existingOTP) {
      console.log(
        "Valid OTP already exists. Skipping duplicate OTP email."
      );

      return res.status(200).json({
        requiresOTP: true,
        email,
        city,
        state,
        deviceId,
        message: "OTP already sent. Please check your email.",
      });
    }

    // Generate new OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Remove old OTPs
    await OTP.deleteMany({ email });

    // Create new OTP
    await OTP.create({
      email,
      otp,
      city,
      state,
      deviceId,
      expiresAt,
    });

    // Send exactly one email
    await sendOTPEmail(email, otp);

    console.log("OTP sent successfully to:", email);

    return res.status(200).json({
      requiresOTP: true,
      email,
      city,
      state,
      deviceId,
      message: "OTP sent successfully.",
    });
  } finally {
    // Always release the lock
    otpRequestLocks.delete(email);
  }
}


    // ==========================================
    // NORMAL LOGIN
    // ==========================================

    /*
      IMPORTANT:

      If the user selected a theme manually,
      DO NOT overwrite it.

      If the user is still using automatic mode,
      calculate the theme again based on login time.
    */

    if (existingUser.themeMode !== "manual") {
      existingUser.theme = loginTheme;
      existingUser.themeMode = "auto";
    }


    await existingUser.save();


    console.log(
      "Login theme:",
      existingUser.theme
    );

    console.log(
      "Theme mode:",
      existingUser.themeMode
    );


    return res.status(200).json({
      result: existingUser,
      requiresOTP: false,
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong",
    });
  }
};


// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;

  const {
    channelname,
    description,
    theme,
    themeMode,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({
      message: "User unavailable...",
    });
  }

  try {
    const updateFields = {};

    // Update channel name
    if (channelname !== undefined) {
      updateFields.channelname = channelname;
    }

    // Update description
    if (description !== undefined) {
      updateFields.description = description;
    }

    // Update theme
    if (theme !== undefined) {
      updateFields.theme = theme;
    }

    // Update theme mode
    if (themeMode !== undefined) {
      updateFields.themeMode = themeMode;
    }

    const updatedata = await users.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    return res.status(200).json(updatedata);

  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};