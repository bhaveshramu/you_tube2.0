import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import {translate} from "@vitalets/google-translate-api";
import {containsBadWords,isSpam,hasRepeatedSpecialCharacters} from "../utils/commentFilter.js";
export const postcomment = async (req, res) => {
  const {
    commentbody,userid,videoid,usercommented,language,location,showLocation,
  } = req.body;
  if (!commentbody || commentbody.trim() === "") {
    return res.status(400).json({
      message: "Comment cannot be empty.",
    });
  }
  
  if (containsBadWords(commentbody)) {
    return res.status(400).json({
      message: "Comment contains inappropriate language.",
    });
  }

  if (isSpam(commentbody)) {
    return res.status(400).json({
      message: "Spam comments are not allowed.",
    });
  }
  
  if (hasRepeatedSpecialCharacters(commentbody)) {
    return res.status(400).json({
      message: "Comment contains repeated special characters.",
    });
  }
  const newComment = new comment({
    userid,videoid,commentbody,usercommented,language,location,showLocation,
  });

  try {
    await newComment.save();
    return res.status(200).json({
      comment: true,
      message: "Comment posted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    res.status(200).json(updatecomment);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const likeComment = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedComment = await comment.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


export const dislikeComment = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedComment = await comment.findByIdAndUpdate(
      id,
      { $inc: { dislikes: 1 } },
      { new: true }
    );

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


export const reportComment = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedComment = await comment.findByIdAndUpdate(
      id,
      {
        $inc: { reports: 1 },
        $set: { reported: true },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Comment reported successfully.",
      comment: updatedComment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};
export const translateComment = async (req, res) => {
  const { id } = req.params;
  const { language } = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        message: "Comment ID is required",
      });
    }

    if (!language) {
      return res.status(400).json({
        message: "Target language is required",
      });
    }

    const existingComment = await comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    console.log("Original comment:", existingComment.commentbody);
    console.log("Target language:", language);

    const result = await translate(existingComment.commentbody, {
      to: language,
    });

    console.log("Translated text:", result.text);

    return res.status(200).json({
      translated: result.text,
      language,
    });

  } catch (error) {
    console.error("Translation error:", error);

    return res.status(500).json({
      message: "Translation failed",
      error: error.message,
    });
  }
};