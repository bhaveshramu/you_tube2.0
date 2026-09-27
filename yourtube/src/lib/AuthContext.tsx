import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
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

const UserContext = createContext<UserContextType | null>(null);


// ==============================
// USER PROVIDER
// ==============================

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loginProcessingRef = useRef(false);

  const [user, setUser] = useState<User | null>(null);

  const [otpRequired, setOtpRequired] =
    useState(false);

  const [pendingLogin, setPendingLogin] =
    useState<PendingLogin | null>(null);

  const router = useRouter();


  // ==============================
  // RESTORE PENDING LOGIN
  // ==============================

  useEffect(() => {

    const savedPendingLogin =
      sessionStorage.getItem("pendingLogin");

    if (savedPendingLogin) {

      try {

        setPendingLogin(
          JSON.parse(savedPendingLogin)
        );

        setOtpRequired(true);

      } catch (error) {

        console.error(
          "Pending login restore error:",
          error
        );

      }

    }

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

    localStorage.removeItem("user");
    sessionStorage.removeItem("pendingLogin");

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
        crypto.randomUUID
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
    firebaseuser: any
  ) => {
    if (loginProcessingRef.current) {
      console.log("Login already processing. Skipping duplicate request.");
      return;
    }

    loginProcessingRef.current = true;

    const existingPendingLogin =
      sessionStorage.getItem(
        "pendingLogin"
      );

    if (existingPendingLogin) {

      return;

    }


    const location =
      await getLocation();

    const deviceId =
      getDeviceId();


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


    try {

      const response =
        await axiosInstance.post(
          "/user/login",
          payload
        );


      // ==========================
      // OTP REQUIRED
      // ==========================

      if (
        response.data.requiresOTP
      ) {

        const pendingData: PendingLogin = {

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


        window.location.href =
          "/verify-otp";

        return;

      }


      // ==========================
      // NORMAL LOGIN
      // ==========================

      login(
        response.data.result
      );

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

    }

  };


  // ==============================
  // GOOGLE SIGN IN
  // ==============================

  const handlegooglesignin =
    async () => {

      try {

        await signInWithPopup(
          auth,
          provider
        );

      } catch (error) {

        console.error(
          "Google sign-in error:",
          error
        );

      }

    };


  // ==============================
  // FIREBASE AUTH STATE
  // ==============================

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseuser) => {

          if (!firebaseuser) {

            return;

          }


          const existingPendingLogin =
            sessionStorage.getItem(
              "pendingLogin"
            );

          if (
            existingPendingLogin
          ) {

            return;

          }


          try {

            await processLogin(
              firebaseuser
            );

          } catch (error) {

            console.error(
              "Authentication error:",
              error
            );

          }

        }
      );


    return () => {

      unsubscribe();

    };

  }, []);


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

  const changeTheme = async (theme: Theme) => {
    if (!user) return;

    // Apply theme immediately
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Update React + localStorage immediately
    const updatedUser = {
      ...user,
      theme,
      themeMode: "manual",
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Tell _app.tsx immediately
    window.dispatchEvent(
      new CustomEvent("yourtube-theme-change", {
        detail: theme,
      })
    );

    // Save to MongoDB
    try {
      await axiosInstance.patch(`/user/update/${user._id}`, {
        theme,
        themeMode: "manual",
      });

      console.log("Theme saved:", theme);
    } catch (error) {
      console.error("Theme save error:", error);
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