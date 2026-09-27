"use client";

import { Check, FileVideo, Upload, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import axiosInstance from "@/lib/axiosinstance";

const VideoUploader = ({ channelId, channelName }: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoTags, setVideoTags] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  const handlefilechange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file.");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        toast.error("File size exceeds 100MB limit.");
        return;
      }

      setVideoFile(file);

      const filename = file.name;

      if (!videoTitle) {
        setVideoTitle(filename);
      }
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoTitle("");
    setVideoDescription("");
    setVideoTags("");
    setIsUploading(false);
    setUploadProgress(0);
    setUploadComplete(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelUpload = () => {
    if (isUploading) {
      uploadControllerRef.current?.abort();
      uploadControllerRef.current = null;

      setIsUploading(false);
      setUploadProgress(0);

      toast.info("Video upload cancelled.");
      return;
    }

    resetForm();
    toast.info("Video upload cancelled.");
  };

  const handleUpload = async () => {
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please provide file and title");
      return;
    }

    const formdata = new FormData();

    formdata.append("file", videoFile);
    formdata.append("videotitle", videoTitle);
    formdata.append("description", videoDescription);
    formdata.append("tags", videoTags);
    formdata.append("videochanel", channelName);
    formdata.append("uploader", channelId);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const controller = new AbortController();
      uploadControllerRef.current = controller;

      await axiosInstance.post("/video/upload", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        signal: controller.signal,

        onUploadProgress: (progressEvent: any) => {
          if (!progressEvent.total) return;

          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setUploadProgress(progress);
        },
      });

      toast.success("Upload successfully");

      resetForm();
    } catch (error: any) {
      if (
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED"
      ) {
        console.log("Video upload cancelled.");
        return;
      }

      console.error("Error uploading video:", error);

      toast.error(
        "There was an error uploading your video. Please try again."
      );
    } finally {
      uploadControllerRef.current = null;
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
      <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Upload a video
      </p>

      <div className="space-y-4">
        {!videoFile ? (
          <div
            className="
              cursor-pointer
              rounded-lg
              border-2
              border-dashed
              border-gray-300
              bg-gray-50
              p-8
              text-center
              transition-colors
              hover:bg-gray-100
              dark:border-gray-700
              dark:bg-gray-950
              dark:hover:bg-gray-800
            "
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-2 h-12 w-12 text-gray-400 dark:text-gray-500" />

            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drag and drop video files to upload
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              or click to select files
            </p>

            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              MP4, WebM, MOV or AVI • Up to 100MB
            </p>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handlefilechange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected video */}
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
              <div className="rounded-md bg-blue-100 p-2 dark:bg-blue-950">
                <FileVideo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">
                  {videoFile.name}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelUpload}
                  className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}

              {uploadComplete && (
                <div className="rounded-full bg-green-100 p-1 dark:bg-green-950">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>

            {/* Video information */}
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="title"
                  className="text-gray-900 dark:text-gray-200"
                >
                  Title (required)
                </Label>

                <Input
                  id="title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Add a title that describes your video"
                  disabled={isUploading || uploadComplete}
                  className="mt-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-gray-900 dark:text-gray-200"
                >
                  Description
                </Label>

                <textarea
                  id="description"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Tell viewers about your video"
                  disabled={isUploading || uploadComplete}
                  rows={4}
                  className="
                    mt-1
                    w-full
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2
                    text-sm
                    text-gray-900
                    shadow-sm
                    outline-none
                    placeholder:text-gray-400
                    focus-visible:ring-2
                    focus-visible:ring-ring
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    dark:border-gray-700
                    dark:bg-gray-950
                    dark:text-white
                    dark:placeholder:text-gray-500
                  "
                />
              </div>

              <div>
                <Label
                  htmlFor="tags"
                  className="text-gray-900 dark:text-gray-200"
                >
                  Tags
                </Label>

                <Input
                  id="tags"
                  value={videoTags}
                  onChange={(e) => setVideoTags(e.target.value)}
                  placeholder="coding, tutorial, technology"
                  disabled={isUploading || uploadComplete}
                  className="mt-1 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separate tags with commas
                </p>
              </div>
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>

                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              {!uploadComplete && (
                <>
                  <Button
                    onClick={cancelUpload}
                    disabled={uploadComplete}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleUpload}
                    disabled={
                      isUploading ||
                      !videoTitle.trim() ||
                      uploadComplete
                    }
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;