"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Movies",
  "News",
  "Sports",
  "Technology",
  "Comedy",
  "Education",
  "Science",
  "Travel",
  "Food",
  "Fashion",
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="w-full min-w-0 overflow-hidden">
    <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          className="shrink-0"
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
    </div>
  );
}
