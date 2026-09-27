"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  browserPopupRedirectResolver,
} from "firebase/auth";

import {
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";

import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // OTP states
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  // Tracks whether the user intentionally clicked Google Sign In
  const [loginRequested, setLoginRequested] = useState(false);

  // --------------------------------------------------
  // Restore pending OTP login
  // --------------------------------------------------
  useEffect(() => {
    const savedPendingLogin =
      sessionStorage.getItem("pendingLogin");

    if (savedPendingLogin) {
      try {
        const parsedPendingLogin =
          JSON.parse(savedPendingLogin);

        setPendingLogin(parsedPendingLogin);
        setOtpRequired(true);
      } catch (error) {
        console.error(
          "Failed to restore pending login:",
          error
        );

        sessionStorage.removeItem("pendingLogin");
      }
    }
  }, []);

  // --------------------------------------------------
  // Get user's city and state
  // --------------------------------------------------
  const getLocation = async () => {
    try {
      const response = await fetch(
        "https://ipapi.co/json/"
      );

      const data = await response.json();

      return {
        city: data.city || "",
        state: data.region || "",
      };
    } catch (error) {
      console.error(
        "Unable to get location:",
        error
      );

      return {
        city: "",
        state: "",
      };
    }
  };

  // --------------------------------------------------
  // Create a device ID for this browser
  // --------------------------------------------------
  const getDeviceId = () => {
    let deviceId =
      localStorage.getItem("yourTubeDeviceId");

    if (!deviceId) {
      if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
      ) {
        deviceId = crypto.randomUUID();
      } else {
        deviceId =
          Date.now().toString(36) +
          Math.random()
            .toString(36)
            .substring(2) +
          Math.random()
            .toString(36)
            .substring(2);
      }

      localStorage.setItem(
        "yourTubeDeviceId",
        deviceId
      );
    }

    return deviceId;
  };

  // --------------------------------------------------
  // Normal login
  // --------------------------------------------------
  const login = (userdata) => {
    setUser(userdata);

    localStorage.setItem(
      "user",
      JSON.stringify(userdata)
    );

    setOtpRequired(false);
    setPendingLogin(null);

    sessionStorage.removeItem("pendingLogin");
  };

  // --------------------------------------------------
  // Process Google login
  // --------------------------------------------------
  const processLogin = async (firebaseuser) => {
    const existingPendingLogin =
      sessionStorage.getItem("pendingLogin");

    if (existingPendingLogin) {
      console.log(
        "OTP verification already pending."
      );

      return;
    }

    const location = await getLocation();

    const deviceId = getDeviceId();

    const payload = {
      email: firebaseuser.email,
      name: firebaseuser.displayName,
      image:
        firebaseuser.photoURL ||
        "https://github.com/shadcn.png",

      city: location.city,
      state: location.state,
      deviceId,
    };

    console.log(
      "Sending login information to backend..."
    );

    const response =
      await axiosInstance.post(
        "/user/login",
        payload
      );

    // --------------------------------------------------
    // OTP required
    // --------------------------------------------------
    if (response.data.requiresOTP) {
      const pendingData = {
        email: response.data.email,
        city: response.data.city,
        state: response.data.state,
        deviceId: response.data.deviceId,
      };

      setPendingLogin(pendingData);
      setOtpRequired(true);

      sessionStorage.setItem(
        "pendingLogin",
        JSON.stringify(pendingData)
      );

      window.location.href =
        "/verify-otp";

      return;
    }

    // --------------------------------------------------
    // Normal login
    // --------------------------------------------------
    login(response.data.result);
  };

  // --------------------------------------------------
  // Google Sign In
  // --------------------------------------------------
  const handlegooglesignin = async () => {
    try {
      console.log(
        "Google Sign In button clicked."
      );

      setLoginRequested(true);

      await signInWithPopup(
        auth,
        provider,
        browserPopupRedirectResolver
      );

    } catch (error) {
      console.error(
        "Google sign-in error:",
        error
      );

      console.error(
        "Error code:",
        error?.code
      );

      console.error(
        "Error message:",
        error?.message
      );

      setLoginRequested(false);
      setAuthLoading(false);
    }
  };

  // --------------------------------------------------
  // Firebase authentication listener
  // --------------------------------------------------
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseuser) => {
          try {
            // ------------------------------------------
            // No Firebase user
            // ------------------------------------------
            if (!firebaseuser) {
              const savedUser =
                localStorage.getItem("user");

              if (savedUser) {
                try {
                  setUser(
                    JSON.parse(savedUser)
                  );
                } catch (error) {
                  console.error(
                    "Failed to restore user:",
                    error
                  );
                }
              }

              return;
            }

            // ------------------------------------------
            // OTP already pending
            // ------------------------------------------
            const existingPendingLogin =
              sessionStorage.getItem(
                "pendingLogin"
              );

            if (existingPendingLogin) {
              console.log(
                "Pending OTP login found. Skipping automatic login."
              );

              return;
            }

            // ------------------------------------------
            // Firebase restored an old session
            // ------------------------------------------
            if (!loginRequested) {
              console.log(
                "Firebase session restored. Skipping automatic login."
              );

              return;
            }

            // ------------------------------------------
            // User intentionally clicked Google Sign In
            // ------------------------------------------
            await processLogin(
              firebaseuser
            );

          } catch (error) {
            console.error(
              "Login error:",
              error
            );
          } finally {
            setAuthLoading(false);
            setLoginRequested(false);
          }
        }
      );

    return () => unsubscribe();
  }, [loginRequested]);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const logout = async () => {
    setUser(null);
    setOtpRequired(false);
    setPendingLogin(null);
    setLoginRequested(false);

    localStorage.removeItem("user");
    sessionStorage.removeItem(
      "pendingLogin"
    );

    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Error during sign out:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Verify OTP
  // --------------------------------------------------
  const verifyOTP = async (otp) => {
    if (!pendingLogin) {
      return {
        success: false,
        message:
          "No OTP verification pending.",
      };
    }

    try {
      const response =
        await axiosInstance.post(
          "/otp/verify",
          {
            email: pendingLogin.email,
            otp,
            city: pendingLogin.city,
            state: pendingLogin.state,
            deviceId:
              pendingLogin.deviceId,
          }
        );

      if (response.data.success) {
        login(response.data.result);

        return {
          success: true,
        };
      }

      return {
        success: false,
        message:
          response.data.message,
      };

    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "OTP verification failed.",
      };
    }
  };

  // --------------------------------------------------
  // Change theme
  // --------------------------------------------------
  const changeTheme = async (theme) => {
    if (!user) {
      return;
    }

    try {
      await axiosInstance.patch(
        `/user/update/${user._id}`,
        {
          theme,
        }
      );

      const updatedUser = {
        ...user,
        theme,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

    } catch (error) {
      console.error(
        "Theme update error:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Context
  // --------------------------------------------------
  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        changeTheme,
        authLoading,

        // OTP
        otpRequired,
        pendingLogin,
        verifyOTP,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// --------------------------------------------------
// useUser hook
// --------------------------------------------------
export const useUser = () =>
  useContext(UserContext);