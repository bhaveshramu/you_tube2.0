import video from "../Modals/video.js";
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import cloudinary from "../config/cloudinary.js";

const execFileAsync = promisify(execFile);

export const uploadvideo = async (req, res) => {
  if (!req.file) {
    return res.status(404).json({
      message: "Please upload an MP4 video file",
    });
  }

  try {
    const videoPath = req.file.path;

    // --------------------------------
    // Generate thumbnail directory
    // --------------------------------

    const thumbnailDir = path.join(
      "uploads",
      "thumbnails"
    );

    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, {
        recursive: true,
      });
    }

    const baseName = path.parse(
      req.file.filename
    ).name;

    const thumbnailFileName = `${baseName}.jpg`;

    const thumbnailPath = path.join(
      thumbnailDir,
      thumbnailFileName
    );

    // --------------------------------
    // Get video duration using ffprobe
    // --------------------------------

    let duration = 0;

    try {
      const { stdout } = await execFileAsync(
        "ffprobe",
        [
          "-v",
          "error",
          "-show_entries",
          "format=duration",
          "-of",
          "default=noprint_wrappers=1:nokey=1",
          videoPath,
        ]
      );

      duration = Number.parseFloat(
        stdout.trim()
      );

      if (!Number.isFinite(duration)) {
        duration = 0;
      }
    } catch (error) {
      console.error(
        "FFprobe duration error:",
        error
      );
    }

    // --------------------------------
    // Generate thumbnail using FFmpeg
    // --------------------------------

    try {
      await execFileAsync("ffmpeg", [
        "-y",
        "-ss",
        "00:00:01",
        "-i",
        videoPath,
        "-frames:v",
        "1",
        "-vf",
        "scale=640:-2",
        "-q:v",
        "2",
        thumbnailPath,
      ]);

      console.log(
        "Thumbnail generated:",
        thumbnailPath
      );
    } catch (error) {
      console.error(
        "FFmpeg thumbnail error:",
        error
      );
    }

    // --------------------------------
    // Upload VIDEO to Cloudinary
    // --------------------------------

    console.log(
      "Uploading video to Cloudinary..."
    );

    const videoUpload =
      await cloudinary.uploader.upload(
        videoPath,
        {
          resource_type: "video",
          folder: "yourtube/videos",
        }
      );

    console.log(
      "Video uploaded to Cloudinary:",
      videoUpload.secure_url
    );

    // --------------------------------
    // Upload THUMBNAIL to Cloudinary
    // --------------------------------

    let thumbnailUrl = "";
    let thumbnailUpload = null;

    if (fs.existsSync(thumbnailPath)) {
      console.log(
        "Uploading thumbnail to Cloudinary..."
      );

      thumbnailUpload =
        await cloudinary.uploader.upload(
          thumbnailPath,
          {
            resource_type: "image",
            folder: "yourtube/thumbnails",
          }
        );

      thumbnailUrl =
        thumbnailUpload.secure_url;

      console.log(
        "Thumbnail uploaded:",
        thumbnailUrl
      );
    }

    // --------------------------------
    // Save Cloudinary URLs in MongoDB
    // --------------------------------

    const file = new video({
      videotitle: req.body.videotitle,
      description: req.body.description || "",
      tags: req.body.tags || "",

      filename: req.file.originalname,

      // Cloudinary video URL
      filepath: videoUpload.secure_url,

      // Cloudinary thumbnail URL
      thumbnail: thumbnailUrl,

      duration,

      filetype: req.file.mimetype,

      filesize: req.file.size,

      videochanel: req.body.videochanel,

      uploader: req.body.uploader,
      videoPublicId: videoUpload.public_id,
      thumbnailPublicId: thumbnailUpload ? thumbnailUpload.public_id : "",
    });

    await file.save();

    // --------------------------------
    // Delete temporary local files
    // --------------------------------

    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    // --------------------------------
    // Response
    // --------------------------------

    return res.status(201).json({
      message:
        "File uploaded successfully",

      video: {
        duration,
        thumbnail: thumbnailUrl,
        filepath: videoUpload.secure_url,
      },
    });
  } catch (error) {
    console.error(
      "Upload error:",
      error
    );

    // Clean up temporary video
    if (
      req.file?.path &&
      fs.existsSync(req.file.path)
    ) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error(
          "Video cleanup error:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      message:
        "Something went wrong while uploading the video",
    });
  }
};

export const getallvideo = async (
  req,
  res
) => {
  try {
    const files = await video.find();

    return res
      .status(200)
      .send(files);
  } catch (error) {
    console.error(
      "Get videos error:",
      error
    );

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const deletevideo = async (req, res) => {
  const { id } = req.params;
  const { uploader } = req.body;

  try {
    if (!uploader) {
      return res.status(400).json({
        message: "Uploader ID is required",
      });
    }

    const existingVideo = await video.findById(id);

    if (!existingVideo) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    // Check ownership
    if (
      String(existingVideo.uploader) !==
      String(uploader)
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this video",
      });
    }

    // --------------------------------
    // Delete video from Cloudinary
    // --------------------------------

    if (existingVideo.videoPublicId) {
      try {
        await cloudinary.uploader.destroy(
          existingVideo.videoPublicId,
          {
            resource_type: "video",
          }
        );

        console.log(
          "Cloudinary video deleted:",
          existingVideo.videoPublicId
        );
      } catch (error) {
        console.error(
          "Cloudinary video deletion error:",
          error
        );
      }
    }

    // --------------------------------
    // Delete thumbnail from Cloudinary
    // --------------------------------

    if (existingVideo.thumbnailPublicId) {
      try {
        await cloudinary.uploader.destroy(
          existingVideo.thumbnailPublicId,
          {
            resource_type: "image",
          }
        );

        console.log(
          "Cloudinary thumbnail deleted:",
          existingVideo.thumbnailPublicId
        );
      } catch (error) {
        console.error(
          "Cloudinary thumbnail deletion error:",
          error
        );
      }
    }

    // --------------------------------
    // Delete temporary local files
    // --------------------------------

    if (
      existingVideo.filepath &&
      !existingVideo.filepath.startsWith(
        "http"
      )
    ) {
      const videoFilePath =
        path.resolve(
          existingVideo.filepath
        );

      if (fs.existsSync(videoFilePath)) {
        fs.unlinkSync(videoFilePath);
      }
    }

    if (
      existingVideo.thumbnail &&
      !existingVideo.thumbnail.startsWith(
        "http"
      )
    ) {
      const thumbnailPath =
        path.resolve(
          existingVideo.thumbnail
        );

      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // --------------------------------
    // Delete MongoDB record
    // --------------------------------

    await video.findByIdAndDelete(id);

    return res.status(200).json({
      message:
        "Video deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete video error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while deleting the video",
    });
  }
};