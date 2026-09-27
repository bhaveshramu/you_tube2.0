import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown,Languages, Flag, } from "lucide-react";
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  likes: number;
  dislikes: number;
  reports: number;
  reported: boolean;
  language?: string;
  location?: string;
  showLocation?: boolean;
  translatedText?: string;
}
const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [language, setLanguage] = useState("en");
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const fetchedComments = [
    {
      _id: "1",
      videoid: videoId,
      userid: "1",
      commentbody: "Great video! Really enjoyed watching this.",
      usercommented: "John Doe",
      commentedon: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: "2",
      videoid: videoId,
      userid: "2",
      commentbody: "Thanks for sharing this amazing content!",
      usercommented: "Jane Smith",
      commentedon: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div>Loading history...</div>;
  }
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        language,
        location,
        showLocation,
      });
      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: Date.now().toString(),
          videoid: videoId,
          userid: user._id || "",
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          reports: 0,
          reported: false,
          language,
          location,
          showLocation,
        };
        setComments((prev)=>[newCommentObj, ...comments]);
      }
      setNewComment("");
      setLanguage("en");
      setLocation("");
      setShowLocation(false);
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Something went wrong.");
      }
    }
  };
  const handleLike = async (id: string) => {
    try {
      const res = await axiosInstance.patch(`/comment/like/${id}`);

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === id ? res.data : comment
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async (id: string) => {
    try {
      const res = await axiosInstance.patch(`/comment/dislike/${id}`);

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === id ? res.data : comment
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
  const handleReport = async (id: string) => {
    try {
      await axiosInstance.patch(`/comment/report/${id}`);

      alert("Comment reported successfully.");
    } catch (error) {
      console.log(error);
    }
  };
  const handleTranslate = async (id: string) => {
  const language = prompt(
    "Enter language code:\n\nen = English\nhi = Hindi\nkn = Kannada\nta = Tamil\nte = Telugu\nml = Malayalam"
  );

  if (!language) return;

  try {
    console.log("Translating comment:", id);
    console.log("Target language:", language);

    const res = await axiosInstance.post(
      `/comment/translate/${id}`,
      {
        language: language.trim().toLowerCase(),
      }
    );

    console.log("Translation response:", res.data);

    if (!res.data?.translated) {
      alert("Translation service did not return translated text.");
      return;
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment._id === id
          ? {
              ...comment,
              translatedText: res.data.translated,
            }
          : comment
      )
    );
  } catch (error: any) {
    console.error("Translation error:", error);

    alert(
      error.response?.data?.message ||
      "Translation failed. Please check the backend."
    );
  }
};
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-3 mb-3">

              <label className="text-sm font-medium">
                Comment Language
              </label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border rounded-md p-2"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="ml">Malayalam</option>
              </select>

            </div>
            <div className="flex flex-col gap-2 mb-3">
              <label className="text-sm font-medium">
                Location (Optional)
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your city"
                className="border rounded-md p-2"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLocation}
                  onChange={(e) => setShowLocation(e.target.checked)}
                />
                Show my location publicly
              </label>
            </div>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm italic text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {comment.usercommented}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">

                      <p className="text-sm text-gray-900 dark:text-white">{comment.commentbody}</p>

                      {comment.translatedText && (
                        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-800">
                          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Translated
                          </p>

                          <p className="text-sm text-gray-900 dark:text-white">
                            {comment.translatedText}
                          </p>
                        </div>
                      )}
                      {comment.showLocation && comment.location && (
                        <p className="text-xs text-gray-500">
                          📍 {comment.location}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm mt-2">
                        <button
                          onClick={() => handleLike(comment._id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span> {comment.likes}</span>
                        </button>

                        <button
                          onClick={() => handleDislike(comment._id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span> {comment.dislikes}</span>
                        </button>

                        <button
                          onClick={() => handleTranslate(comment._id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <Languages className="w-4 h-4" />
                          <span>Translate</span>
                        </button>

                        <button
                          onClick={() => handleReport(comment._id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                        >
                          <Flag className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                    {comment.userid === user?._id && (
                      <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <button onClick={() => handleEdit(comment)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(comment._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
