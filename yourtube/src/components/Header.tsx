import {
  Bell,
  Menu,
  Mic,
  Search,
  VideoIcon,
  Sun,
  Moon,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";

const Header = ({onMenuClick}:{onMenuClick: () => void}) => {
  const { user, logout, handlegooglesignin, changeTheme } =
    useUser();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [isdialogeopen, setisdialogeopen] =
    useState(false);

  const router = useRouter();

  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
    }
  };

  const handleKeypress = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <header
      className="
        h-16
        w-full
        flex
        items-center
        gap-2
        px-2 md:px-4
        border-b
        bg-white
        text-black
        dark:bg-gray-950
        dark:text-white
        dark:border-gray-800
      "
    >
      {/* Left section */}
      <div className="flex items-center shrink-0">
        {/*mobile menu*/}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden shrink-0 dark:text-white"
        >
          <Menu className="w-5 h-5" />
        </Button>
        {/*logo*/}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-1" />
          </div>

          <span className="text-xl font-normal text-black dark:text-white hidden sm:inline">
            YourTube
          </span>

          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
            IN
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center min-w-0">
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-2xl"
        >
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="
              h-10
        rounded-l-full
        rounded-r-none
        border
        border-gray-300
        border-r-0
        bg-white
        text-black
        focus-visible:ring-0
        focus-visible:ring-offset-0
        dark:bg-gray-800
        dark:text-white
        dark:border-gray-700
        dark:placeholder:text-gray-400
      "
          />

          <Button
            type="submit"
            variant="outline"
            className="
               h-10
        rounded-l-none
        rounded-r-full
        border
        border-gray-300
        bg-gray-50
        px-4
        dark:bg-gray-800
        dark:border-gray-700
        dark:text-white
        dark:hover:bg-gray-700
      "
          >
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Microphone */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex dark:text-white dark:hover:bg-gray-800"
        >
          <Mic className="w-5 h-5" />
        </Button>

        {user && (
          <>
            {/* Upload */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex dark:text-white dark:hover:bg-gray-800"
            >
              <VideoIcon className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex dark:text-white dark:hover:bg-gray-800"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                changeTheme(
                  user?.theme === "dark"
                    ? "light"
                    : "dark"
                )
              }
              className="dark:text-white dark:hover:bg-gray-800"
              title={
                user?.theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {user?.theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </>
        )}

        {/* User */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full p-1 dark:hover:bg-gray-800"
              >
                <Avatar className="w-8 h-8 md:w-9 md:h-9">
                  <AvatarImage
                    src={user.image}
                  />

                  <AvatarFallback>
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              {user?.channelname ? (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/channel/${user._id}`}
                  >
                    Your channel
                  </Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() =>
                    setisdialogeopen(true)
                  }
                >
                  Create Channel
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() =>
                  router.push("/history")
                }
              >
                History
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push("/liked")
                }
              >
                Liked videos
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  router.push("/watch-later")
                }
              >
                Watch later
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={handlegooglesignin}
            className="
              bg-blue-600
              text-white
              hover:bg-blue-700
              text-xs
              sm:text-sm
              px-2 sm:px-4
            "
          >
            Sign in
          </Button>
        )}
      </div>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() =>
          setisdialogeopen(false)
        }
        mode="create"
      />
    </header>
  );
};

export default Header;