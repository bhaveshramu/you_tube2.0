import mongoose from "mongoose";

const downloadSchema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    videotitle: {
      type: String,
      required: true,
    },

    filepath: {
      type: String,
      required: true,
    },

    userPlan: {
      type: String,
      default: "Free",
    },

    downloadCount: {
      type: Number,
      default: 1,
    },

    downloadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("download", downloadSchema);