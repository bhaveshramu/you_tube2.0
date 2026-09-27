"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  browserPopupRedirectResolver,
  type User as FirebaseUser,
} from "firebase/auth";

import {
  useState,
  createContext,
  useEffect,
  useContext,
  useRef,
} from "react";

import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useRouter } from "next/router";

// ==============================
// TYPES
// ==============================

type Theme = "light" | "dark";

type User = {
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
  city?: string;
  state?: string;
  deviceid?: string;
  theme?: Theme;
  [key: string]: any;
};

type PendingLogin = {
  email: string;
  name: string;
  image: string;
  city: string;
  state: string;
  deviceId: string;
};

type UserContextType = {
  user: User | null;
  login: (userdata: User) => void;
  logout: () => Promise<void>;
  handlegooglesignin: () => Promise<void>;
  changeTheme: (theme: Theme) => Promise<void>;
  otpRequired: boolean;
  pendingLogin: PendingLogin | null;
  verifyOTP: (otp: string) => Promise<void>;
};

// ==============================
// CONTEXT
// ==============================

const UserContext =
  createContext<UserContextType | null>(null);

// ==============================
// USER PROVIDER
// ==============================

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  // Prevent duplicate backend login requests
  const loginProcessingRef = useRef(false);

  const [user, setUser] = useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [otpRequired, setOtpRequired] =
    useState(false);

  const [pendingLogin, setPendingLogin] =
    useState<PendingLogin | null>(null);

  // ==============================
  // RESTORE LOCAL USER + OTP STATE
  // ==============================

  useEffect(() => {
    // Restore normal logged-in user
    const savedUser =
      localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error(
          "Failed to restore saved user:",
          error
        );

        localStorage.removeItem("user");
      }
    }

    // Restore pending OTP login
    const savedPendingLogin =
      sessionStorage.getItem("pendingLogin");

    if (savedPendingLogin) {
      try {
        const parsedPendingLogin =
          JSON.parse(savedPendingLogin);

        setPendingLogin(
          parsedPendingLogin
        );

        setOtpRequired(true);
      } catch (error) {
        console.error(
          "Pending login restore error:",
          error
        );

        sessionStorage.removeItem(
          "pendingLogin"
        );
      }
    }

    setAuthLoading(false);
  }, []);

  // ==============================
  // FIREBASE AUTH STATE
  // ==============================
  //
  // IMPORTANT:
  // This listener does NOT call processLogin().
  //
  // Firebase can restore an existing session when
  // the website opens. That must NOT trigger OTP.
  //
  // Actual backend login happens only inside
  // handlegooglesignin() AFTER signInWithPopup()
  // successfully returns.
  // ==============================

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    (firebaseuser) => {
      if (firebaseuser) {
        console.log(
          "Firebase session detected:",
          firebaseuser.email
        );
      } else {
        console.log(
          "No Firebase session."
        );
      }
    }
  );

  return () => {
    unsubscribe();
  };
}, []);

  // ==============================
  // LOGIN
  // ==============================

  const login = (userdata: User) => {
    setUser(userdata);

    localStorage.setItem(
      "user",
      JSON.stringify(userdata)
    );

    setOtpRequired(false);
    setPendingLogin(null);

    sessionStorage.removeItem(
      "pendingLogin"
    );
  };

  // ==============================
  // LOGOUT
  // ==============================

  const logout = async () => {
    setUser(null);

    setOtpRequired(false);

    setPendingLogin(null);

    loginProcessingRef.current = false;

    localStorage.removeItem("user");

    sessionStorage.removeItem(
      "pendingLogin"
    );

    try {
      await signOut(auth);

      router.replace("/");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  // ==============================
  // GET LOCATION
  // ==============================

  const getLocation = async () => {
    try {
      const response =
        await fetch(
          "https://ipapi.co/json/"
        );

      const data =
        await response.json();

      return {
        city: data.city || "",
        state: data.region || "",
      };
    } catch (error) {
      console.error(
        "Location error:",
        error
      );

      return {
        city: "",
        state: "",
      };
    }
  };

  // ==============================
  // GET DEVICE ID
  // ==============================

  const getDeviceId = () => {
    let deviceId =
      localStorage.getItem(
        "yourTubeDeviceId"
      );

    if (!deviceId) {
      if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID ===
          "function"
      ) {
        deviceId =
          crypto.randomUUID();
      } else {
        deviceId =
          "device-" +
          Date.now() +
          "-" +
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

  // ==============================
  // PROCESS GOOGLE LOGIN
  // ==============================

  const processLogin = async (
    firebaseuser: FirebaseUser
  ) => {
    if (loginProcessingRef.current) {
      console.log(
        "Login already processing. Skipping duplicate request."
      );

      return;
    }

    loginProcessingRef.current = true;

    try {
      // Do not start another request if
      // OTP verification is already pending.
      const existingPendingLogin =
        sessionStorage.getItem(
          "pendingLogin"
        );

      if (existingPendingLogin) {
        console.log(
          "OTP verification already pending."
        );

        return;
      }

      console.log(
        "Processing selected Google account:",
        firebaseuser.email
      );

      // Get location
      const location =
        await getLocation();

      // Get device ID
      const deviceId =
        getDeviceId();

      // Prepare backend payload
      const payload = {
        email:
          firebaseuser.email || "",

        name:
          firebaseuser.displayName || "",

        image:
          firebaseuser.photoURL || "",

        city:
          location.city,

        state:
          location.state,

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

      // ==============================
      // OTP REQUIRED
      // ==============================

      if (
        response.data.requiresOTP
      ) {
        const pendingData: PendingLogin =
          {
            email:
              firebaseuser.email || "",

            name:
              firebaseuser.displayName ||
              "",

            image:
              firebaseuser.photoURL || "",

            city:
              location.city,

            state:
              location.state,

            deviceId,
          };

        setPendingLogin(
          pendingData
        );

        setOtpRequired(true);

        sessionStorage.setItem(
          "pendingLogin",
          JSON.stringify(
            pendingData
          )
        );

        console.log(
          "OTP required. Redirecting to /verify-otp"
        );

        window.location.href =
          "/verify-otp";

        return;
      }

      // ==============================
      // NORMAL LOGIN
      // ==============================

      console.log(
        "Normal login successful."
      );

      login(
        response.data.result
      );
    } catch (error) {
      console.error(
        "Login processing error:",
        error
      );
    } finally {
      loginProcessingRef.current =
        false;
    }
  };

  // ==============================
  // GOOGLE SIGN IN
  // ==============================

 const handlegooglesignin = async () => {
  try {
    console.log("Google Sign In button clicked.");

    setAuthLoading(true);

    const result = await signInWithPopup(
      auth,
      provider,
      browserPopupRedirectResolver
    );

    // This executes only AFTER the Google
    // popup has completed and an account
    // has been selected.
    console.log(
      "Google account selected:",
      result.user.email
    );

    // Only now contact the backend.
    await processLogin(result.user);
  } catch (error: any) {
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
  } finally {
    setAuthLoading(false);
  }
};

  // ==============================
  // VERIFY OTP
  // ==============================

  const verifyOTP = async (
    otp: string
  ) => {
    if (!pendingLogin) {
      console.error(
        "No pending login found."
      );

      return;
    }

    try {
      const response =
        await axiosInstance.post(
          "/otp/verify",
          {
            email:
              pendingLogin.email,

            otp,

            name:
              pendingLogin.name,

            image:
              pendingLogin.image,

            city:
              pendingLogin.city,

            state:
              pendingLogin.state,

            deviceId:
              pendingLogin.deviceId,
          }
        );

      if (
        response.data.result
      ) {
        login(
          response.data.result
        );

        window.location.href =
          "/";
      }
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      throw error;
    }
  };

  // ==============================
  // CHANGE THEME
  // ==============================

  const changeTheme = async (
    theme: Theme
  ) => {
    if (!user) {
      return;
    }

    // Apply theme immediately
    if (theme === "dark") {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }

    // Update React state
    const updatedUser = {
      ...user,
      theme,
      themeMode: "manual",
    };

    setUser(updatedUser);

    // Save locally
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    // Notify _app.tsx
    window.dispatchEvent(
      new CustomEvent(
        "yourtube-theme-change",
        {
          detail: theme,
        }
      )
    );

    // Save to MongoDB
    try {
      await axiosInstance.patch(
        `/user/update/${user._id}`,
        {
          theme,
          themeMode: "manual",
        }
      );

      console.log(
        "Theme saved:",
        theme
      );
    } catch (error) {
      console.error(
        "Theme save error:",
        error
      );
    }
  };

  // ==============================
  // PROVIDER
  // ==============================

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        changeTheme,
        otpRequired,
        pendingLogin,
        verifyOTP,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ==============================
// USE USER HOOK
// ==============================

export const useUser = () => {
  const context =
    useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used inside UserProvider"
    );
  }

  return context;
};