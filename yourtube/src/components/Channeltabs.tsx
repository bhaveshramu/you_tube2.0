"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";

const tabs = [
  { id: "home", label: "Home" },
  { id: "videos", label: "Videos" },
  { id: "shorts", label: "Shorts" },
  { id: "playlists", label: "Playlists" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" },
];

const Channeltabs = () => {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="border-b border-gray-200 px-4 dark:border-gray-800">
      <div className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`
                rounded-none
                border-b-2
                px-0
                py-4
                transition-colors
                ${
                  isActive
                    ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                    : "border-transparent text-gray-600 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-white"
                }
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default Channeltabs;