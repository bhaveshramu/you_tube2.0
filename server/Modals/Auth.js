import mongoose from "mongoose";

const userschema = new mongoose.Schema({
  email: { type: String, required: true, unique:true, index:true, },
  name: String,
  channelname: String,
  description: String,
  image: String,
  joinedon: {
    type: Date,
    default: Date.now,
  },
  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free",
  },
  theme: {
  type: String,
  enum: ["light", "dark"],
  default: "light",
},

themeMode:{
  type: String,
  enum: ["auto","manual"],
  default: "auto",
},

city: {
  type: String,
  default: "",
},

state: {
  type: String,
  default: "",
},

deviceId: {
  type: String,
  default: "",
},
});

export default mongoose.models.user ??
  mongoose.model("user", userschema);