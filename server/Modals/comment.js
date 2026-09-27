import mongoose from "mongoose";
const commentschema = mongoose.Schema(
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
    commentbody: { type: String },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },

    //task 1
    language:{
      type:String, default:"",
    },
    location:{
      type:String, default:"",
    },
    showLocation:{
      type:Boolean, default:false
    },
    likes:{
      type:"Number", default:0,
    },
    dislikes: {
      type: Number, default: 0,
    },

    reports: {
      type: Number, default: 0,
    },

    reported: {
      type: Boolean, default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentschema);
