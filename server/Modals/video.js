import mongoose from "mongoose";
const videoSchema = mongoose.Schema(
  {
    videotitle: { type: String, required: true, },
    description: { type: String, default: "", },
    tags: { type: String, default: "", },
    filename: { type: String, required: true, },
    filetype: { type: String, required: true, },
    filepath: { type: String, required: true, },
    thumbnail: { type: String, default: "", },
    videoPublicId: { type: String, default: "", },
    thumbnailPublicId: { type: String, default: "", },
    duration: { type: Number, default: 0, },
    filesize: { type: String, required: true, },
    videochanel: { type: String, required: true, },
    Like: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    uploader: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("videofiles", videoSchema);
