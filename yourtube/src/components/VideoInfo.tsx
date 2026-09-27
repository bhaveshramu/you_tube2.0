import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleviews = async () => {
      try {
        if (user) {
          await axiosInstance.post(`/history/${video._id}`, {
            userId: user._id,
          });
        } else {
          await axiosInstance.post(`/history/views/${video._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    };

    handleviews();
  }, [user, video]);

  const handleLike = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: number) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: number) => prev + 1);
          setIsLiked(true);

          if (isDisliked) {
            setDislikes((prev: number) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: number) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: number) => prev + 1);
          setIsDisliked(true);

          if (isLiked) {
            setlikes((prev: number) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchLater = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user._id,
      });

      setIsWatchLater(res.data.watchlater);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      const res = await axiosInstance.post("/download/download", {
        userid: user._id,
        videoid: video._id,
        videotitle: video.videotitle,
        filepath: video.filepath,
      });

      if (res.data.success) {
        const link = document.createElement("a");

        link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${video.filepath}`;
        link.download = video.videotitle;

        link.click();

        alert("Download started.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Download failed.");
      }
    }
  };

  return (
    <div className="space-y-4 text-black dark:text-white">

      {/* TITLE */}
      <h1 className="text-lg sm:text-xl font-semibold leading-tight break-words">
        {video.videotitle}
      </h1>

      {/* CHANNEL + SUBSCRIBE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback>
              {video.videochanel?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="font-medium truncate">
              {video.videochanel}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              1.2M subscribers
            </p>
          </div>

          <Button className="ml-2 sm:ml-4 shrink-0">
            Subscribe
          </Button>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">

          {/* Like / Dislike */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full">

            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 ${isLiked
                    ? "fill-current text-black dark:text-white"
                    : ""
                  }`}
              />
              <span className="ml-2">
                {likes.toLocaleString()}
              </span>
            </Button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 px-3"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 ${isDisliked
                    ? "fill-current text-black dark:text-white"
                    : ""
                  }`}
              />
              <span className="ml-2">
                {dislikes.toLocaleString()}
              </span>
            </Button>

          </div>

          {/* Watch Later */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchLater}
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <Clock className="w-5 h-5 mr-2" />
            <span>Watch Later</span>
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <Share className="w-5 h-5 mr-2" />
            <span>Share</span>
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <Download className="w-5 h-5 mr-2" />
            <span>Download</span>
          </Button>

          {/* More */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>

        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-black dark:text-white">

        <div className="flex flex-wrap gap-3 text-sm font-medium mb-2">
          <span>
            {video.views.toLocaleString()} views
          </span>

          <span className="text-gray-600 dark:text-gray-400">
            {formatDistanceToNow(new Date(video.createdAt))} ago
          </span>
        </div>

        <div
          className={`text-sm ${showFullDescription ? "" : "line-clamp-3"
            }`}
        >
          <p>
            {video.description || "No description available."}
          </p>
        </div>
        {/* TAGS */}
        {video.tags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {video.tags
              .split(",")
              .map((tag: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium text-black dark:text-white hover:bg-transparent"
          onClick={() =>
            setShowFullDescription(!showFullDescription)
          }
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>

      </div>
    </div>
  );
};

export default VideoInfo;