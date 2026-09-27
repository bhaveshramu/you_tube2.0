"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 md:h-48 lg:h-64" />

      {/* Channel Info */}
      <div className="px-4 py-6">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <Avatar className="h-20 w-20 md:h-32 md:w-32">
            <AvatarFallback className="text-2xl">
              {channel?.channelname?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {channel?.channelname}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                @
                {channel?.channelname
                  ?.toLowerCase()
                  .replace(/\s+/g, "") || "User"}
              </span>
            </div>

            {channel?.description && (
              <p className="max-w-2xl text-sm text-gray-700 dark:text-gray-300">
                {channel?.description}
              </p>
            )}
          </div>

          {user && user?._id !== channel?._id && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsSubscribed(!isSubscribed)}
                variant={isSubscribed ? "outline" : "default"}
                className={
                  isSubscribed
                    ? "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;