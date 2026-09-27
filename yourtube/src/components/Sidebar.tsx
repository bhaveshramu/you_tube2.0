import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Crown,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

const Sidebar = ({isOpen, onClose}:{isOpen: boolean, onClose: () => void}) => {
  const { user } = useUser();
  const [isdialogeopen, setisdialogeopen] = useState(false);

  return (
    <aside
  className={`
    fixed md:static
    top-16 md:top-auto
    left-0
    z-50
    h-[calc(100vh-4rem)]
    md:h-auto
    w-64
    shrink-0
    bg-white text-black
    border-r
    p-2
    dark:bg-gray-900
    dark:text-white
    dark:border-gray-700
    transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `
} 
>
  {/* Mobile close button */}
<div className="flex justify-end md:hidden mb-2">
  <Button
    variant="ghost"
    size="icon"
    onClick={onClose}
  >
    ✕
  </Button>
</div>
      <nav className="space-y-1">

        {/* Home */}
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start px-2 md:px-3"
          >
            <Home className="w-5 h-5 md:mr-3 shrink-0" />

            <span>
              Home
            </span>
          </Button>
        </Link>

        {/* Explore */}
        <Button
          variant="ghost"
          className="w-full justify-start px-2 md:px-3"
          disabled
        >
          <Compass className="w-5 h-5 md:mr-3 shrink-0" />

          <span>
            Explore
          </span>
        </Button>

        {/* Subscriptions */}
        <Button
          variant="ghost"
          className="w-full justify-start px-2 md:px-3"
          disabled
        >
          <PlaySquare className="w-5 h-5 md:mr-3 shrink-0" />

          <span>
            Subscriptions
          </span>
        </Button>

        {user && (
          <div className="border-t pt-2 mt-2">

            {/* History */}
            <Link href="/history">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 md:px-3"
              >
                <History className="w-5 h-5 md:mr-3 shrink-0" />

                <span>
                  History
                </span>
              </Button>
            </Link>

            {/* Liked */}
            <Link href="/liked">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 md:px-3"
              >
                <ThumbsUp className="w-5 h-5 md:mr-3 shrink-0" />

                <span>
                  Liked videos
                </span>
              </Button>
            </Link>

            {/* Watch Later */}
            <Link href="/watch-later">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 md:px-3"
              >
                <Clock className="w-5 h-5 md:mr-3 shrink-0" />

                <span>
                  Watch later
                </span>
              </Button>
            </Link>

            {/* Channel */}
            {user?.channelname ? (
              <>
                <Link href={`/channel/${user._id}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 md:px-3"
                  >
                    <User className="w-5 h-5 md:mr-3 shrink-0" />

                    <span>
                      Your channel
                    </span>
                  </Button>
                </Link>

                {/* Upgrade */}
                <Link href="/subscription">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 md:px-3"
                  >
                    <Crown className="w-5 h-5 md:mr-3 shrink-0 text-yellow-500" />

                    <span>
                      Upgrade Plan
                    </span>
                  </Button>
                </Link>
              </>
            ) : (
              <div className="px-1 md:px-2 py-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setisdialogeopen(true)
                  }
                >
                  <span>
                    Create Channel
                  </span>

                  <User className="w-5 h-5 md:hidden" />
                </Button>
              </div>
            )}

          </div>
        )}
      </nav>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() =>
          setisdialogeopen(false)
        }
        mode="create"
      />
    </aside>
  );
};

export default Sidebar;