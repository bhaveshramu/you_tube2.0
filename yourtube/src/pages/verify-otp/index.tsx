import React, { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";

const VerifyOTP = () => {
  const router = useRouter();

  const {
    otpRequired,
    pendingLogin,
    verifyOTP,
  } = useUser() as any;

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setMessage("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await verifyOTP(otp);

    setLoading(false);

    if (result.success) {
      router.push("/");
    } else {
      setMessage(
        result.message || "Invalid OTP."
      );
    }
  };

  if (!otpRequired || !pendingLogin) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            No OTP verification required.
          </h2>

          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Verify Your Login
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          We detected a new location or device.
        </p>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          A verification code has been sent to:
          <br />
          <span className="font-semibold">
            {pendingLogin.email}
          </span>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value.replace(/\D/g, "")
            )
          }
          placeholder="Enter 6-digit OTP"
          className="w-full border rounded-lg px-4 py-3 text-center text-xl tracking-widest bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />

        {message && (
          <p className="text-red-500 text-center mt-3">
            {message}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;