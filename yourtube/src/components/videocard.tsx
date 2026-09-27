"use client";

import { useUser } from "@/lib/AuthContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import axiosInstance from "@/lib/axiosinstance";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Supports both:
// 1. Old local files: uploads/video.mp4
// 2. New Cloudinary files: https://res.cloudinary.com/...
const getFileUrl = (filePath: string | undefined) => {
  if (!filePath) return null;

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  return `${BACKEND_URL}/${filePath.replace(/\\/g, "/")}`;
};

const formatDuration = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default function VideoCard({
  video,
  onDelete,
  showDelete = false,
}: any) {
  const { user } = useUser();

  const thumbnailUrl = getFileUrl(video?.thumbnail);
  const videoUrl = getFileUrl(video?.filepath);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${video?.videotitle}"?`
    );

    if (!confirmed) {
      return;
    }

    if (!user?._id) {
      alert("Please login first.");
      return;
    }

    try {
      await axiosInstance.delete(`/video/${video._id}`, {
        data: {
          uploader: user._id,
        },
      });

      alert("Video deleted successfully.");

      if (onDelete) {
        onDelete(video._id);
      }
    } catch (error: any) {
      console.error("Delete video error:", error);

      if (error?.response?.status === 403) {
        alert("You can only delete your own videos.");
      } else {
        alert("Failed to delete video. Please try again.");
      }
    }
  };

  return (
    <div className="group overflow-hidden rounded-lg bg-white dark:bg-gray-900">
      <Link href={`/watch/${video?._id}`}>
        <div className="space-y-3">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={video?.videotitle}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : videoUrl ? (
              <video
                src={videoUrl}
                preload="metadata"
                muted
                className="h-full w-full object-cover"
              />
            ) : null}

            {/* Duration */}
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
              {formatDuration(Number(video?.duration))}
            </div>
          </div>

          {/* Video information */}
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback>
                {video?.videochanel?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-medium group-hover:text-blue-500">
                {video?.videotitle}
              </h3>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {video?.videochanel}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Number(video?.views || 0).toLocaleString()} views •{" "}
                {video?.createdAt
                  ? formatDistanceToNow(new Date(video.createdAt))
                  : "just now"}{" "}
                ago
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete button */}
      {showDelete && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}