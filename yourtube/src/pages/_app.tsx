import Head from "next/head";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider, useUser } from "../lib/AuthContext";
import React, { useEffect, useState } from "react";

function AppContent({ Component, pageProps }: Pick<AppProps, "Component" | "pageProps">) {
  const { user } = useUser() as any;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // --------------------------------------------------
  // Load theme from localStorage when app starts
  // --------------------------------------------------
  useEffect(() => {
    setMounted(true);

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        const savedTheme =
          parsedUser?.theme === "dark" ? "dark" : "light";

        setTheme(savedTheme);
      } catch (error) {
        console.error("Error reading saved user:", error);
      }
    }
  }, []);

  // --------------------------------------------------
  // Keep theme synced with logged-in user
  // --------------------------------------------------
  useEffect(() => {
    if (!user?.theme) return;

    const userTheme =
      user.theme === "dark" ? "dark" : "light";

    setTheme(userTheme);
  }, [user?.theme]);

  // --------------------------------------------------
  // Listen for theme changes from Header/AuthContext
  // --------------------------------------------------
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent =
        event as CustomEvent<"dark" | "light">;

      const newTheme = customEvent.detail;

      setTheme(newTheme);
    };

    window.addEventListener(
      "yourtube-theme-change",
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        "yourtube-theme-change",
        handleThemeChange
      );
    };
  }, []);

  // --------------------------------------------------
  // Apply theme to <html>
  // --------------------------------------------------
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, mounted]);

  // --------------------------------------------------
  // Prevent hydration mismatch
  // --------------------------------------------------
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white" />
    );
  }

  return (
    <>
      <Head>
        <title>YourTube</title>

        <meta
          name="description"
          content="YourTube"
        />
      </Head>

      <div className="min-h-screen bg-background text-foreground">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <Toaster />

        <div className="flex min-w-0">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className="min-w-0 flex-1 overflow-x-hidden">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <AppContent
        Component={Component}
        pageProps={pageProps}
      />
    </UserProvider>
  );
}